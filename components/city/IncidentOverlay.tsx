'use client'

/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from 'framer-motion'
import type { VisualConfig } from '@/lib/visualMapping'
import type { DistrictId } from '@/types'

interface IncidentOverlayProps {
  visual: VisualConfig
}

// Mirror the hotspot positions from CityScenePanel DISTRICT_HOTSPOTS
// so overlays land exactly on the matching district area
const DISTRICT_POSITIONS: Record<DistrictId, { top: number; left: number; width: number; height: number }> = {
  education:   { top: 2,  left: 28, width: 44, height: 19 },
  industrial:  { top: 20, left: 1,  width: 24, height: 36 },
  cultural:    { top: 20, left: 75, width: 24, height: 36 },
  residential: { top: 56, left: 24, width: 52, height: 24 },
  transit:     { top: 82, left: 0,  width: 100, height: 18 },
}

// Which icon/overlay to use per district
const DISTRICT_OVERLAY_ASSET: Record<DistrictId, string> = {
  industrial:  '/assets/voxel-smokestack.svg',
  residential: '/assets/overlay-vignette.svg',
  education:   '/assets/overlay-vignette.svg',
  cultural:    '/assets/overlay-vignette.svg',
  transit:     '/assets/voxel-barrier-gate.svg',
}

export function IncidentOverlay({ visual }: IncidentOverlayProps) {
  const { activeDistrictAlerts } = visual.incidents

  if (activeDistrictAlerts.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
      <AnimatePresence>
        {activeDistrictAlerts.map((districtId) => {
          const pos = DISTRICT_POSITIONS[districtId]
          if (!pos) return null

          const asset = DISTRICT_OVERLAY_ASSET[districtId]

          return (
            <motion.div
              key={districtId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute"
              style={{
                top:    `${pos.top}%`,
                left:   `${pos.left}%`,
                width:  `${pos.width}%`,
                height: `${pos.height}%`,
              }}
            >
              {/* Amber pulsing border — always shown */}
              <motion.div
                className="absolute inset-0 rounded-sm"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  boxShadow: 'inset 0 0 18px rgba(251, 191, 36, 0.2)',
                  border:    '1px solid rgba(251, 191, 36, 0.35)',
                }}
              />

              {/* District-specific asset overlay */}
              <img
                src={asset}
                alt=""
                draggable={false}
                className="absolute"
                style={{
                  width:  districtId === 'industrial' ? '18%' : '100%',
                  height: districtId === 'industrial' ? 'auto' : '100%',
                  // Industrial: pin smoke to top-right corner of zone
                  ...(districtId === 'industrial'
                    ? { top: '5%', right: '5%', opacity: 0.75 }
                    : { inset: 0, opacity: 0.15, objectFit: 'cover' }),
                }}
              />

              {/* Amber alert dot — top-right corner of zone */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-amber-400"
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ top: '6%', right: '4%' }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
