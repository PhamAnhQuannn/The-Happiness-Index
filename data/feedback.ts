// ─────────────────────────────────────────────
//  The Happiness Index — Feedback Text Pools
//  Source: docs/04-policy-list.md, docs/05-event-list.md
//          docs/07-decay-plan.md, docs/08-villains-logic.md
// ─────────────────────────────────────────────

import type { StageId } from '@/types'

// ── Citizen lines by stage ────────────────────
// Used when no incident-specific citizen line is active.
// Stage controls max length + tone (docs/07-decay-plan.md)

export const CITIZEN_LINES: Record<StageId, string[]> = {
  1: [
    'Things feel okay lately. Not great, but okay. I suppose that counts for something.',
    'My kids seem busy. Not sure if that\'s good or just scheduled.',
    'The streets feel normal. I\'m not sure when normal became something I notice.',
    'I went for a walk this morning. Something felt different. Can\'t say what.',
    'My neighbour brought food over. It was small but it mattered.',
  ],
  2: [
    'Everything works. I just feel like it works at me.',
    'The notifications remind me when to rest now. I\'ve stopped setting my own alarms.',
    'There are fewer arguments in the plaza. I\'m not sure where they went.',
    'I do what I\'m supposed to do. Most days I don\'t ask why.',
    'Something is quieter. I notice it mostly at night.',
  ],
  3: [
    'I follow the schedule.',
    'Compliance is high, they say.',
    'I don\'t remember the last spontaneous thing I did.',
    'The city is clean.',
  ],
  4: [
    'All is well.',
    'Status: nominal.',
    'No irregularities.',
  ],
}

// ── News lines by stage ───────────────────────

export const NEWS_LINES: Record<StageId, string[]> = {
  1: [
    'City Happiness Index up 2 points. Officials cite continued progress on social stability.',
    'Productivity metrics steady across Industrial and Education districts.',
    'Slight uptick in Stress indices noted. Monitoring continues.',
    'Public Trust levels hold. Information compliance teams report reduced variance.',
    'New resource allocation this cycle. Results expected next reporting period.',
  ],
  2: [
    'Behavioral variance down 12% this cycle. Alignment protocols remain in effect.',
    'Public expression incidents decreased. Cultural alignment trending positive.',
    'Resilience training completion at 83% citywide. Outliers receiving supplemental scheduling.',
    'Transit throughput optimal. Irregularity incidents down.',
  ],
  3: [
    'All metrics within acceptable range.',
    'No anomalous variance detected.',
    'Cycle efficiency: nominal.',
  ],
  4: [
    'System status: complete.',
    'All sectors nominal.',
  ],
}

// ── End-of-run summary flavor lines by ending ─

export const ENDING_FLAVOR: Record<string, string[]> = {
  'won-utopia': [
    'The city is thriving. The metrics confirm it. The people confirm it, when asked.',
    'You have achieved what governance always promised. Every number is where it should be.',
    'Congratulations. This is what a city looks like when it is working.',
  ],
  'won-quiet-utopia': [
    'The city is complete. Safe. Productive. Clean. Orderly. Optimal.',
    'The data is excellent. The silence is also excellent.',
    'There are no more problems to solve. There is also, increasingly, not much else.',
  ],
  'lost-trust-collapse': [
    'The city stopped believing in the system before the system noticed.',
    'Public Trust is not a metric. It was a warning.',
    'When the city decided you were wrong, it did it quietly.',
  ],
  'lost-stress-crisis': [
    'The human cost of optimization is not always invisible.',
    'Stress is not inefficiency. It is a message. The message became a crisis.',
    'The city broke before it could be perfected.',
  ],
  'lost-safety-failure': [
    'Order requires more than rules. It requires a reason to follow them.',
    'The city could not protect itself from what you optimized away.',
  ],
  'lost-cascading-instability': [
    'When several things fail together, there is rarely one explanation.',
    'You solved each problem. The problems coordinated.',
  ],
}

// ── AI system voice lines (docs/08-villains-logic.md) ─

export const SYSTEM_VOICE_LINES: string[] = [
  'All data within acceptable parameters.',
  'Optimizing for aggregate wellbeing.',
  'Variance reduction in progress.',
  'Citizens are performing above baseline.',
  'Projected outcomes favorable.',
  'This outcome was anticipated.',
  'Public morale is nominal. Adjustment unnecessary.',
  'No anomalies detected at this time.',
  'System efficiency at 94.7%. Reviewing outliers.',
]
