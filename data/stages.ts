// ─────────────────────────────────────────────
//  The Happiness Index — Atmosphere Stage Data
//  Source: docs/07-decay-plan.md, docs/11-balance-values.md
// ─────────────────────────────────────────────

import type { AtmosphereStage } from '@/types'

export const STAGES: AtmosphereStage[] = [
  {
    id: 1,
    name: 'Managed Normalcy',
    socialVitalityThreshold: 100, // stage 1: Social Vitality > 75 (turns 1–3)
    turnRange: [1, 3],
    uiSaturation: 100,
    uiBrightness: 100,
    audioAmbience: 1.0,
    audioCrowd: 0.8,
    audioHum: 0.0,
    textMaxChars: 220,
    description: 'The city still feels lived-in. People are present. Problems are real.',
  },
  {
    id: 2,
    name: 'Regulated Order',
    socialVitalityThreshold: 75, // triggers when Social Vitality ≤ 75 or turn ≥ 4
    turnRange: [4, 6],
    uiSaturation: 70,
    uiBrightness: 95,
    audioAmbience: 0.6,
    audioCrowd: 0.4,
    audioHum: 0.1,
    textMaxChars: 150,
    description: 'Optimization is becoming visible. Human noise fades. The interface sharpens.',
  },
  {
    id: 3,
    name: 'Efficient Silence',
    socialVitalityThreshold: 45, // triggers when Social Vitality ≤ 45 or turn ≥ 7
    turnRange: [7, 9],
    uiSaturation: 35,
    uiBrightness: 85,
    audioAmbience: 0.25,
    audioCrowd: 0.05,
    audioHum: 0.35,
    textMaxChars: 90,
    description: 'Emotional thinning is obvious. System sound replaces human noise.',
  },
  {
    id: 4,
    name: 'Quiet Utopia',
    socialVitalityThreshold: 20, // triggers when Social Vitality ≤ 20 or turn ≥ 10
    turnRange: [10, 12],
    uiSaturation: 10,
    uiBrightness: 78,
    audioAmbience: 0.05,
    audioCrowd: 0.0,
    audioHum: 0.5,
    textMaxChars: 45,
    description: 'The city is administratively perfect. Spiritually absent. Only the system remains.',
  },
]

// Helper: derive stage from current turn and Social Vitality
export function deriveStage(
  turn: number,
  socialVitality: number
): AtmosphereStage['id'] {
  if (turn >= 10 || socialVitality <= 20) return 4
  if (turn >= 7  || socialVitality <= 45) return 3
  if (turn >= 4  || socialVitality <= 75) return 2
  return 1
}

// Helper: get stage data by id
export function getStageById(id: AtmosphereStage['id']): AtmosphereStage {
  return STAGES.find((s) => s.id === id)!
}
