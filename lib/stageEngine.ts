// ─────────────────────────────────────────────
//  The Happiness Index — Stage Engine
//  Source: docs/07-decay-plan.md, docs/11-balance-values.md, docs/12-state-flow.md
// ─────────────────────────────────────────────

import type { StageId, HiddenValueSet, District } from '@/types'
import {
  deriveStage,
  getStageById,
} from '@/data/stages'
import {
  DISTRICT_STAGE_MOODS,
  DISTRICT_STAGE_LIVELINESS,
} from '@/data/districts'

/**
 * Compute the new atmosphere stage from current turn + Social Vitality.
 * Stage can only stay the same or increase (never regress).
 */
export function computeStage(
  currentStage: StageId,
  turn: number,
  hiddenValues: HiddenValueSet
): StageId {
  const candidate = deriveStage(turn, hiddenValues.socialVitality)
  // Stage is monotonically increasing
  return Math.max(currentStage, candidate) as StageId
}

/**
 * Update district mood labels and liveliness levels for the new stage.
 */
export function applyStageToDistricts(
  districts: District[],
  stage: StageId
): District[] {
  return districts.map((d) => ({
    ...d,
    currentMoodLabel:
      DISTRICT_STAGE_MOODS[d.id][stage] ?? d.currentMoodLabel,
    livelinessLevel:
      DISTRICT_STAGE_LIVELINESS[d.id][stage] ?? d.livelinessLevel,
  }))
}

/**
 * CSS filter string for the current stage.
 * Used in the UI wrapper to apply visual decay.
 */
export function stageCSSFilter(stage: StageId): string {
  const s = getStageById(stage)
  return `saturate(${s.uiSaturation}%) brightness(${s.uiBrightness}%)`
}
