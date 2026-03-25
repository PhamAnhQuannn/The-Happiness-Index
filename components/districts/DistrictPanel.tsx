'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { DISTRICT_STAGE_MOODS } from '@/data/districts'
import type { DistrictConditionTag, StageId } from '@/types'

// Tag colour tiers — hollow/collapsed/strained = bad; stable tier = neutral
const CONDITION_TAG_COLOR: Record<DistrictConditionTag, string> = {
  // collapsed tier
  hollow: 'text-red-600',
  vacant: 'text-red-600',
  // strained tier
  strained: 'text-amber-500',
  backlogged: 'text-amber-500',
  brittle: 'text-amber-500',
  thinned: 'text-amber-500',
  // control-inflected tier (stable but under pressure)
  orderly: 'text-blue-500',
  frictionless: 'text-blue-400',
  standardized: 'text-blue-400',
  // healthy stable tier
  managed: 'text-neutral-500',
  optimized: 'text-neutral-500',
  hopeful: 'text-neutral-500',
  alive: 'text-neutral-500',
  active: 'text-neutral-500',
  stagnant: 'text-neutral-600',
}

const LIVELINESS_DOTS = (level: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <motion.span
      key={i}
      layout
      animate={{
        opacity: i < level ? 1 : 0.15,
        scale: i < level ? 1 : 0.8,
      }}
      transition={{ duration: 1.2, ease: 'easeInOut', delay: i * 0.08 }}
      className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${
        i < level ? 'bg-neutral-300' : 'bg-neutral-700'
      }`}
    />
  ))

export function DistrictPanel() {
  const districts = useGameStore((s) => s.districts)
  const stage = useGameStore((s) => s.stage)
  const isStage4 = stage === 4

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`text-xs uppercase tracking-widest mb-3 transition-colors duration-[6000ms] ${
          isStage4 ? 'text-neutral-700' : 'text-neutral-500'
        }`}
      >
        Districts
      </div>

      {districts.map((district) => {
        const mood = DISTRICT_STAGE_MOODS[district.id][stage as StageId]
        const tagColor = CONDITION_TAG_COLOR[district.conditionTag] ?? 'text-neutral-600'
        return (
          <div
            key={district.id}
            className={`flex items-center justify-between py-1.5 border-b last:border-0 transition-colors duration-[6000ms] ${
              isStage4 ? 'border-neutral-900' : 'border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {district.hasAlert && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-amber-400 text-xs"
                >
                  !
                </motion.span>
              )}
              {!district.hasAlert && (
                <span className="text-transparent text-xs select-none">!</span>
              )}
              <span
                className={`text-xs capitalize transition-colors duration-[6000ms] ${
                  isStage4 ? 'text-neutral-500' : 'text-neutral-300'
                }`}
              >
                {district.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Condition tag badge */}
              <motion.span
                key={district.conditionTag}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`text-xs font-mono lowercase transition-colors duration-500 ${tagColor}`}
              >
                {district.conditionTag}
              </motion.span>
              <motion.span
                key={mood}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className={`text-xs italic transition-colors duration-[6000ms] ${
                  isStage4 ? 'text-neutral-700' : 'text-neutral-600'
                }`}
              >
                {mood}
              </motion.span>
              <span className="flex items-center">
                {LIVELINESS_DOTS(district.livelinessLevel)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
