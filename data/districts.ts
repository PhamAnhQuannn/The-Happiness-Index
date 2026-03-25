// ─────────────────────────────────────────────
//  The Happiness Index — District Data
//  Source: docs/03-rules-systems.md, docs/07-decay-plan.md
// ─────────────────────────────────────────────

import type { District } from '@/types'

export const DISTRICTS: District[] = [
  {
    id: 'residential',
    name: 'Residential',
    theme: 'Housing, family life, community belonging',
    currentMoodLabel: 'Settled',
    livelinessLevel: 5,
    conditionTag: 'managed',
    hasAlert: false,
    policySensitivityNotes: [
      'Sensitive to Stress-related incidents',
      'Welfare policies resolve conflicts here fastest',
    ],
  },
  {
    id: 'industrial',
    name: 'Industrial',
    theme: 'Work, manufacturing, labor productivity',
    currentMoodLabel: 'Productive',
    livelinessLevel: 5,
    conditionTag: 'optimized',
    hasAlert: false,
    policySensitivityNotes: [
      'Work-optimization policies have strongest impact here',
      'Automation incidents originate here',
    ],
  },
  {
    id: 'education',
    name: 'Education',
    theme: 'Schools, youth development, knowledge transmission',
    currentMoodLabel: 'Engaged',
    livelinessLevel: 5,
    conditionTag: 'hopeful',
    hasAlert: false,
    policySensitivityNotes: [
      'Youth disengagement incidents begin here',
      'Curriculum policies have delayed effects',
    ],
  },
  {
    id: 'cultural',
    name: 'Cultural',
    theme: 'Art, public expression, spontaneous gathering',
    currentMoodLabel: 'Vibrant',
    livelinessLevel: 5,
    conditionTag: 'alive',
    hasAlert: false,
    policySensitivityNotes: [
      'Most sensitive district to hidden value erosion',
      'Culture-management policies suppress Creativity and Freedom fastest',
    ],
  },
  {
    id: 'transit',
    name: 'Transit',
    theme: 'Movement, infrastructure, public order in shared spaces',
    currentMoodLabel: 'Flowing',
    livelinessLevel: 5,
    conditionTag: 'active',
    hasAlert: false,
    policySensitivityNotes: [
      'Unrest and protest incidents surface here first',
      'Surveillance policies show visible effect here',
    ],
  },
]

// Stage-based mood labels per district (docs/07-decay-plan.md)
export const DISTRICT_STAGE_MOODS: Record<
  District['id'],
  Record<1 | 2 | 3 | 4, string>
> = {
  residential: {
    1: 'Settled',
    2: 'Quiet',
    3: 'Withdrawn',
    4: 'Compliant',
  },
  industrial: {
    1: 'Productive',
    2: 'Efficient',
    3: 'Mechanized',
    4: 'Frictionless',
  },
  education: {
    1: 'Engaged',
    2: 'Structured',
    3: 'Standardized',
    4: 'Optimized',
  },
  cultural: {
    1: 'Vibrant',
    2: 'Muted',
    3: 'Sterile',
    4: 'Silent',
  },
  transit: {
    1: 'Flowing',
    2: 'Orderly',
    3: 'Controlled',
    4: 'Automated',
  },
}

// Stage-based liveliness levels (0–5) per district
export const DISTRICT_STAGE_LIVELINESS: Record<
  District['id'],
  Record<1 | 2 | 3 | 4, 0 | 1 | 2 | 3 | 4 | 5>
> = {
  residential: { 1: 5, 2: 4, 3: 2, 4: 1 },
  industrial:  { 1: 5, 2: 4, 3: 3, 4: 1 },
  education:   { 1: 5, 2: 3, 3: 2, 4: 1 },
  cultural:    { 1: 5, 2: 3, 3: 1, 4: 0 },
  transit:     { 1: 5, 2: 4, 3: 2, 4: 1 },
}
