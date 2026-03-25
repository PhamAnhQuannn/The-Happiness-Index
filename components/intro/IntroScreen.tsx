'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BRIEFING_LINES = [
  'The city is functioning. Happiness metrics are acceptable.',
  'Your mandate: keep them that way.',
  'You have 12 turns. Each turn, choose up to 2 policies.',
  'The Index will measure your success.',
  'What the Index cannot measure — you will not see.',
]

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const [dismissed, setDismissed] = useState(false)

  function handleStart() {
    setDismissed(true)
    // Small delay so exit animation plays before game loads
    setTimeout(onStart, 600)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="intro-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/98 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.div
            className="max-w-lg w-full mx-6 border border-neutral-800 bg-neutral-900 rounded p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >

            {/* Eyebrow */}
            <div className="text-xs uppercase tracking-[0.3em] text-neutral-600 mb-6">
              Civic Optimization Program — Year 1
            </div>

            {/* Title */}
            <h1 className="text-2xl font-light text-neutral-200 tracking-wide mb-1">
              The Happiness Index
            </h1>
            <p className="text-xs text-neutral-600 uppercase tracking-widest mb-8">
              A governance simulation
            </p>

            {/* Briefing lines */}
            <div className="flex flex-col gap-3 mb-10">
              {BRIEFING_LINES.map((line, i) => (
                <motion.p
                  key={i}
                  className={`text-sm leading-relaxed ${
                    i === BRIEFING_LINES.length - 1
                      ? 'text-neutral-600 italic'
                      : 'text-neutral-400'
                  }`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 + i * 0.1 }}
                >
                  {i < BRIEFING_LINES.length - 1 && (
                    <span className="text-neutral-700 mr-2 select-none">—</span>
                  )}
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800 mb-8" />

            {/* Metrics reminder */}
            <div className="grid grid-cols-5 gap-2 mb-10">
              {[
                { label: 'Happiness', target: '≥ 80' },
                { label: 'Productivity', target: '≥ 80' },
                { label: 'Safety', target: '≥ 80' },
                { label: 'Stress', target: '≤ 35' },
                { label: 'Trust', target: '≥ 65' },
              ].map(({ label, target }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-600 text-center">
                    {label}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">{target}</span>
                </div>
              ))}
            </div>

            {/* Start button */}
            <motion.button
              onClick={handleStart}
              className="w-full py-3 text-xs uppercase tracking-[0.25em] border border-neutral-700 text-neutral-300 rounded hover:border-neutral-400 hover:text-neutral-100 transition-colors duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Begin Optimisation
            </motion.button>

            <p className="text-center text-[10px] text-neutral-800 mt-4 tracking-widest uppercase">
              The city is waiting.
            </p>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
