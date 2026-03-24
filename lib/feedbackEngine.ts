// ─────────────────────────────────────────────
//  The Happiness Index — Feedback Engine
//  Source: docs/07-decay-plan.md, docs/08-villains-logic.md
// ─────────────────────────────────────────────

import type {
  FeedbackPayload,
  MetricSet,
  HiddenValueSet,
  StageId,
} from '@/types'
import {
  CITIZEN_LINES,
  NEWS_LINES,
} from '@/data/feedback'
import { getStageById } from '@/data/stages'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - 1) + '…'
}

export function generateFeedback(
  turn: number,
  stage: StageId,
  prevStage: StageId,
  metricDeltas: Partial<MetricSet>,
  hiddenDeltas: Partial<HiddenValueSet>,
  resolvedIds: string[],
  escalatedIds: string[],
  overrideCitizenLine?: string,
  overrideNewsLine?: string
): FeedbackPayload {
  const stageData = getStageById(stage)
  const maxChars = stageData.textMaxChars

  const citizenLine = truncate(
    overrideCitizenLine ?? pickRandom(CITIZEN_LINES[stage]),
    maxChars
  )

  const newsLine = truncate(
    overrideNewsLine ?? pickRandom(NEWS_LINES[stage]),
    maxChars
  )

  return {
    turn,
    stage,
    citizenLine,
    newsLine,
    metricDeltas,
    hiddenDeltas,
    stageChanged: stage !== prevStage,
    incidentsResolved: resolvedIds,
    incidentsEscalated: escalatedIds,
  }
}
