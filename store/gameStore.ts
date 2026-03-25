// ─────────────────────────────────────────────
//  The Happiness Index — Game Store
//  Source of truth: docs/11-balance-values.md
//  Runtime order:   docs/12-state-flow.md
// ─────────────────────────────────────────────

import { create } from 'zustand'
import type {
  GameState,
  MetricSet,
  HiddenValueSet,
  District,
  Phase,
  StageId,
  ActiveIncident,
  PendingEffect,
  FeedbackPayload,
  EndingRecord,
} from '@/types'
import { DISTRICTS } from '@/data/districts'
import { simulateTurn, drawPolicyHand } from '@/lib/turnEngine'
import { getIncidentsAvailableAtTurn } from '@/data/incidents'

function weightedPick<T extends { weight: number }>(pool: T[], count: number): T[] {
  const selected: T[] = []
  const remaining = [...pool]
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((s, item) => s + item.weight, 0)
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

// ── Starting values (docs/11-balance-values.md) ──

const INITIAL_METRICS: MetricSet = {
  happinessIndex: 62,
  productivity: 58,
  safety: 57,
  stress: 42,
  publicTrust: 60,
}

const INITIAL_HIDDEN: HiddenValueSet = {
  freedom: 80,
  hope: 85,
  creativity: 85,
  socialVitality: 90,
}

function initialDistricts(): District[] {
  return DISTRICTS.map((d) => ({ ...d }))
}

function buildInitialState(): GameState {
  return {
    turn: 1,
    maxTurns: 12,
    phase: 'early',
    stage: 1,
    status: 'playing',

    governanceCapacity: 5,
    remainingCapacity: 5,
  controlPressure: 0,
  compliance: 35,

    metrics: { ...INITIAL_METRICS },
    hiddenValues: { ...INITIAL_HIDDEN },

    districts: initialDistricts(),

    activeIncidents: [],

    policyHandIds: [],
    availablePolicyIds: [],
    selectedPolicyIds: [],

    pendingEffects: [],

    lastFeedback: null,
    ending: null,
  }
}

function buildSeededInitialState(): GameState {
  const base = buildInitialState()
  base.policyHandIds = drawPolicyHand(1, [])
  const pool = getIncidentsAvailableAtTurn(1, [])
  const picked = weightedPick(pool, 2)
  base.activeIncidents = picked.map((inc) => ({
    incidentId: inc.id,
    unresolvedTurns: 0,
    escalated: false,
  }))
  return base
}

// ── Store interface ───────────────────────────

type GameStore = GameState & {
  // ── Selection actions ────────────────────────
  selectPolicy: (id: string) => void
  deselectPolicy: (id: string) => void
  clearSelection: () => void

  // ── Hand management ──────────────────────────
  setHand: (ids: string[]) => void
  setAvailablePolicies: (ids: string[]) => void

  // ── Primary turn action ──────────────────────
  endTurn: () => void

  // ── Simulation update ────────────────────────
  applyMetricDeltas: (deltas: Partial<MetricSet>) => void
  applyHiddenDeltas: (deltas: Partial<HiddenValueSet>) => void
  setActiveIncidents: (incidents: ActiveIncident[]) => void
  setPendingEffects: (effects: PendingEffect[]) => void
  setRemainingCapacity: (value: number) => void
  setTurn: (turn: number) => void
  setPhase: (phase: Phase) => void
  setStage: (stage: StageId) => void
  setStatus: (status: GameState['status']) => void
  setLastFeedback: (payload: FeedbackPayload) => void
  setEnding: (ending: EndingRecord) => void
  setDistricts: (districts: District[]) => void

  // ── Full state replacement (used by turn engine) ──
  applyTurnResult: (next: Partial<GameState>) => void

  // ── Reset ────────────────────────────────────
  resetGame: () => void
}

// ── Clamp helper ──────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function clampMetrics(m: MetricSet): MetricSet {
  return {
    happinessIndex: clamp(m.happinessIndex),
    productivity: clamp(m.productivity),
    safety: clamp(m.safety),
    stress: clamp(m.stress),
    publicTrust: clamp(m.publicTrust),
  }
}

function clampHidden(h: HiddenValueSet): HiddenValueSet {
  return {
    freedom: clamp(h.freedom),
    hope: clamp(h.hope),
    creativity: clamp(h.creativity),
    socialVitality: clamp(h.socialVitality),
  }
}

// ── Store ─────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  ...buildInitialState(),

  // ── Selection ────────────────────────────────

  selectPolicy(id) {
    const state = get()
    if (state.selectedPolicyIds.includes(id)) return
    if (state.selectedPolicyIds.length >= 2) return

    // Check capacity — find policy cost from available hand
    // (turn engine validates definitively; store does lightweight guard)
    set((s) => ({ selectedPolicyIds: [...s.selectedPolicyIds, id] }))
  },

  deselectPolicy(id) {
    set((s) => ({
      selectedPolicyIds: s.selectedPolicyIds.filter((p) => p !== id),
    }))
  },

  clearSelection() {
    set({ selectedPolicyIds: [] })
  },

  // ── Hand management ──────────────────────────

  setHand(ids) {
    set({ policyHandIds: ids })
  },

  setAvailablePolicies(ids) {
    set({ availablePolicyIds: ids })
  },

  // ── Primary turn action ───────────────────────

  endTurn() {
    const currentState = get()
    if (currentState.status !== 'playing') return

    // Draw initial hand for first turn if empty
    if (currentState.policyHandIds.length === 0) {
      const hand = drawPolicyHand(currentState.turn, [])
      set({ policyHandIds: hand })
    }

    const nextState = simulateTurn(get())
    set(nextState)
  },

  // ── Metric / hidden updates ───────────────────

  applyMetricDeltas(deltas) {
    set((s) => {
      const next = { ...s.metrics }
      for (const key of Object.keys(deltas) as (keyof MetricSet)[]) {
        if (deltas[key] !== undefined) {
          next[key] = next[key] + (deltas[key] as number)
        }
      }
      return { metrics: clampMetrics(next) }
    })
  },

  applyHiddenDeltas(deltas) {
    set((s) => {
      const next = { ...s.hiddenValues }
      for (const key of Object.keys(deltas) as (keyof HiddenValueSet)[]) {
        if (deltas[key] !== undefined) {
          next[key] = next[key] + (deltas[key] as number)
        }
      }
      return { hiddenValues: clampHidden(next) }
    })
  },

  // ── Individual setters ────────────────────────

  setActiveIncidents(incidents) {
    set({ activeIncidents: incidents })
  },

  setPendingEffects(effects) {
    set({ pendingEffects: effects })
  },

  setRemainingCapacity(value) {
    set({ remainingCapacity: clamp(value, 0, 5) })
  },

  setTurn(turn) {
    set({ turn })
  },

  setPhase(phase) {
    set({ phase })
  },

  setStage(stage) {
    set({ stage })
  },

  setStatus(status) {
    set({ status })
  },

  setLastFeedback(payload) {
    set({ lastFeedback: payload })
  },

  setEnding(ending) {
    set({ ending })
  },

  setDistricts(districts) {
    set({ districts })
  },

  // ── Batch update from turn engine ─────────────

  applyTurnResult(next) {
    set((s) => ({
      ...s,
      ...next,
      metrics: next.metrics ? clampMetrics(next.metrics) : s.metrics,
      hiddenValues: next.hiddenValues ? clampHidden(next.hiddenValues) : s.hiddenValues,
    }))
  },

  // ── Reset ─────────────────────────────────────

  resetGame() {
    set(buildSeededInitialState())
  },
}))
