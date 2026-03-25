// ─────────────────────────────────────────────
//  The Happiness Index — Stage Engine
//  Source: docs/07-decay-plan.md, docs/11-balance-values.md, docs/12-state-flow.md
// ─────────────────────────────────────────────

import type { StageId, HiddenValueSet, District, DistrictConditionTag, DistrictId } from '@/types'
import {
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
  hiddenValues: HiddenValueSet,
  controlPressure = 0,
  systemCompletionTriggered = false
): StageId {
  const hiddenAvg =
    (hiddenValues.freedom + hiddenValues.hope + hiddenValues.creativity + hiddenValues.socialVitality) / 4

  let candidate: StageId = 1
  if (turn >= 3 && (hiddenValues.socialVitality <= 80 || controlPressure >= 2)) candidate = 2
  if (turn >= 6 && (hiddenValues.socialVitality <= 50 || hiddenAvg <= 55 || controlPressure >= 4)) candidate = 3
  if (turn >= 9 && (hiddenValues.socialVitality <= 20 || hiddenAvg <= 25 || systemCompletionTriggered)) candidate = 4

  // Stage is monotonically increasing
  return Math.max(currentStage, candidate) as StageId
}

function deriveConditionTag(
  districtId: DistrictId,
  stage: StageId,
  hiddenValues: HiddenValueSet,
  controlPressure: number
): DistrictConditionTag {
  const collapsed = stage >= 4 || hiddenValues.socialVitality <= 20
  const strained = stage >= 3 || hiddenValues.socialVitality <= 50 || controlPressure >= 4

  const byDistrict: Record<DistrictId, [DistrictConditionTag, DistrictConditionTag, DistrictConditionTag]> = {
    residential: ['managed', 'strained', 'hollow'],
    industrial: ['optimized', 'backlogged', 'brittle'],
    education: ['hopeful', 'standardized', 'stagnant'],
    cultural: ['alive', 'thinned', 'vacant'],
    transit: ['active', 'orderly', 'frictionless'],
  }

  const [stableTag, strainedTag, collapsedTag] = byDistrict[districtId]
  if (collapsed) return collapsedTag
  if (strained) return strainedTag
  return stableTag
}

/**
 * Update district mood labels and liveliness levels for the new stage.
 */
export function applyStageToDistricts(
  districts: District[],
  stage: StageId,
  hiddenValues?: HiddenValueSet,
  controlPressure = 0
): District[] {
  return districts.map((d) => ({
    ...d,
    currentMoodLabel:
      DISTRICT_STAGE_MOODS[d.id][stage] ?? d.currentMoodLabel,
    livelinessLevel:
      DISTRICT_STAGE_LIVELINESS[d.id][stage] ?? d.livelinessLevel,
    conditionTag: hiddenValues
      ? deriveConditionTag(d.id, stage, hiddenValues, controlPressure)
      : d.conditionTag,
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
