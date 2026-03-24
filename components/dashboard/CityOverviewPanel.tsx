'use client'

import { motion } from 'framer-motion'
import type { MetricKey } from '@/types'
import { useGameStore } from '@/store/gameStore'

const METRIC_LABELS: Record<MetricKey, string> = {
  happinessIndex: 'Happiness Index',
  productivity: 'Productivity',
  safety: 'Safety',
  stress: 'Stress',
  publicTrust: 'Public Trust',
}

// Stress is inverse-good — high stress = bad
const INVERSE_METRICS: Set<MetricKey> = new Set(['stress'])

function barColor(key: MetricKey, value: number): string {
  const isGood = !INVERSE_METRICS.has(key)
  if (isGood) {
    if (value >= 75) return 'bg-emerald-500'
    if (value >= 45) return 'bg-amber-400'
    return 'bg-red-500'
  } else {
    if (value <= 35) return 'bg-emerald-500'
    if (value <= 60) return 'bg-amber-400'
    return 'bg-red-500'
  }
}

export function MetricBar({
  metricKey,
  value,
  isStage4 = false,
}: {
  metricKey: MetricKey
  value: number
  isStage4?: boolean
}) {
  const label = METRIC_LABELS[metricKey]
  const color = barColor(metricKey, value)
  const pct = Math.max(0, Math.min(100, value))

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span
          className={`uppercase tracking-widest transition-colors duration-[6000ms] ${
            isStage4 ? 'text-neutral-600' : 'text-neutral-400'
          }`}
        >
          {label}
        </span>
        <span
          className={`font-mono transition-colors duration-[6000ms] ${
            isStage4 ? 'text-neutral-500' : 'text-neutral-200'
          }`}
        >
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

export function CityOverviewPanel() {
  const metrics = useGameStore((s) => s.metrics)
  const turn = useGameStore((s) => s.turn)
  const maxTurns = useGameStore((s) => s.maxTurns)
  const stage = useGameStore((s) => s.stage)
  const remainingCapacity = useGameStore((s) => s.remainingCapacity)
  const governanceCapacity = useGameStore((s) => s.governanceCapacity)
  const isStage4 = stage === 4

  const STAGE_NAMES: Record<number, string> = {
    1: 'Managed Normalcy',
    2: 'Regulated Order',
    3: 'Efficient Silence',
    4: 'Quiet Utopia',
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`text-xs uppercase tracking-widest mb-3 transition-colors duration-[6000ms] ${
          isStage4 ? 'text-neutral-700' : 'text-neutral-500'
        }`}
      >
        City Overview
      </div>

      <div
        className={`flex justify-between text-xs mb-4 transition-colors duration-[6000ms] ${
          isStage4 ? 'text-neutral-700' : 'text-neutral-500'
        }`}
      >
        <span>
          Turn{' '}
          <span
            className={`transition-colors duration-[6000ms] ${
              isStage4 ? 'text-neutral-500' : 'text-neutral-200'
            }`}
          >
            {turn}
          </span>
          /{maxTurns}
        </span>
        <span
          className={`transition-colors duration-[6000ms] ${
            isStage4 ? 'text-neutral-700' : 'text-neutral-400'
          }`}
        >
          {STAGE_NAMES[stage]}
        </span>
        <span>
          Cap{' '}
          <span
            className={`transition-colors duration-[6000ms] ${
              isStage4 ? 'text-neutral-500' : 'text-neutral-200'
            }`}
          >
            {remainingCapacity}/{governanceCapacity}
          </span>
        </span>
      </div>

      {(Object.keys(metrics) as MetricKey[]).map((key) => (
        <MetricBar key={key} metricKey={key} value={metrics[key]} isStage4={isStage4} />
      ))}
    </div>
  )
}
