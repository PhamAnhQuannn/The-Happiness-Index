'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { VisualConfig } from '@/lib/visualMapping'
import type { DistrictId } from '@/types'

interface IncidentOverlayProps {
  visual: VisualConfig
}

/**
 * Hotspot positions mirror DISTRICT_HOTSPOTS in CityScenePanel.tsx.
 * These are the same bounding boxes — we render overlays within them.
 */
const DISTRICT_POSITIONS: Record<DistrictId, { top: number; left: number; width: number; height: number }> = {
  education:   { top: 2,  left: 28, width: 44, height: 19 },
  industrial:  { top: 20, left: 1,  width: 24, height: 36 },
  cultural:    { top: 20, left: 75, width: 24, height: 36 },
  residential: { top: 56, left: 24, width: 52, height: 24 },
  transit:     { top: 82, left: 0,  width: 100, height: 18 },
}

/**
 * Which SVG effect to show per district when an incident is active.
 */
const DISTRICT_EFFECT: Record<DistrictId, string> = {
  industrial:  '/assets/voxel-smokestack.svg',
  residential: '/assets/voxel-signage-official.svg',
  education:   '/assets/voxel-signage-propaganda.svg',
  cultural:    '/assets/voxel-signage-propaganda.svg',
  transit:     '/assets/voxel-barrier-gate.svg',
}

function DistrictAlertOverlay({ districtId }: { districtId: DistrictId }) {
  const pos = DISTRICT_POSITIONS[districtId]
  const effectSrc = DISTRICT_EFFECT[districtId]

  return (
    <motion.div
      key={districtId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute pointer-events-none"
      style={{
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        width: `${pos.width}%`,
        height: `${pos.height}%`,
      }}
    >
      {/* Amber alert pulse border */}
      <div
        className="absolute inset-0 rounded-sm animate-pulse"
        style={{
          boxShadow: 'inset 0 0 20px rgba(251, 146, 60, 0.18)',
          border: '1px solid rgba(251, 146, 60, 0.3)',
        }}
      />

      {/* Effect icon — bottom-left of the district zone */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={effectSrc}
        alt=""
        aria-hidden="true"
        className="absolute"
        style={{
          width: districtId === 'industrial' ? '28%' : '20%',
          bottom: '8%',
          left: districtId === 'transit' ? '4%' : '6%',
          opacity: 0.75,
        }}
      />

      {/* Amber dot badge — top-right corner */}
      <span
        className="absolute w-2 h-2 rounded-full bg-amber-500 animate-pulse"
        style={{ top: '6%', right: '6%' }}
        aria-hidden="true"
      />
    </motion.div>
  )
}

/**
 * Renders visual alert overlays on affected district zones.
 * Sits between the base city image and the interactive hotspot layer.
 */
export function IncidentOverlay({ visual }: IncidentOverlayProps) {
  const { activeDistrictAlerts } = visual.incidents

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {activeDistrictAlerts.map((districtId) => (
          <DistrictAlertOverlay key={districtId} districtId={districtId} />
        ))}
      </AnimatePresence>
    </div>
  )
}
