'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { MetricKey } from '@/types'

const METRIC_LABELS: Record<MetricKey, string> = {
  happinessIndex: 'HI',
  productivity: 'Prod',
  safety: 'Safety',
  stress: 'Stress',
  publicTrust: 'Trust',
}

function DeltaBadge({ label, delta }: { label: string; delta: number }) {
  if (delta === 0) return null
  const positive = delta > 0
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`text-xs font-mono ${positive ? 'text-emerald-400' : 'text-red-400'}`}
    >
      {label} {positive ? '+' : ''}
      {delta}
    </motion.span>
  )
}

export function FeedbackPanel() {
  const feedback = useGameStore((s) => s.lastFeedback)
  const stage = useGameStore((s) => s.stage)
  const isStage4 = stage === 4

  const metricEntries = feedback
    ? (Object.entries(feedback.metricDeltas) as [MetricKey, number][]).filter(
        ([, v]) => v !== 0
      )
    : []

  return (
    <div className="transition-colors duration-[6000ms]">
      <div
        className={`text-xs uppercase tracking-widest mb-2 sticky top-0 bg-neutral-950 pb-1 transition-colors duration-[6000ms] ${
          isStage4 ? 'text-neutral-700' : 'text-neutral-500'
        }`}
      >
        {feedback ? `Feedback — Turn ${feedback.turn}` : 'Feedback'}
        {feedback?.stageChanged && (
          <span className="ml-2 text-amber-400">◈ Stage changed</span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.div
            key={feedback.turn}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Citizen line */}
            {feedback.citizenLine && (
              <p
                className={`text-xs italic mb-1.5 transition-colors duration-[6000ms] ${
                  isStage4 ? 'text-neutral-600' : 'text-neutral-400'
                }`}
              >
                &ldquo;{feedback.citizenLine}&rdquo;
              </p>
            )}

            {/* News line */}
            {feedback.newsLine && (
              <p
                className={`text-xs mb-2 transition-colors duration-[6000ms] ${
                  isStage4 ? 'text-neutral-700' : 'text-neutral-600'
                }`}
              >
                {feedback.newsLine}
              </p>
            )}

            {/* Metric deltas */}
            {metricEntries.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {metricEntries.map(([key, delta]) => (
                  <DeltaBadge key={key} label={METRIC_LABELS[key]} delta={delta} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs italic transition-colors duration-[6000ms] ${
              isStage4 ? 'text-neutral-700' : 'text-neutral-600'
            }`}
          >
            End your first turn to see the city&apos;s response.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
