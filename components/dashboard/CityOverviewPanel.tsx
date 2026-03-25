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

// Control Pressure pip display (1–8 scale)
function ControlPressurePips({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 8 }, (_, i) => {
        const filled = i < value
        const isDanger = value >= 6
        const isWarning = value >= 3 && value < 6
        const pipColor = filled
          ? isDanger
            ? 'bg-red-600'
            : isWarning
            ? 'bg-amber-500'
            : 'bg-neutral-500'
          : 'bg-neutral-800'
        return (
          <motion.span
            key={i}
            animate={{ opacity: filled ? 1 : 0.3 }}
            transition={{ duration: 0.6 }}
            className={`inline-block w-1.5 h-1.5 rounded-sm ${pipColor} transition-colors duration-500`}
          />
        )
      })}
    </div>
  )
}

// Compliance bar
function ComplianceBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  const color =
    value >= 70
      ? 'bg-blue-600'
      : value >= 45
      ? 'bg-neutral-500'
      : 'bg-neutral-700'
  return (
    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
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
  const controlPressure = useGameStore((s) => s.controlPressure)
  const compliance = useGameStore((s) => s.compliance)
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

      {/* Control Pressure & Compliance */}
      <div className={`mt-3 pt-3 border-t transition-colors duration-[6000ms] ${isStage4 ? 'border-neutral-900' : 'border-neutral-800'}`}>
        {/* Control Pressure */}
        <div className="mb-2.5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className={`uppercase tracking-widest transition-colors duration-[6000ms] ${isStage4 ? 'text-neutral-700' : 'text-neutral-500'}`}>
              Control Pressure
            </span>
            <span className={`font-mono transition-colors duration-[6000ms] ${
              controlPressure >= 6
                ? 'text-red-500'
                : controlPressure >= 3
                ? 'text-amber-500'
                : isStage4
                ? 'text-neutral-600'
                : 'text-neutral-400'
            }`}>
              {controlPressure}
            </span>
          </div>
          <ControlPressurePips value={controlPressure} />
        </div>

        {/* Compliance */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className={`uppercase tracking-widest transition-colors duration-[6000ms] ${isStage4 ? 'text-neutral-700' : 'text-neutral-500'}`}>
              Compliance
            </span>
            <span className={`font-mono transition-colors duration-[6000ms] ${isStage4 ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {compliance}
            </span>
          </div>
          <ComplianceBar value={compliance} />
        </div>
      </div>
    </div>
  )
}
