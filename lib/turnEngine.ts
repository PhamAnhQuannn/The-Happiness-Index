// ─────────────────────────────────────────────
//  The Happiness Index — Turn Engine
//  Canonical simulation order: docs/12-state-flow.md
//  Rules: docs/03-rules-systems.md
//  Numbers: docs/11-balance-values.md
// ─────────────────────────────────────────────

import type {
  GameState,
  MetricSet,
  HiddenValueSet,
  ActiveIncident,
  PendingEffect,
  Phase,
} from '@/types'
import { POLICIES, getPolicyById } from '@/data/policies'
import {
  INCIDENTS,
  getIncidentsAvailableAtTurn,
} from '@/data/incidents'
import { computeStage, applyStageToDistricts } from '@/lib/stageEngine'
import { checkFailure, checkWin, buildEndingRecord } from '@/lib/endingEngine'
import { generateFeedback } from '@/lib/feedbackEngine'

// ── Constants ────────────────────────────────

const GOVERNANCE_CAPACITY = 5
const HAND_SIZE = 3
const MAX_POLICIES_PER_TURN = 2
const BASELINE_RESPONSE_ID = 'POL-01'

// Incident count per phase (docs/11-balance-values.md)
const INCIDENT_COUNT: Record<Phase, number> = {
  early: 2,
  mid: 3,
  late: 2,
}

// ── Helpers ───────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

function applyDeltasToMetrics(
  metrics: MetricSet,
  deltas: Partial<MetricSet>
): MetricSet {
  const next = { ...metrics }
  for (const key of Object.keys(deltas) as (keyof MetricSet)[]) {
    if (deltas[key] !== undefined) {
      next[key] = clamp(next[key] + (deltas[key] as number))
    }
  }
  return next
}

function applyDeltasToHidden(
  hidden: HiddenValueSet,
  deltas: Partial<HiddenValueSet>
): HiddenValueSet {
  const next = { ...hidden }
  for (const key of Object.keys(deltas) as (keyof HiddenValueSet)[]) {
    if (deltas[key] !== undefined) {
      // Cap recovery at +3 per turn per key (docs/11-balance-values.md)
      const delta = deltas[key] as number
      const capped = delta > 0 ? Math.min(delta, 3) : delta
      next[key] = clamp(next[key] + capped)
    }
  }
  return next
}

function derivePhase(turn: number): Phase {
  if (turn <= 4) return 'early'
  if (turn <= 8) return 'mid'
  return 'late'
}

function isCoercivePolicy(id: string): boolean {
  return getPolicyById(id)?.specialRules?.includes('coercive') ?? false
}

function raisesCompliance(id: string): boolean {
  return getPolicyById(id)?.specialRules?.includes('raises-compliance') ?? false
}

function districtsAreStable(state: GameState): boolean {
  return state.districts.every((d) =>
    ['managed', 'optimized', 'hopeful', 'alive', 'active'].includes(d.conditionTag)
  )
}

function applyHiddenPenaltyBands(
  hiddenValues: HiddenValueSet,
  controlPressure: number
): Partial<MetricSet> {
  const deltas: Partial<MetricSet> = {}

  if (hiddenValues.socialVitality <= 20) {
    deltas.happinessIndex = (deltas.happinessIndex ?? 0) - 2
  } else if (hiddenValues.socialVitality <= 45) {
    deltas.happinessIndex = (deltas.happinessIndex ?? 0) - 1
  }

  if (hiddenValues.hope <= 20) {
    deltas.stress = (deltas.stress ?? 0) + 2
  }

  if (hiddenValues.freedom <= 20) {
    deltas.publicTrust = (deltas.publicTrust ?? 0) - 2
  } else if (hiddenValues.freedom <= 45) {
    deltas.publicTrust = (deltas.publicTrust ?? 0) - 1
  }

  if (controlPressure >= 3) {
    deltas.publicTrust = (deltas.publicTrust ?? 0) - 1
  }

  return deltas
}

/**
 * Compute dynamic weight modifiers for an incident based on current game state.
 * Higher weight = more likely to be drawn this turn.
 * Docs: docs/03-rules-systems.md §Incident Weighting
 */
