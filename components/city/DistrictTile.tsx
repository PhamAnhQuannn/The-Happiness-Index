'use client'

import { motion } from 'framer-motion'
import type { DistrictId } from '@/types'
import type { VisualConfig } from '@/lib/visualMapping'

interface DistrictTileProps {
  id: DistrictId
  visual: VisualConfig
  /** Position as % of the city panel container */
  top: number
  left: number
  width: number
  height: number
}

/**
 * Per-district effect overlay — sits on top of the existing city photo.
 *
 * Design rule: The city photo already contains the buildings. This component
 * does NOT re-draw buildings. Instead it adds:
 *   - A dim/dark colour wash over the district zone (stage-driven)
 *   - Smoke effect (industrial only, stress > 60 or incident)
 *   - Barrier gate (transit only, freedom < 40)
 *   - Surveillance camera badge (all districts, freedom < 60)
 *
 * All effects animate in/out smoothly so transitions feel alive.
 */
export function DistrictTile({ id, visual, top, left, width, height }: DistrictTileProps) {
  const dv = visual.districts[id]
  const isDark = dv.assetVariant === 'dark'
  const isDim  = dv.assetVariant === 'dim'

  // Stage-driven colour wash over the district zone.
  // Keeps the underlying photo visible — just tones it down.
  const washOpacity  = isDark ? 0.45 : isDim ? 0.22 : 0
  const washColor    =
    id === 'cultural' && isDark ? 'rgba(20,20,30,1)' :
    id === 'cultural' && isDim  ? 'rgba(20,20,30,1)' :
    'rgba(8,10,18,1)'

  // Cultural gets a greyscale filter applied to the wash so it desaturates.
  const washFilter =
    id === 'cultural' && isDark ? 'saturate(0.1) brightness(0.55)' :
    id === 'cultural' && isDim  ? 'saturate(0.4) brightness(0.75)' :
    undefined

  return (
    <div
      className="absolute pointer-events-none"
      style={{ top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }}
    >
      {/* Stage colour wash — darkens/desaturates the zone as stage progresses */}
      <motion.div
        className="absolute inset-0 rounded-sm"
        animate={{ opacity: washOpacity }}
        transition={{ duration: 4, ease: 'easeInOut' }}
        style={{ backgroundColor: washColor, filter: washFilter, mixBlendMode: 'multiply' }}
      />

      {/* Industrial smoke — fades in when stress > 60 or incident active */}
      {id === 'industrial' && (
        <motion.img
          src="/assets/voxel-smokestack.svg"
          alt=""
          aria-hidden="true"
          animate={{ opacity: dv.showSmoke ? 0.65 : 0 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
          className="absolute"
          style={{ width: '32%', bottom: '48%', left: '12%' }}
        />
      )}

      {/* Transit barrier gate — slides in when freedom < 40 */}
      {id === 'transit' && (
        <motion.img
          src="/assets/voxel-barrier-gate.svg"
          alt=""
          aria-hidden="true"
          animate={{ opacity: dv.showBarrier ? 0.8 : 0, y: dv.showBarrier ? 0 : 6 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute"
          style={{ width: '18%', bottom: '18%', left: '38%' }}
        />
      )}

      {/* Surveillance camera badge — top-right corner of each district */}
      <motion.img
        src="/assets/voxel-surveillance-camera.svg"
        alt=""
        aria-hidden="true"
        animate={{ opacity: visual.atmosphere.showSurveillance ? (isDark ? 0.7 : 0.45) : 0 }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
        className="absolute"
        style={{ width: '12%', top: '5%', right: '5%' }}
      />
    </div>
  )
}

