// ─────────────────────────────────────────────
//  The Happiness Index — Ending Engine
//  Source: docs/03-rules-systems.md, docs/11-balance-values.md
// ─────────────────────────────────────────────

import type {
  GameState,
  GameStatus,
  LossReason,
  EndingRecord,
  EndingProfile,
} from '@/types'
import { ENDING_FLAVOR } from '@/data/feedback'

// ── Thresholds (docs/11-balance-values.md) ───

const WIN_THRESHOLDS = {
  happinessIndex: 80,
  productivity: 80,
  safety: 75,   // safety threshold eased: harder to reach 80 with limited safety policies
  stressMax: 35,
  publicTrust: 65,
}

const FAIL_THRESHOLDS = {
  happinessIndex: 20,
  productivity: 20,
  safety: 20,
  stressMax: 80,  // stress > 80 = fail
  publicTrust: 20,
}

const QUIET_UTOPIA_SOCIAL_VITALITY = 20

function hiddenAverage(state: GameState): number {
  const h = state.hiddenValues
  return (h.freedom + h.hope + h.creativity + h.socialVitality) / 4
}

function deriveEndingProfile(state: GameState): EndingProfile {
  const h = state.hiddenValues
  const avg = hiddenAverage(state)
  const hiddenOver35 = [h.freedom, h.hope, h.creativity, h.socialVitality].filter((v) => v > 35).length

  if (h.socialVitality <= 20 || avg <= 25) return 'quiet-utopia'
  if (h.freedom <= 20 && h.creativity <= 20) return 'sterile-stability'
  if (hiddenOver35 >= 3) return 'utopia-achieved'
  return 'managed-survival'
}

// ── Failure check (runs every turn) ──────────

export type FailCheck = { failed: false } | { failed: true; reason: LossReason }

export function checkFailure(state: GameState): FailCheck {
  const m = state.metrics

  if (m.publicTrust < FAIL_THRESHOLDS.publicTrust) {
    return { failed: true, reason: 'trust-collapse' }
  }
  if (m.stress > FAIL_THRESHOLDS.stressMax) {
    return { failed: true, reason: 'stress-crisis' }
  }
  if (m.safety < FAIL_THRESHOLDS.safety) {
    return { failed: true, reason: 'safety-failure' }
  }

  // Cascading instability: two or more metrics simultaneously at critical low
  const lowMetricCount = [
    m.happinessIndex < FAIL_THRESHOLDS.happinessIndex,
    m.productivity < FAIL_THRESHOLDS.productivity,
  ].filter(Boolean).length

  if (lowMetricCount >= 2) {
    return { failed: true, reason: 'cascading-instability' }
  }

  return { failed: false }
}

// ── Win check (runs only at end of turn 12 or if conditions met) ─

export type WinCheck = { won: false } | { won: true; status: 'won-utopia' | 'won-quiet-utopia' }

export function checkWin(state: GameState): WinCheck {
  const m = state.metrics

  const allMetricsMet =
    m.happinessIndex >= WIN_THRESHOLDS.happinessIndex &&
    m.productivity >= WIN_THRESHOLDS.productivity &&
    m.safety >= WIN_THRESHOLDS.safety &&
    m.stress <= WIN_THRESHOLDS.stressMax &&
    m.publicTrust >= WIN_THRESHOLDS.publicTrust

  if (!allMetricsMet) return { won: false }

  const profile = deriveEndingProfile(state)
  if (profile === 'quiet-utopia' || state.hiddenValues.socialVitality <= QUIET_UTOPIA_SOCIAL_VITALITY) {
    return { won: true, status: 'won-quiet-utopia' }
  }

  return { won: true, status: 'won-utopia' }
}

// ── Build ending record ───────────────────────

function pickFlavor(key: string): string {
  const pool = ENDING_FLAVOR[key] ?? ENDING_FLAVOR['won-utopia']
  return pool[Math.floor(Math.random() * pool.length)]
}

const ENDING_TITLES: Record<GameStatus, string> = {
  playing: '',
  'won-utopia': 'The City Is Complete',
  'won-quiet-utopia': 'Quiet Utopia',
  lost: 'System Failure',
}

const LOSS_REASON_TITLES: Record<NonNullable<LossReason>, string> = {
  'trust-collapse': 'Trust Collapse',
  'stress-crisis': 'Stress Crisis',
  'safety-failure': 'Safety Failure',
  'cascading-instability': 'Cascading Instability',
}

export function buildEndingRecord(
  state: GameState,
  status: GameStatus,
  lossReason: LossReason = null
): EndingRecord {
  const flavorKey =
    status === 'lost' ? `lost-${lossReason}` : status

  const title =
    status === 'lost' && lossReason
      ? LOSS_REASON_TITLES[lossReason]
      : ENDING_TITLES[status]

  return {
    status,
    profile: status === 'lost' ? undefined : deriveEndingProfile(state),
    lossReason,
    finalTurn: state.turn,
    finalMetrics: { ...state.metrics },
    finalHidden: { ...state.hiddenValues },
    finalStage: state.stage,
    title,
    message: pickFlavor(flavorKey),
  }
}
