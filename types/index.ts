// ─────────────────────────────────────────────
//  The Happiness Index — Shared Type Contracts
//  Source of truth: docs/10-data-model.md
//  Canonical numbers: docs/11-balance-values.md
// ─────────────────────────────────────────────

// ── Primitive keys ────────────────────────────

export type MetricKey =
  | 'happinessIndex'
  | 'productivity'
  | 'safety'
  | 'stress'
  | 'publicTrust'

export type HiddenKey =
  | 'freedom'
  | 'hope'
  | 'creativity'
  | 'socialVitality'

export type DistrictId =
  | 'residential'
  | 'industrial'
  | 'education'
  | 'cultural'
  | 'transit'

export type Phase = 'early' | 'mid' | 'late'

// 1 = Managed Normalcy  2 = Regulated Order
// 3 = Efficient Silence  4 = Quiet Utopia
export type StageId = 1 | 2 | 3 | 4

export type GameStatus =
  | 'playing'
  | 'won-utopia'        // all metrics hit success thresholds (clean win)
  | 'won-quiet-utopia'  // metrics hit thresholds but Social Vitality ≤ 20
  | 'lost'

export type EndingProfile =
  | 'utopia-achieved'
  | 'quiet-utopia'
  | 'sterile-stability'
  | 'managed-survival'

export type LossReason =
  | 'trust-collapse'
  | 'stress-crisis'
  | 'safety-failure'
  | 'cascading-instability'
  | null

// ── Value sets ────────────────────────────────

export type MetricSet = {
  happinessIndex: number
  productivity: number
  safety: number
  stress: number     // inverse-good: higher is worse
  publicTrust: number
}

export type HiddenValueSet = {
  freedom: number
  hope: number
  creativity: number
  socialVitality: number  // primary decay driver
}

export type DistrictConditionTag =
  | 'managed' | 'strained' | 'hollow'
  | 'optimized' | 'backlogged' | 'brittle'
  | 'hopeful' | 'standardized' | 'stagnant'
  | 'alive' | 'thinned' | 'vacant'
  | 'active' | 'orderly' | 'frictionless'

// ── District ─────────────────────────────────

export type District = {
  id: DistrictId
  name: string
  theme: string
  currentMoodLabel: string
  livelinessLevel: 0 | 1 | 2 | 3 | 4 | 5
  conditionTag: DistrictConditionTag
  hasAlert: boolean
  policySensitivityNotes?: string[]
}

// ── Policy ────────────────────────────────────

export type PolicyCategory =
  | 'wellness-control'
  | 'work-optimization'
  | 'social-regulation'
  | 'culture-management'
  | 'population-guidance'
  | 'system-completion'

export type DelayedEffect = {
  applyOnTurn: number  // absolute turn number
  metricDeltas?: Partial<MetricSet>
  hiddenDeltas?: Partial<HiddenValueSet>
  description: string
}

export type Policy = {
  id: string
  name: string
  category: PolicyCategory
  summary: string
  cost: number                           // consumes Governance Capacity
  targets: 'citywide' | DistrictId
  unlockTurn: number                     // earliest turn the policy can appear
  phase: Phase
  immediateEffects: Partial<MetricSet>
  delayedEffects: DelayedEffect[]        // effects scheduled into future turns
  hiddenImpact: Partial<HiddenValueSet>  // not shown to player in MVP
  resolvedIncidentIds: string[]          // incident IDs this policy can clear/mitigate
  districtNotes?: string
  flavorLine: string
  specialRules?: string[]
}

// ── Incident ──────────────────────────────────

export type Incident = {
  id: string
  title: string
  description: string
  district: DistrictId
  phase: Phase
  minTurn: number
  maxTurn: number
  weight: number          // higher = more likely to be drawn
  canRepeat: boolean
  visibleImpactIfIgnored: Partial<MetricSet>  // per-turn drain if not resolved
  hiddenCauses: HiddenKey[]
  policyInteractions: string[]  // policy IDs that resolve/mitigate this incident
  escalationTurns: number | null
  escalatedResult?: string      // description of what happens after escalation
  citizenLine?: string
  newsLine?: string
}

// ── Atmosphere Stage ──────────────────────────

export type AtmosphereStage = {
  id: StageId
  name: string
  socialVitalityThreshold: number  // Social Vitality must be ≤ this (except stage 1)
  turnRange: [number, number]
  uiSaturation: number             // 0–100 percent
  uiBrightness: number             // 0–100 percent
  audioAmbience: number            // 0–1
  audioCrowd: number               // 0–1
  audioHum: number                 // 0–1
  textMaxChars: number
  description: string
}

// ── Feedback Payload ──────────────────────────

export type FeedbackPayload = {
  turn: number
  stage: StageId
  citizenLine: string
  newsLine: string
  metricDeltas: Partial<MetricSet>
  hiddenDeltas: Partial<HiddenValueSet>
  stageChanged: boolean
  incidentsResolved: string[]
  incidentsEscalated: string[]
}

// ── Pending Delayed Effect ────────────────────

export type PendingEffect = {
  sourcePolicyId: string
  applyOnTurn: number
  metricDeltas?: Partial<MetricSet>
  hiddenDeltas?: Partial<HiddenValueSet>
  description: string
}

// ── Ending Record ─────────────────────────────

export type EndingRecord = {
  status: GameStatus
  profile?: EndingProfile
  lossReason: LossReason
  finalTurn: number
  finalMetrics: MetricSet
  finalHidden: HiddenValueSet
  finalStage: StageId
  title: string
  message: string
}

// ── Active Incident Slot ──────────────────────

export type ActiveIncident = {
  incidentId: string
  unresolvedTurns: number  // how many turns it has been unresolved
  escalated: boolean
}

// ── Game State ────────────────────────────────

export type GameState = {
  // run progress
  turn: number          // 1-indexed, current turn
  maxTurns: number      // 12
  phase: Phase
  stage: StageId
  status: GameStatus

  // capacity
  governanceCapacity: number   // always 5 in MVP
  remainingCapacity: number    // resets to 5 at start of each turn
  controlPressure: number
  compliance: number

  // metrics
  metrics: MetricSet
  hiddenValues: HiddenValueSet

  // districts
  districts: District[]

  // incidents
  activeIncidents: ActiveIncident[]

  // policies
  policyHandIds: string[]      // IDs of cards in current hand (3 at start)
  availablePolicyIds: string[] // IDs unlocked for this turn
  selectedPolicyIds: string[]  // player's current selections (max 2, limited by capacity)

  // delayed effects queue
  pendingEffects: PendingEffect[]

  // feedback
  lastFeedback: FeedbackPayload | null

  // ending
  ending: EndingRecord | null
}