function incidentWeightModifier(
  inc: { id: string; district: string; hiddenCauses: string[] },
  hiddenValues: HiddenValueSet,
  controlPressure: number,
  districts: GameState['districts']
): number {
  let bonus = 0

  // District condition modifier: strained/collapsed districts surface incidents faster
  const districtObj = districts.find((d) => d.id === inc.district)
  if (districtObj) {
    const tag = districtObj.conditionTag
    if (['hollow', 'vacant'].includes(tag)) bonus += 4
    else if (['strained', 'backlogged', 'brittle', 'thinned'].includes(tag)) bonus += 2
  }

  // Hidden value resonance: if this incident's hidden cause is already low, it's more likely
  for (const cause of inc.hiddenCauses) {
    const val = hiddenValues[cause as keyof HiddenValueSet]
    if (val !== undefined) {
      if (val <= 20) bonus += 3
      else if (val <= 40) bonus += 1
    }
  }

  // Control pressure amplifies civil unrest / misinformation / resistance incidents
  const resistanceIds = ['INC-02', 'INC-06', 'INC-07', 'INC-08', 'INC-10']
  if (controlPressure >= 5 && resistanceIds.includes(inc.id)) bonus += 3
  else if (controlPressure >= 3 && resistanceIds.includes(inc.id)) bonus += 1

  return bonus
}

/**
 * Weighted random selection without replacement.
 * Picks `count` incidents from pool using weight values.
 */
function weightedPick<T extends { weight: number }>(
  pool: T[],
  count: number
): T[] {
  const selected: T[] = []
  const remaining = [...pool]

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0)
    let rand = Math.random() * totalWeight
    const idx = remaining.findIndex((item) => {
      rand -= item.weight
      return rand <= 0
    })
    if (idx >= 0) {
      selected.push(remaining[idx])
      remaining.splice(idx, 1)
    }
  }

  return selected
}

// ── Validation ────────────────────────────────

/**
 * Returns true if the selection is valid:
 * - max 2 policies
 * - total cost ≤ remaining capacity
 * - all IDs exist and are unlocked for this turn
 */
export function validatePolicySelection(
  selectedIds: string[],
  turn: number,
  capacity: number,
  state?: GameState
): { valid: boolean; reason?: string } {
  if (selectedIds.length > MAX_POLICIES_PER_TURN) {
    return { valid: false, reason: `Maximum ${MAX_POLICIES_PER_TURN} policies per turn.` }
  }

  let totalCost = 0
  for (const id of selectedIds) {
    const policy = getPolicyById(id)
    if (!policy) return { valid: false, reason: `Unknown policy: ${id}` }
    if (policy.unlockTurn > turn) return { valid: false, reason: `${policy.name} not yet unlocked.` }
    if (id === 'POL-16' && state) {
      if (state.controlPressure < 4) {
        return { valid: false, reason: 'System Completion requires Control Pressure 4+.' }
      }
      if (!districtsAreStable(state)) {
        return { valid: false, reason: 'System Completion requires all districts stable.' }
      }
    }
    totalCost += policy.cost
  }

  if (totalCost > capacity) {
    return { valid: false, reason: `Total cost ${totalCost} exceeds capacity ${capacity}.` }
  }

  return { valid: true }
}

// ── Draw policy hand ──────────────────────────

export function drawPolicyHand(turn: number, previousHandIds: string[] = []): string[] {
  const available = POLICIES.filter(
    (p) => p.unlockTurn <= turn && p.id !== BASELINE_RESPONSE_ID
  )

  if (available.length <= HAND_SIZE) {
    return [BASELINE_RESPONSE_ID, ...available.map((p) => p.id)]
  }

  // Shuffle and pick — prefer policies not in last hand for variety
  const fresh = available.filter((p) => !previousHandIds.includes(p.id))
  const stale = available.filter((p) => previousHandIds.includes(p.id))

  const pool = [...fresh, ...stale]
  const picked: string[] = []
  const indices = new Set<number>()

  while (picked.length < HAND_SIZE && indices.size < pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    if (!indices.has(idx)) {
      indices.add(idx)
      picked.push(pool[idx].id)
    }
  }

  return [BASELINE_RESPONSE_ID, ...picked]
}

// ── Main: simulate one full turn ─────────────

