'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

export function EndingScreen() {
  const ending = useGameStore((s) => s.ending)
  const resetGame = useGameStore((s) => s.resetGame)

  const isWin =
    ending?.status === 'won-utopia' || ending?.status === 'won-quiet-utopia'
  const isQuietUtopia = ending?.status === 'won-quiet-utopia'

  return (
    <AnimatePresence>
      {ending && (
        <motion.div
          key="ending-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Quiet Utopia fades in very slowly — no celebration
          transition={{ duration: isQuietUtopia ? 4 : 0.6, ease: 'easeInOut' }}
        >
          <motion.div
            className={`max-w-md w-full mx-4 border bg-neutral-900 rounded p-8 ${
              isQuietUtopia
                ? 'border-neutral-900'
                : isWin
                ? 'border-neutral-800'
                : 'border-neutral-800'
            }`}
            initial={{ opacity: 0, y: isQuietUtopia ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: isQuietUtopia ? 5 : 0.5,
              ease: 'easeOut',
              delay: isQuietUtopia ? 1 : 0.2,
            }}
          >
            {/* Status tag */}
            <div
              className={`text-xs uppercase tracking-widest mb-4 ${
                isQuietUtopia
                  ? 'text-neutral-600'
                  : isWin
                  ? 'text-neutral-400'
                  : 'text-red-500'
              }`}
            >
              {isWin ? 'Run Complete' : 'System Failure'}
            </div>

            {/* Title */}
            <h2
              className={`text-xl font-light mb-4 ${
                isQuietUtopia
                  ? 'text-neutral-500'
                  : isWin
                  ? 'text-neutral-100'
                  : 'text-red-300'
              }`}
            >
              {ending.title}
            </h2>

            {/* Message — Quiet Utopia gets extra sparse treatment */}
            <p
              className={`text-sm leading-relaxed mb-6 ${
                isQuietUtopia ? 'text-neutral-700' : 'text-neutral-500'
              }`}
            >
              {ending.message}
            </p>

            {/* Final metrics summary */}
            <div
              className={`border-t pt-4 mb-6 ${
                isQuietUtopia ? 'border-neutral-900' : 'border-neutral-800'
              }`}
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {[
                  ['Turn', ending.finalTurn],
                  ['Stage', ending.finalStage],
                  ['HI', ending.finalMetrics.happinessIndex],
                  ['Trust', ending.finalMetrics.publicTrust],
                  ['Prod', ending.finalMetrics.productivity],
                  ['Stress', ending.finalMetrics.stress],
                ].map(([label, value]) => (
                  <span
                    key={label}
                    className={isQuietUtopia ? 'text-neutral-700' : 'text-neutral-600'}
                  >
                    {label}:{' '}
                    <span
                      className={isQuietUtopia ? 'text-neutral-600' : 'text-neutral-400'}
                    >
                      {value}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quiet Utopia gets no triumphant button — just a quiet prompt */}
            <button
              onClick={resetGame}
              className={`w-full py-2.5 text-sm border rounded transition-colors duration-200 ${
                isQuietUtopia
                  ? 'text-neutral-700 border-neutral-800 hover:border-neutral-700 hover:text-neutral-500'
                  : 'text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-neutral-200'
              }`}
            >
              {isQuietUtopia ? 'Begin Again' : 'New Run'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
