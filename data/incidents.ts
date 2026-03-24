// ─────────────────────────────────────────────
//  The Happiness Index — Incident Data (14 incidents)
//  Source: docs/05-event-list.md
//  Numbers: docs/11-balance-values.md
// ─────────────────────────────────────────────

import type { Incident } from '@/types'

export const INCIDENTS: Incident[] = [
  // ── EARLY PHASE (turns 1–4) — 6 incidents ───

  {
    id: 'INC-01',
    title: 'Neighbourhood Loneliness Spike',
    description:
      'Social isolation is rising in Residential. Residents report fewer community connections and growing emotional withdrawal.',
    district: 'residential',
    phase: 'early',
    minTurn: 1,
    maxTurn: 4,
    weight: 8,
    canRepeat: false,
    visibleImpactIfIgnored: { happinessIndex: -4, stress: 4 },
    hiddenCauses: ['socialVitality', 'hope'],
    policyInteractions: ['POL-01', 'POL-06'],
    escalationTurns: 2,
    escalatedResult: 'Spread of public apathy. Happiness Index takes additional -5 penalty.',
    citizenLine: 'I used to know my neighbours. Now I just pass them.',
    newsLine: 'City Wellbeing Index flags elevated isolation scores in Residential sector.',
  },

  {
    id: 'INC-02',
    title: 'Misinformation Surge',
    description:
      'False narratives about city governance are spreading online and in public spaces. Public Trust eroding.',
    district: 'transit',
    phase: 'early',
    minTurn: 1,
    maxTurn: 4,
    weight: 7,
    canRepeat: true,
    visibleImpactIfIgnored: { publicTrust: -5, stress: 2 },
    hiddenCauses: ['freedom', 'hope'],
    policyInteractions: ['POL-04', 'POL-15'],
    escalationTurns: 2,
    escalatedResult: 'Protests emerge. Safety drops -4, Public Trust drops an additional -3.',
    citizenLine: 'I don\'t know what to believe anymore.',
    newsLine: 'Officials urge calm as unverified claims circulate across information channels.',
  },

  {
    id: 'INC-03',
    title: 'Worker Fatigue Outbreak',
    description:
      'Industrial workers report chronic exhaustion. Productivity is dropping and sick leave is rising.',
    district: 'industrial',
    phase: 'early',
    minTurn: 1,
    maxTurn: 4,
    weight: 8,
    canRepeat: false,
    visibleImpactIfIgnored: { productivity: -5, stress: 4 },
    hiddenCauses: ['hope', 'freedom'],
    policyInteractions: ['POL-02', 'POL-09'],
    escalationTurns: 2,
    escalatedResult: 'Wildcat slowdowns. Productivity drops additional -6.',
    citizenLine: 'My hands keep moving but I stopped feeling them months ago.',
    newsLine: 'Productivity metrics below seasonal projections. Workforce wellness concerns elevated.',
  },

  {
    id: 'INC-04',
    title: 'Youth Disengagement Wave',
    description:
      'Students and young residents are withdrawing from civic life, education programs, and public activity.',
    district: 'education',
    phase: 'early',
    minTurn: 1,
    maxTurn: 4,
    weight: 7,
    canRepeat: false,
    visibleImpactIfIgnored: { happinessIndex: -4, productivity: -3, publicTrust: -3 },
    hiddenCauses: ['hope', 'creativity', 'socialVitality'],
    policyInteractions: ['POL-05'],
    escalationTurns: 3,
    escalatedResult: 'Youth gather in unsupervised spaces. Safety drops -4.',
    citizenLine: 'What are we supposed to care about? The scores?',
    newsLine: 'Education engagement indices decline for third consecutive reporting period.',
  },

  {
    id: 'INC-05',
    title: 'Public Safety Incident Cluster',
    description:
      'A series of minor altercations and property incidents are occurring near transit hubs and crossings.',
    district: 'transit',
    phase: 'early',
    minTurn: 2,
    maxTurn: 4,
    weight: 6,
    canRepeat: false,
    visibleImpactIfIgnored: { safety: -5, publicTrust: -3 },
    hiddenCauses: ['socialVitality', 'hope'],
    policyInteractions: ['POL-03', 'POL-11'],
    escalationTurns: 2,
    escalatedResult: 'Incident pattern classified as systemic. Safety drops additional -5.',
    citizenLine: 'It\'s not dangerous exactly, but it doesn\'t feel safe.',
    newsLine: 'Safety compliance office reports elevated incident frequency near transit corridors.',
  },

  {
    id: 'INC-06',
    title: 'Grief Gathering',
    description:
      'A spontaneous public grieving ritual has formed in the Cultural district following a community loss.',
    district: 'cultural',
    phase: 'early',
    minTurn: 2,
    maxTurn: 5,
    weight: 5,
    canRepeat: false,
    visibleImpactIfIgnored: { stress: 4, publicTrust: -2 },
    hiddenCauses: ['socialVitality', 'freedom'],
    policyInteractions: ['POL-06', 'POL-11'],
    escalationTurns: 3,
    escalatedResult:
      'Gathering grows. Becomes a focal point for broader community frustration. Stress +6, Trust -4.',
    citizenLine: 'We needed somewhere to put it. We came here.',
    newsLine: 'Unauthorized public assembly noted in Cultural district. Variance assessment underway.',
  },

  // ── MID PHASE (turns 5–8) — 5 incidents ─────

  {
    id: 'INC-07',
    title: 'Resistance to Automation',
    description:
      'Industrial workers are quietly refusing or sabotaging new automated systems being installed.',
    district: 'industrial',
    phase: 'mid',
    minTurn: 5,
    maxTurn: 8,
    weight: 8,
    canRepeat: false,
    visibleImpactIfIgnored: { productivity: -6, safety: -3 },
    hiddenCauses: ['hope', 'freedom'],
    policyInteractions: ['POL-07', 'POL-14'],
    escalationTurns: 2,
    escalatedResult: 'Organized slowdown. Productivity drops -10. Safety -5.',
    citizenLine: 'They asked us to train the thing that was replacing us. We said no.',
    newsLine: 'Installation delays reported in Industrial district. Causes under review.',
  },

  {
    id: 'INC-08',
    title: 'Underground Arts Movement',
    description:
      'Unauthorized creative work is circulating in Cultural spaces — anonymous, expressive, and officially unsanctioned.',
    district: 'cultural',
    phase: 'mid',
    minTurn: 5,
    maxTurn: 8,
    weight: 6,
    canRepeat: false,
    visibleImpactIfIgnored: { publicTrust: -3, stress: 3 },
    hiddenCauses: ['creativity', 'freedom'],
    policyInteractions: ['POL-08'],
    escalationTurns: 3,
    escalatedResult: 'Movement gains visibility. Public Trust -6. Stress +4.',
    citizenLine: 'Nobody approved it. That\'s exactly why it matters.',
    newsLine: 'Cultural district outputs include unauthorized materials. Provenance unconfirmed.',
  },

  {
    id: 'INC-09',
    title: 'Collective Burnout Signal',
    description:
      'Widespread low-grade exhaustion is visible across city sectors. Complaints are rising but remaining quiet.',
    district: 'residential',
    phase: 'mid',
    minTurn: 5,
    maxTurn: 8,
    weight: 7,
    canRepeat: false,
    visibleImpactIfIgnored: { stress: 6, productivity: -4, happinessIndex: -3 },
    hiddenCauses: ['hope', 'socialVitality'],
    policyInteractions: ['POL-09', 'POL-13'],
    escalationTurns: 2,
    escalatedResult: 'Absenteeism rises. Productivity -7. Stress +5.',
    citizenLine: 'I\'m fine. Everyone is fine. That\'s what worries me.',
    newsLine: 'Workforce wellness indices at mid-cycle low. Intervention protocols queued.',
  },

  {
    id: 'INC-10',
    title: 'Public Space Encampment',
    description:
      'A loosely organized group has claimed a Transit plaza as an informal living and social space.',
    district: 'transit',
    phase: 'mid',
    minTurn: 5,
    maxTurn: 8,
    weight: 5,
    canRepeat: false,
    visibleImpactIfIgnored: { safety: -4, publicTrust: -3, stress: 3 },
    hiddenCauses: ['socialVitality', 'hope', 'freedom'],
    policyInteractions: ['POL-10', 'POL-03'],
    escalationTurns: 3,
    escalatedResult: 'Encampment expands. Safety -6. Public Trust -5.',
    citizenLine: 'We\'re not causing problems. We\'re just here.',
    newsLine: 'Informal occupation of public infrastructure noted. Compliance assessment initiated.',
  },

  {
    id: 'INC-11',
    title: 'Memory Erosion Event',
    description:
      'Residents report disconnection from personal and community history. Collective memory is becoming shallow.',
    district: 'residential',
    phase: 'mid',
    minTurn: 6,
    maxTurn: 9,
    weight: 6,
    canRepeat: false,
    visibleImpactIfIgnored: { happinessIndex: -6, publicTrust: -4 },
    hiddenCauses: ['socialVitality', 'freedom', 'hope'],
    policyInteractions: ['POL-12', 'POL-15'],
    escalationTurns: 3,
    escalatedResult: 'Cultural disorientation deepens. Happiness Index -7.',
    citizenLine: 'I can\'t remember what this place felt like before.',
    newsLine: 'Longitudinal wellbeing surveys note reduced community narrative coherence.',
  },

  // ── LATE PHASE (turns 9–12) — 3 incidents ───

  {
    id: 'INC-12',
    title: 'Compliance Fatigue',
    description:
      'Despite high metric scores, residents display mechanical compliance without any apparent motivation or affect.',
    district: 'residential',
    phase: 'late',
    minTurn: 9,
    maxTurn: 12,
    weight: 7,
    canRepeat: false,
    visibleImpactIfIgnored: { happinessIndex: -4, productivity: -3 },
    hiddenCauses: ['freedom', 'hope', 'socialVitality'],
    policyInteractions: ['POL-12', 'POL-16'],
    escalationTurns: null,
    escalatedResult: undefined,
    citizenLine: 'I do what I\'m supposed to do.',
    newsLine: 'Behavioral compliance rates high. Variance indicators low. Status: Optimal.',
  },

  {
    id: 'INC-13',
    title: 'Invisible Grief',
    description:
      'There are no public complaints. No protests. But the city feels hollow. Residents are quietly disappearing from public life.',
    district: 'cultural',
    phase: 'late',
    minTurn: 9,
    maxTurn: 12,
    weight: 6,
    canRepeat: false,
    visibleImpactIfIgnored: { happinessIndex: -4, publicTrust: -4, stress: 2 },
    hiddenCauses: ['socialVitality', 'hope', 'creativity'],
    policyInteractions: ['POL-13', 'POL-16'],
    escalationTurns: null,
    escalatedResult: undefined,
    citizenLine: 'Nothing is wrong. I just don\'t have anywhere to be anymore.',
    newsLine: 'Public activity indices nominal. No negative variance detected.',
  },

  {
    id: 'INC-14',
    title: 'The Last Worker',
    description:
      'Industrial automation is now total. One symbolic role remains — a worker who has no meaningful task and is not sure why they still come in.',
    district: 'industrial',
    phase: 'late',
    minTurn: 10,
    maxTurn: 12,
    weight: 5,
    canRepeat: false,
    visibleImpactIfIgnored: { productivity: -2 },
    hiddenCauses: ['hope', 'freedom'],
    policyInteractions: ['POL-14', 'POL-16'],
    escalationTurns: null,
    escalatedResult: undefined,
    citizenLine: 'I think they kept me on for continuity. I\'m not sure what continuity means here.',
    newsLine: 'Industrial productivity at peak efficiency. Human resource utilization: minimal.',
  },
]

// Helper: get incident by ID
export function getIncidentById(id: string): Incident | undefined {
  return INCIDENTS.find((i) => i.id === id)
}

// Helper: get incidents available in a given phase
export function getIncidentsByPhase(phase: Incident['phase']): Incident[] {
  return INCIDENTS.filter((i) => i.phase === phase)
}

// Helper: get incidents that could appear on a specific turn (within turn range + phase)
export function getIncidentsAvailableAtTurn(
  turn: number,
  excludeIds: string[] = []
): Incident[] {
  return INCIDENTS.filter(
    (i) =>
      turn >= i.minTurn &&
      turn <= i.maxTurn &&
      !excludeIds.includes(i.id)
  )
}
