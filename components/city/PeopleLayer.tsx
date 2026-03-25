'use client'

/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from 'framer-motion'
import type { VisualConfig, CrowdMode } from '@/lib/visualMapping'

interface PeopleLayerProps {
  visual: VisualConfig
}

/**
 * People sprites scattered across the city scene.
 * Reacts entirely to visual.people.mode (derived from freedom).
 *
 * free       → varied types, organic scatter, feels lived-in
 * restricted → fewer people, mostly workers, aligned rows
 * static     → minimal, rigid, one or two figures
 *
 * All positions are % of the full city panel container.
 * People are placed in the commons + residential zones where they are
 * plausible in the city photo — not over buildings or roads.
 */

type PersonSprite = {
  src: string
  top: number
  left: number
  width: number
  flipX?: boolean
  delay?: number
}

// Free mode — varied, organic, happy-looking scatter
const FREE_PEOPLE: PersonSprite[] = [
  { src: '/assets/voxel-person-walking.svg', top: 52, left: 32, width: 3.5 },
  { src: '/assets/voxel-person-child.svg',   top: 54, left: 38, width: 2.8, delay: 0.2 },
  { src: '/assets/voxel-person-walking.svg', top: 50, left: 55, width: 3.2, flipX: true, delay: 0.4 },
  { src: '/assets/voxel-person-child.svg',   top: 56, left: 62, width: 2.6, delay: 0.1 },
  { src: '/assets/voxel-person-sitting.svg', top: 44, left: 44, width: 2.8, delay: 0.6 },
  { src: '/assets/voxel-person-walking.svg', top: 46, left: 50, width: 3.0, delay: 0.3 },
  { src: '/assets/voxel-person-child.svg',   top: 48, left: 30, width: 2.5, delay: 0.5 },
  { src: '/assets/voxel-person-sitting.svg', top: 43, left: 58, width: 2.8, flipX: true, delay: 0.7 },
]

// Restricted mode — fewer people, mostly workers, semi-aligned
const RESTRICTED_PEOPLE: PersonSprite[] = [
  { src: '/assets/voxel-person-worker.svg',  top: 52, left: 34, width: 3.2 },
  { src: '/assets/voxel-person-worker.svg',  top: 52, left: 42, width: 3.2, delay: 0.3 },
  { src: '/assets/voxel-person-worker.svg',  top: 52, left: 56, width: 3.2, flipX: true, delay: 0.15 },
  { src: '/assets/voxel-person-sitting.svg', top: 45, left: 48, width: 2.6, delay: 0.4 },
]

// Static mode — minimal presence, rigid
const STATIC_PEOPLE: PersonSprite[] = [
  { src: '/assets/voxel-person-worker.svg', top: 53, left: 40, width: 3.0 },
  { src: '/assets/voxel-person-worker.svg', top: 53, left: 52, width: 3.0, flipX: true, delay: 0.2 },
]

const SPRITE_SETS: Record<CrowdMode, PersonSprite[]> = {
  free:       FREE_PEOPLE,
  restricted: RESTRICTED_PEOPLE,
  static:     STATIC_PEOPLE,
}

// Opacity of the whole layer per mode — static feels ghost-like
const LAYER_OPACITY: Record<CrowdMode, number> = {
  free:       0.72,
  restricted: 0.58,
  static:     0.38,
}

export function PeopleLayer({ visual }: PeopleLayerProps) {
  const mode = visual.people.mode
  const sprites = SPRITE_SETS[mode]
  const layerOpacity = LAYER_OPACITY[mode]

  // Hide layer entirely at stage 4 — the city is hollow
  if (visual.stage === 4) return null

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: layerOpacity,
        transition: 'opacity 3s ease-in-out',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8 }}
          className="absolute inset-0"
        >
          {sprites.map((p, i) => (
            <img
              key={i}
              src={p.src}
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${p.width}%`,
                transform: p.flipX ? 'scaleX(-1)' : undefined,
                // Stagger the appear animation via CSS delay
                animationDelay: p.delay ? `${p.delay}s` : undefined,
                // Tiny position jitter per sprite so free mode doesn't look grid-aligned
                marginTop: mode === 'free' ? `${(i % 3) * 0.3}%` : 0,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
