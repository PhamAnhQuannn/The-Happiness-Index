'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { CityOverviewPanel } from '@/components/dashboard/CityOverviewPanel'
import { DistrictPanel } from '@/components/districts/DistrictPanel'
import { IncidentPanel } from '@/components/incidents/IncidentPanel'
import { PolicyPanel } from '@/components/policies/PolicyPanel'
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel'
import { EndingScreen } from '@/components/endings/EndingScreen'
import { stageCSSFilter } from '@/lib/stageEngine'
import { drawPolicyHand } from '@/lib/turnEngine'
import { getIncidentsAvailableAtTurn } from '@/data/incidents'
import { initAudio, transitionToStage, stopAudio } from '@/lib/audioEngine'
import type { ActiveIncident } from '@/types'

function weightedPick<T extends { weight: number }>(pool: T[], count: number): T[] {
  const selected: T[] = []
  const remaining = [...pool]
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((s, item) => s + item.weight, 0)
    let rand = Math.random() * totalWeight
    const idx = remaining.findIndex((item) => {
      rand -= item.weight
      return rand <= 0
    })
    if (idx >= 0) {
      selected.push(remaining[idx])
      remaining.splice(idx, 1)
    }
  }
  return selected
}

const STAGE_NAMES: Record<number, string> = {
  1: 'Managed Normalcy',
  2: 'Regulated Order',
  3: 'Efficient Silence',
  4: 'Quiet Utopia',
}

export default function GamePage() {
  const stage = useGameStore((s) => s.stage)
  const turn = useGameStore((s) => s.turn)
  const status = useGameStore((s) => s.status)
  const policyHandIds = useGameStore((s) => s.policyHandIds)
  const activeIncidents = useGameStore((s) => s.activeIncidents)
  const setHand = useGameStore((s) => s.setHand)
  const setActiveIncidents = useGameStore((s) => s.setActiveIncidents)
  const endTurn = useGameStore((s) => s.endTurn)
  const selectedPolicyIds = useGameStore((s) => s.selectedPolicyIds)
  const remainingCapacity = useGameStore((s) => s.remainingCapacity)

  // Track previous stage to detect transitions
  const prevStageRef = useRef<number>(stage)
  const flashRef = useRef<HTMLDivElement>(null)
  const audioReady = useRef(false)

  // Initialise hand on first mount
  useEffect(() => {
    if (policyHandIds.length === 0 && status === 'playing') {
      setHand(drawPolicyHand(turn, []))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialise starting incidents on first mount
  useEffect(() => {
    if (activeIncidents.length === 0 && status === 'playing') {
      const pool = getIncidentsAvailableAtTurn(turn, [])
      const picked = weightedPick(pool, 2)
      const initial: ActiveIncident[] = picked.map((inc) => ({
        incidentId: inc.id,
        unresolvedTurns: 0,
        escalated: false,
      }))
      setActiveIncidents(initial)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Detect stage changes → DOM flash + audio transition (no setState in effect)
  useEffect(() => {
    if (stage !== prevStageRef.current) {
      prevStageRef.current = stage
      // Imperatively animate the flash div via the DOM ref
      const el = flashRef.current
      if (el) {
        el.style.opacity = '0.12'
        const timer = setTimeout(() => { el.style.opacity = '0' }, 300)
        return () => clearTimeout(timer)
      }
      // Audio transition
      if (audioReady.current) {
        transitionToStage(stage as 1 | 2 | 3 | 4)
      }
    }
  }, [stage])

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  // Init audio on first End Turn click (satisfies browser autoplay policy)
  function handleEndTurn() {
    if (!audioReady.current) {
      audioReady.current = true
      initAudio()
    }
    endTurn()
  }

  const cssFilter = stageCSSFilter(stage)
  const isStage4 = stage === 4

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-200 transition-all duration-[6000ms]"
      style={{ filter: cssFilter }}
    >
      {/* Stage transition flash — a brief white veil that marks the exact moment */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="fixed inset-0 z-40 pointer-events-none bg-neutral-200 transition-opacity duration-300"
        style={{ opacity: 0 }}
      />

      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-3 flex justify-between items-center">
        <h1
          className={`text-sm font-light tracking-[0.25em] uppercase transition-colors duration-[6000ms] ${
            isStage4 ? 'text-neutral-600' : 'text-neutral-400'
          }`}
        >
          The Happiness Index
        </h1>
        <div className="flex items-center gap-6 text-xs text-neutral-600">
          {/* Stage name animates when it changes */}
          <AnimatePresence mode="wait">
            <motion.span
              key={stage}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className={isStage4 ? 'text-neutral-700' : 'text-neutral-600'}
            >
              Stage {stage} — {STAGE_NAMES[stage]}
            </motion.span>
          </AnimatePresence>
          <span>
            Capacity{' '}
            <span className={isStage4 ? 'text-neutral-600' : 'text-neutral-400'}>
              {remainingCapacity}/5
            </span>
          </span>
        </div>
      </header>

      {/* Main grid */}
      <main className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-49px)]">
        {/* Left column: overview + districts */}
        <aside
          className={`border-r p-5 flex flex-col gap-8 transition-colors duration-[6000ms] ${
            isStage4 ? 'border-neutral-900' : 'border-neutral-800'
          }`}
        >
          <CityOverviewPanel />
          <DistrictPanel />

          {/* End Turn button */}
          {status === 'playing' && (
            <div className="mt-auto">
              <button
                onClick={handleEndTurn}
                className={`w-full py-2.5 text-xs uppercase tracking-widest border rounded transition-colors duration-200 ${
                  isStage4
                    ? 'text-neutral-600 border-neutral-800 hover:border-neutral-700 hover:text-neutral-500'
                    : 'text-neutral-400 border-neutral-700 hover:border-neutral-400 hover:text-neutral-200'
                }`}
              >
                End Turn
              </button>
              {selectedPolicyIds.length > 0 && (
                <p className="text-xs text-neutral-600 text-center mt-2">
                  {selectedPolicyIds.length} polic
                  {selectedPolicyIds.length === 1 ? 'y' : 'ies'} selected
                </p>
              )}
            </div>
          )}
        </aside>

        {/* Right column: incidents + policies + feedback */}
        <section className="p-5 flex flex-col gap-8">
          <IncidentPanel />
          <PolicyPanel />
          <FeedbackPanel />
        </section>
      </main>

      {/* Ending overlay */}
      <EndingScreen />
    </div>
  )
}
