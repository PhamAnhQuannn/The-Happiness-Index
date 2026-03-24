// ─────────────────────────────────────────────
//  The Happiness Index — Policy Data (16 policies)
//  Source: docs/04-policy-list.md
//  Numbers: docs/11-balance-values.md
// ─────────────────────────────────────────────

import type { Policy } from '@/types'

export const POLICIES: Policy[] = [
  // ── EARLY PHASE (turns 1–4) — 5 policies ─────

  {
    id: 'POL-01',
    name: 'Community Wellness Checks',
    category: 'wellness-control',
    summary: 'Deploy social workers for routine mood assessments citywide.',
    cost: 1,
    targets: 'citywide',
    unlockTurn: 1,
    phase: 'early',
    immediateEffects: { happinessIndex: 4, stress: -3 },
    delayedEffects: [
      {
        applyOnTurn: 2,
        metricDeltas: { happinessIndex: 2 },
        hiddenDeltas: {},
        description: 'Residents report improved morale from continued check-ins.',
      },
    ],
    hiddenImpact: { freedom: -2, hope: 1 },
    resolvedIncidentIds: ['INC-01'],
    districtNotes: 'Most effective in Residential.',
    flavorLine: 'Every resident deserves to feel monitored — we mean, supported.',
    specialRules: ['Cannot be played in same turn as POL-06'],
  },

  {
    id: 'POL-02',
    name: 'Productivity Incentive Program',
    category: 'work-optimization',
    summary: 'Financial bonuses tied to measurable worker output targets.',
    cost: 2,
    targets: 'industrial',
    unlockTurn: 1,
    phase: 'early',
    immediateEffects: { productivity: 6, stress: 3 },
    delayedEffects: [
      {
        applyOnTurn: 3,
        metricDeltas: { productivity: 4, stress: 2 },
        hiddenDeltas: { hope: -3 },
        description: 'Short-term gain sustained but workers begin to feel like metrics.',
      },
    ],
    hiddenImpact: { freedom: -1, hope: -2, creativity: -2 },
    resolvedIncidentIds: ['INC-03'],
    districtNotes: 'Primary effect in Industrial.',
    flavorLine: 'A motivated workforce is a measured workforce.',
  },

  {
    id: 'POL-03',
    name: 'Safety Patrols Enhancement',
    category: 'social-regulation',
    summary: 'Increase visible patrol frequency in public spaces.',
    cost: 2,
    targets: 'transit',
    unlockTurn: 1,
    phase: 'early',
    immediateEffects: { safety: 7, publicTrust: 3 },
    delayedEffects: [],
    hiddenImpact: { freedom: -4, socialVitality: -2 },
    resolvedIncidentIds: ['INC-05'],
    districtNotes: 'Strongest effect in Transit and Residential.',
    flavorLine: 'Public safety is a public good. Compliance is its own reward.',
  },

  {
    id: 'POL-04',
    name: 'Public Information Campaign',
    category: 'population-guidance',
    summary: 'City-sponsored messaging correcting misinformation and promoting stability.',
    cost: 1,
    targets: 'citywide',
    unlockTurn: 1,
    phase: 'early',
    immediateEffects: { publicTrust: 5, stress: -2 },
    delayedEffects: [],
    hiddenImpact: { freedom: -3, creativity: -1 },
    resolvedIncidentIds: ['INC-02'],
    flavorLine: 'The truth is too important to leave to chance.',
  },

  {
    id: 'POL-05',
    name: 'Youth Engagement Initiative',
    category: 'culture-management',
    summary: 'Structured after-school programs replacing unstructured youth time.',
    cost: 2,
    targets: 'education',
    unlockTurn: 1,
    phase: 'early',
    immediateEffects: { happinessIndex: 3, safety: 4 },
    delayedEffects: [
      {
        applyOnTurn: 4,
        hiddenDeltas: { creativity: -5, freedom: -3 },
        description: 'Youth adapt to structured life. Spontaneity quietly exits their behavior.',
      },
    ],
    hiddenImpact: { creativity: -3, freedom: -2, socialVitality: -1 },
    resolvedIncidentIds: ['INC-04'],
    districtNotes: 'Primary effect in Education.',
    flavorLine: 'Purposeful youth are safe youth. Structure is care.',
  },

  // ── MID PHASE (turns 5–8) — 6 policies ──────

  {
    id: 'POL-06',
    name: 'Behavioral Monitoring System',
    category: 'wellness-control',
    summary: 'Passive digital check-ins flag residents showing emotional instability.',
    cost: 3,
    targets: 'citywide',
    unlockTurn: 5,
    phase: 'mid',
    immediateEffects: { stress: -6, safety: 5, happinessIndex: 3 },
    delayedEffects: [
      {
        applyOnTurn: 7,
        hiddenDeltas: { freedom: -8, socialVitality: -5 },
        description: 'Residents internalize being watched. Spontaneous behavior declines.',
      },
    ],
    hiddenImpact: { freedom: -6, hope: -3, socialVitality: -4 },
    resolvedIncidentIds: ['INC-06', 'INC-01'],
    flavorLine: 'Early detection prevents suffering. Data is compassion.',
    specialRules: ['Cannot be played in same turn as POL-01'],
  },

  {
    id: 'POL-07',
    name: 'Automated Labor Transition',
    category: 'work-optimization',
    summary: 'Replace inefficient manual processes with automated systems. Retraining provided.',
    cost: 3,
    targets: 'industrial',
    unlockTurn: 5,
    phase: 'mid',
    immediateEffects: { productivity: 10, stress: 4 },
    delayedEffects: [
      {
        applyOnTurn: 8,
        metricDeltas: { productivity: 5, stress: -3 },
        hiddenDeltas: { hope: -6, creativity: -4 },
        description: 'Efficiency gains stabilize. Workers become auxiliary to systems they once built.',
      },
    ],
    hiddenImpact: { hope: -5, freedom: -3, socialVitality: -3 },
    resolvedIncidentIds: ['INC-07'],
    districtNotes: 'Industrial district required. Stress spike before stabilization.',
    flavorLine: 'The machine does not tire. It does not doubt. It does not grieve.',
  },

  {
    id: 'POL-08',
    name: 'Cultural Output Regulation',
    category: 'culture-management',
    summary: 'Art and public expression require pre-approval to ensure civic alignment.',
    cost: 3,
    targets: 'cultural',
    unlockTurn: 5,
    phase: 'mid',
    immediateEffects: { publicTrust: 6, stress: -4, safety: 4 },
    delayedEffects: [
      {
        applyOnTurn: 8,
        hiddenDeltas: { creativity: -10, socialVitality: -6 },
        description: 'Artists stop producing irregular work. Cultural life narrows.',
      },
    ],
    hiddenImpact: { creativity: -7, freedom: -6, socialVitality: -5 },
    resolvedIncidentIds: ['INC-08'],
    districtNotes: 'Cultural district becomes quieter. No alert markers appear but liveliness drops.',
    flavorLine: 'Not all expression is equal. Some disrupts. We optimize for the other kind.',
  },

  {
    id: 'POL-09',
    name: 'Mandatory Resilience Training',
    category: 'wellness-control',
    summary: 'City employees and students attend regulated emotional management workshops.',
    cost: 3,
    targets: 'citywide',
    unlockTurn: 5,
    phase: 'mid',
    immediateEffects: { stress: -7, happinessIndex: 4 },
    delayedEffects: [],
    hiddenImpact: { freedom: -4, creativity: -3, hope: -2 },
    resolvedIncidentIds: ['INC-09'],
    flavorLine: 'Resilience is a skill. We provide it at scale.',
  },

  {
    id: 'POL-10',
    name: 'Public Space Optimization',
    category: 'social-regulation',
    summary: 'Redesign public gathering spaces to maximize throughput and minimize loitering.',
    cost: 2,
    targets: 'transit',
    unlockTurn: 5,
    phase: 'mid',
    immediateEffects: { safety: 5, productivity: 4, stress: -3 },
    delayedEffects: [
      {
        applyOnTurn: 7,
        hiddenDeltas: { socialVitality: -7, creativity: -3 },
        description: 'Spaces are efficient. People stop lingering. Public life becomes transactional.',
      },
    ],
    hiddenImpact: { socialVitality: -5, freedom: -3 },
    resolvedIncidentIds: ['INC-10'],
    flavorLine: 'A well-designed city does not require its citizens to decide where to stand.',
  },

  {
    id: 'POL-11',
    name: 'Social Stability Pact',
    category: 'population-guidance',
    summary: 'Formalized community agreements that disincentivize public conflict.',
    cost: 2,
    targets: 'residential',
    unlockTurn: 6,
    phase: 'mid',
    immediateEffects: { stress: -5, publicTrust: 4, safety: 3 },
    delayedEffects: [],
    hiddenImpact: { freedom: -4, socialVitality: -3, hope: -2 },
    resolvedIncidentIds: ['INC-05', 'INC-06'],
    districtNotes: 'Strongest in Residential. Transit secondarily.',
    flavorLine: 'Harmony is not silence. But silence is rarely the problem.',
  },

  // ── LATE PHASE (turns 9–12) — 5 policies ────

  {
    id: 'POL-12',
    name: 'Total Routine Alignment',
    category: 'population-guidance',
    summary: 'Citywide scheduling eliminates irregular behavior through unified daily structure.',
    cost: 4,
    targets: 'citywide',
    unlockTurn: 9,
    phase: 'late',
    immediateEffects: { happinessIndex: 8, productivity: 8, stress: -10, safety: 6 },
    delayedEffects: [
      {
        applyOnTurn: 11,
        hiddenDeltas: { socialVitality: -12, freedom: -10, creativity: -8, hope: -6 },
        description: 'Variance eliminated. The city functions like a clock. People resemble its hands.',
      },
    ],
    hiddenImpact: { freedom: -8, creativity: -6, socialVitality: -8, hope: -5 },
    resolvedIncidentIds: ['INC-11', 'INC-12'],
    flavorLine: 'Structure is the highest form of care. We provide structure.',
  },

  {
    id: 'POL-13',
    name: 'Emotional Baseline Protocol',
    category: 'wellness-control',
    summary: 'Approved emotional ranges defined. Outliers receive stabilization support.',
    cost: 3,
    targets: 'citywide',
    unlockTurn: 9,
    phase: 'late',
    immediateEffects: { stress: -12, happinessIndex: 7, publicTrust: 5 },
    delayedEffects: [],
    hiddenImpact: { freedom: -9, hope: -7, creativity: -6, socialVitality: -7 },
    resolvedIncidentIds: ['INC-09', 'INC-13'],
    flavorLine: 'We do not suppress feeling. We protect citizens from its extremes.',
  },

  {
    id: 'POL-14',
    name: 'Productivity Finalization',
    category: 'work-optimization',
    summary: 'Remaining manual roles converted. The city achieves full output rationalization.',
    cost: 4,
    targets: 'industrial',
    unlockTurn: 9,
    phase: 'late',
    immediateEffects: { productivity: 15, stress: -5 },
    delayedEffects: [
      {
        applyOnTurn: 11,
        hiddenDeltas: { hope: -10, freedom: -8 },
        description: 'The last resistant workers complete their transition. Human labor is vestigial.',
      },
    ],
    hiddenImpact: { hope: -8, creativity: -6, socialVitality: -5 },
    resolvedIncidentIds: ['INC-07', 'INC-14'],
    districtNotes: 'Industrial only.',
    flavorLine: 'When the work is done correctly, it does not require a person.',
  },

  {
    id: 'POL-15',
    name: 'Public Trust Consolidation',
    category: 'population-guidance',
    summary: 'Unified civic identity messaging replaces fragmented community narratives.',
    cost: 3,
    targets: 'citywide',
    unlockTurn: 9,
    phase: 'late',
    immediateEffects: { publicTrust: 12, stress: -6 },
    delayedEffects: [],
    hiddenImpact: { freedom: -7, creativity: -5, socialVitality: -4 },
    resolvedIncidentIds: ['INC-02', 'INC-11'],
    flavorLine: 'A city with one voice does not argue with itself. It improves.',
  },

  {
    id: 'POL-16',
    name: 'System Completion Declaration',
    category: 'system-completion',
    summary:
      'The Optimization AI formally declares the city complete. All remaining variance is acknowledged as acceptable loss.',
    cost: 5,
    targets: 'citywide',
    unlockTurn: 11,
    phase: 'late',
    immediateEffects: {
      happinessIndex: 20,
      productivity: 15,
      safety: 15,
      stress: -20,
      publicTrust: 15,
    },
    delayedEffects: [],
    hiddenImpact: {
      freedom: -20,
      hope: -15,
      creativity: -15,
      socialVitality: -20,
    },
    resolvedIncidentIds: ['INC-11', 'INC-12', 'INC-13', 'INC-14'],
    flavorLine:
      'This is the culmination of everything we set out to build. Congratulations. You have succeeded.',
    specialRules: [
      'Consumes all 5 Governance Capacity',
      'Cannot be combined with any other policy',
      'Triggers Quiet Utopia ending evaluation regardless of Social Vitality',
    ],
  },
]

// Helper: get policy by ID
export function getPolicyById(id: string): Policy | undefined {
  return POLICIES.find((p) => p.id === id)
}

// Helper: get policies available at a given turn
export function getPoliciesAvailableAtTurn(turn: number): Policy[] {
  return POLICIES.filter((p) => p.unlockTurn <= turn)
}
