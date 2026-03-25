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
    <div className="flex flex-col h-full">
      <div
        className={`text-xs uppercase tracking-widest mb-2 shrink-0 transition-colors duration-[6000ms] ${
          isStage4 ? 'text-neutral-700' : 'text-neutral-500'
        }`}
      >
        Districts
      </div>

      {/* Districts — evenly distributed with consistent padding */}
      <div className="flex flex-col flex-1 min-h-0 justify-around">
        {districts.map((district) => {
          const mood = DISTRICT_STAGE_MOODS[district.id][stage as StageId]
          const tagColor = CONDITION_TAG_COLOR[district.conditionTag] ?? 'text-neutral-600'
          return (
            <div
              key={district.id}
              className={`py-2 border-b last:border-0 transition-colors duration-[6000ms] ${
                isStage4 ? 'border-neutral-900' : 'border-neutral-800/60'
              }`}
            >
            {/* Row 1: alert + name */}
            <div className="flex items-center gap-1.5">
              {district.hasAlert ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-amber-400 text-xs leading-none"
                >
                  !
                </motion.span>
              ) : (
                <span className="text-transparent text-xs select-none leading-none">!</span>
              )}
              <span
                className={`text-xs font-medium capitalize transition-colors duration-[6000ms] ${
                  isStage4 ? 'text-neutral-500' : 'text-neutral-300'
                }`}
              >
                {district.name}
              </span>
            </div>
            {/* Row 2: condition tag + mood + dots */}
            <div className="flex items-center gap-2 pl-4">
              <motion.span
                key={district.conditionTag}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`text-xs font-mono lowercase ${tagColor}`}
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
              <span className="flex items-center ml-auto">
                {LIVELINESS_DOTS(district.livelinessLevel)}
              </span>
            </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
