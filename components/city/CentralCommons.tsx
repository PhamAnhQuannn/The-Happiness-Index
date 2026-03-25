'use client'

/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from 'framer-motion'
import type { VisualConfig } from '@/lib/visualMapping'

interface CentralCommonsProps {
  visual: VisualConfig
}

// Sprite positions inside the commons zone (% relative to the commons container)
const CROWD_POSITIONS = [
  { x: 20, y: 55, asset: 'voxel-person-walking', delay: 0 },
  { x: 45, y: 65, asset: 'voxel-crowd-group',    delay: 0.1 },
  { x: 70, y: 50, asset: 'voxel-person-walking', delay: 0.2 },
  { x: 30, y: 40, asset: 'voxel-person-child',   delay: 0.15 },
]

const SITTING_POSITIONS = [
  { x: 35, y: 60, asset: 'voxel-person-sitting', delay: 0 },
  { x: 62, y: 58, asset: 'voxel-person-sitting', delay: 0.1 },
]

export function CentralCommons({ visual }: CentralCommonsProps) {
  const { commons, people } = visual
  const isFree       = people.mode === 'free'
  const isRestricted = people.mode === 'restricted'

  return (
    // Positioned to match the commons hotspot zone in CityScenePanel
    // top: 24%, left: 26%, width: 48%, height: 30%
    <div
      className="absolute pointer-events-none"
      style={{ top: '24%', left: '26%', width: '48%', height: '30%', zIndex: 20 }}
    >
      {/* Fountain */}
      <AnimatePresence mode="wait">
        <motion.img
          key={commons.fountainActive ? 'active' : 'dry'}
          src={commons.fountainActive
            ? '/assets/voxel-fountain-active.svg'
            : '/assets/voxel-fountain-dry.svg'}
          alt=""
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: commons.fountainActive ? 0.85 : 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute"
          style={{ width: '28%', left: '36%', top: '20%' }}
        />
      </AnimatePresence>

      {/* Trees */}
      <AnimatePresence>
        {commons.treesAlive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img src="/assets/voxel-tree.svg"      alt="" draggable={false} className="absolute" style={{ width: '12%', left: '12%', top: '30%' }} />
            <img src="/assets/voxel-tree.svg"      alt="" draggable={false} className="absolute" style={{ width: '10%', left: '76%', top: '25%' }} />
            <img src="/assets/voxel-market-stall.svg" alt="" draggable={false} className="absolute" style={{ width: '14%', left: '60%', top: '55%', opacity: isFree ? 0.8 : 0.3 }} />
            <img src="/assets/voxel-laundry-line.svg" alt="" draggable={false} className="absolute" style={{ width: '12%', left: '20%', top: '60%', opacity: isFree ? 0.7 : 0.2 }} />
          </motion.div>
        )}

        {!commons.treesAlive && (
          <motion.div
            key="dead-trees"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <img src="/assets/voxel-tree-dead.svg" alt="" draggable={false} className="absolute" style={{ width: '12%', left: '12%', top: '30%' }} />
            <img src="/assets/voxel-tree-dead.svg" alt="" draggable={false} className="absolute" style={{ width: '10%', left: '76%', top: '25%' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crowd — free mode */}
      <AnimatePresence>
        {commons.showCrowdGroup && isFree && (
          <motion.div
            key="crowd-free"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            {CROWD_POSITIONS.map((p, i) => (
              <motion.img
                key={i}
                src={`/assets/${p.asset}.svg`}
                alt=""
                draggable={false}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: p.delay, duration: 0.6 }}
                className="absolute"
                style={{ width: p.asset === 'voxel-crowd-group' ? '18%' : '8%', left: `${p.x}%`, top: `${p.y}%` }}
              />
            ))}
          </motion.div>
        )}

        {/* Crowd — restricted: only sitting + worker */}
        {commons.showPersonSitting && (isRestricted || !isFree) && (
          <motion.div
            key="crowd-sitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            {SITTING_POSITIONS.map((p, i) => (
              <img
                key={i}
                src={`/assets/${p.asset}.svg`}
                alt=""
                draggable={false}
                className="absolute"
                style={{ width: '8%', left: `${p.x}%`, top: `${p.y}%` }}
              />
            ))}
            <img src="/assets/voxel-person-worker.svg" alt="" draggable={false} className="absolute" style={{ width: '7%', left: '52%', top: '45%', opacity: 0.7 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Propaganda sign — appears when control pressure is high */}
      <AnimatePresence>
        {visual.atmosphere.showPropaganda && (
          <motion.img
            key="propaganda"
            src="/assets/voxel-signage-propaganda.svg"
            alt=""
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute"
            style={{ width: '10%', left: '80%', top: '15%' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