export function simulateTurn(prevState: GameState): GameState {
  // Guard: do not simulate if game already ended
  if (prevState.status !== 'playing') return prevState

  const turn = prevState.turn
  const phase = derivePhase(turn)
  const prevStage = prevState.stage

  // ── Step 2: Restore Governance Capacity ─────
  let remainingCapacity = GOVERNANCE_CAPACITY

  // ── Step 3: Carry over unresolved incidents ──
  const carriedIncidents: ActiveIncident[] = prevState.activeIncidents.map(
    (ai) => ({
      ...ai,
      unresolvedTurns: ai.unresolvedTurns + 1,
      escalated:
        ai.escalated ||
        (() => {
          const inc = INCIDENTS.find((i) => i.id === ai.incidentId)
          return inc?.escalationTurns != null
            ? ai.unresolvedTurns + 1 >= inc.escalationTurns
            : false
        })(),
    })
  )

  // ── Step 4: Generate new incidents ───────────
  const existingIds = carriedIncidents.map((ai) => ai.incidentId)
  const rawPool = getIncidentsAvailableAtTurn(turn, existingIds).filter(
    (inc) =>
      inc.canRepeat || !prevState.activeIncidents.some((ai) => ai.incidentId === inc.id)
  )

  // Apply dynamic weight modifiers based on current game state
  const pool = rawPool.map((inc) => ({
    ...inc,
    weight: inc.weight + incidentWeightModifier(
      inc,
      prevState.hiddenValues,
      prevState.controlPressure,
      prevState.districts
    ),
  }))

  const targetCount = INCIDENT_COUNT[phase]
  const newCount = Math.max(0, targetCount - carriedIncidents.length)
  const newIncidentDefs = weightedPick(pool, newCount)

  const newIncidents: ActiveIncident[] = newIncidentDefs.map((inc) => ({
    incidentId: inc.id,
    unresolvedTurns: 0,
    escalated: false,
  }))

  const allActiveIncidents: ActiveIncident[] = [...carriedIncidents, ...newIncidents]

  // ── Step 5: Draw policy hand ─────────────────
  const hand = drawPolicyHand(turn, prevState.policyHandIds)

  // ── Step 6: Selection is done by the player (in store) before simulateTurn is called ──
  const selectedIds = prevState.selectedPolicyIds
  const validation = validatePolicySelection(selectedIds, turn, remainingCapacity, prevState)
  if (!validation.valid) {
    // Silently clear invalid selection (UI should have prevented this)
    prevState = { ...prevState, selectedPolicyIds: [] }
  }

  // ── Aggregate deltas ─────────────────────────
  const totalMetricDeltas: Partial<MetricSet> = {}
  const totalHiddenDeltas: Partial<HiddenValueSet> = {}
  let nextControlPressure = prevState.controlPressure
  let nextCompliance = prevState.compliance

  const addMetricDelta = (deltas: Partial<MetricSet>) => {
    for (const key of Object.keys(deltas) as (keyof MetricSet)[]) {
      totalMetricDeltas[key] = (totalMetricDeltas[key] ?? 0) + (deltas[key] ?? 0)
    }
  }

  const addHiddenDelta = (deltas: Partial<HiddenValueSet>) => {
    for (const key of Object.keys(deltas) as (keyof HiddenValueSet)[]) {
      totalHiddenDeltas[key] = (totalHiddenDeltas[key] ?? 0) + (deltas[key] ?? 0)
    }
  }

  // ── Step 7: Apply ignored-incident drains ────
  // Drains are applied before policy recovery so pressure is always felt
  // Escalated incidents apply a 1.5× drain multiplier (rounded)
  const unresolved = allActiveIncidents.filter(
    (ai) => !selectedIds.some((sid) => {
      const policy = getPolicyById(sid)
      return policy?.resolvedIncidentIds.includes(ai.incidentId)
    })
  )

  for (const ai of unresolved) {
    const inc = INCIDENTS.find((i) => i.id === ai.incidentId)
    if (inc) {
      if (ai.escalated) {
        // Escalated: multiply each drain by 1.5 (round toward zero for safety)
        const escalatedDeltas: Partial<MetricSet> = {}
        for (const key of Object.keys(inc.visibleImpactIfIgnored) as (keyof MetricSet)[]) {
          const base = inc.visibleImpactIfIgnored[key] ?? 0
          escalatedDeltas[key] = Math.round(base * 1.5)
        }
        addMetricDelta(escalatedDeltas)
      } else {
        addMetricDelta(inc.visibleImpactIfIgnored)
      }
    }
  }

  // ── Step 8: Apply immediate policy effects ───
  const usedCost: Record<string, number> = {}
  const resolvedIncidentIds: string[] = []
  const pendingToAdd: PendingEffect[] = []

  for (const sid of selectedIds) {
    const policy = getPolicyById(sid)
    if (!policy) continue

    usedCost[sid] = policy.cost
    remainingCapacity -= policy.cost

    addMetricDelta(policy.immediateEffects)
    addHiddenDelta(policy.hiddenImpact)

  if (isCoercivePolicy(sid)) nextControlPressure += 1
  if (raisesCompliance(sid)) nextCompliance += sid === 'POL-16' ? 15 : 6

    // Track resolved incidents
    resolvedIncidentIds.push(...policy.resolvedIncidentIds)

    // Schedule delayed effects
    for (const delayed of policy.delayedEffects) {
      pendingToAdd.push({
        sourcePolicyId: policy.id,
        applyOnTurn: turn + (delayed.applyOnTurn - policy.unlockTurn > 0
          ? delayed.applyOnTurn - policy.unlockTurn
          : 1),
        metricDeltas: delayed.metricDeltas,
        hiddenDeltas: delayed.hiddenDeltas,
        description: delayed.description,
      })
    }
  }

  // ── Step 9: Resolve incidents ────────────────
  const escalatedIds: string[] = []
  const remainingIncidents = allActiveIncidents.filter((ai) => {
    if (resolvedIncidentIds.includes(ai.incidentId)) return false
    if (ai.escalated) escalatedIds.push(ai.incidentId)
    return true
  })

  // ── Step 10: Apply delayed effects due this turn ─
  const consumedPendingIds: number[] = []
  const passedPending: PendingEffect[] = [
    ...prevState.pendingEffects,
    ...pendingToAdd,
  ]

  for (let i = 0; i < passedPending.length; i++) {
    const pe = passedPending[i]
    if (pe.applyOnTurn === turn) {
      if (pe.metricDeltas) addMetricDelta(pe.metricDeltas)
      if (pe.hiddenDeltas) addHiddenDelta(pe.hiddenDeltas)
      consumedPendingIds.push(i)
    }
  }

  const remainingPending = passedPending.filter(
    (_, i) => !consumedPendingIds.includes(i)
  )

  // ── Step 11: Apply all accumulated deltas ────
  const metrics = applyDeltasToMetrics(prevState.metrics, totalMetricDeltas)
  const hiddenValues = applyDeltasToHidden(prevState.hiddenValues, totalHiddenDeltas)
  const metricsAfterPenaltyBands = applyDeltasToMetrics(
    metrics,
    applyHiddenPenaltyBands(hiddenValues, nextControlPressure)
  )

  // ── Step 12: Update atmosphere stage ─────────
  const isSystemCompletion = selectedIds.includes('POL-16')
  const newStage = computeStage(prevStage, turn, hiddenValues, nextControlPressure, isSystemCompletion)
  const updatedDistricts = applyStageToDistricts(prevState.districts, newStage, hiddenValues, nextControlPressure)

  // ── Step 13: Generate feedback ───────────────
  const feedback = generateFeedback(
    turn,
    newStage,
    prevStage,
    totalMetricDeltas,
    totalHiddenDeltas,
    resolvedIncidentIds,
    escalatedIds
  )

  // ── Step 14: Run failure + win checks ─────────
  const partialState: GameState = {
    ...prevState,
    turn,
    phase,
    stage: newStage,
    remainingCapacity,
  controlPressure: clamp(nextControlPressure),
  compliance: clamp(nextCompliance),
  metrics: metricsAfterPenaltyBands,
    hiddenValues,
    districts: updatedDistricts,
    activeIncidents: remainingIncidents,
    pendingEffects: remainingPending,
    policyHandIds: hand,
    selectedPolicyIds: [],
    lastFeedback: feedback,
    ending: null,
  }

  const failCheck = checkFailure(partialState)
  if (failCheck.failed) {
    const ending = buildEndingRecord(partialState, 'lost', failCheck.reason)
    return { ...partialState, status: 'lost', ending }
  }

  // Win check only on final turn (or if system-completion card used)
  if (turn >= prevState.maxTurns || isSystemCompletion) {
    const winCheck = checkWin(partialState)
    if (winCheck.won) {
      const ending = buildEndingRecord(partialState, winCheck.status)
      return { ...partialState, status: winCheck.status, ending }
    }
    // Final turn with metrics not meeting win thresholds = loss
    const ending = buildEndingRecord(partialState, 'lost', 'cascading-instability')
    return { ...partialState, status: 'lost', ending }
  }

  // ── Step 15: Advance turn ────────────────────
  return {
    ...partialState,
    turn: turn + 1,
    phase: derivePhase(turn + 1),
    remainingCapacity: GOVERNANCE_CAPACITY,
  }
}
