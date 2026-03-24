'use client'

import { motion } from 'framer-motion'
import type { DistrictId } from '@/types'
import { INCIDENT_ANCHORS, SHEETS, CELL, SCALE } from './citySceneConfig'

interface IncidentOverlayProps {
  alertDistricts: Set<DistrictId>
  hoveredDistrict: DistrictId | null
}

function BeaconSprite() {
  const s = SCALE.effect
  return (
    <div
      aria-hidden="true"
      style={{
        width: s.w, height: s.h,
        backgroundImage: `url('${SHEETS.effects.src}')`,
        backgroundSize: `${s.w * 4}px ${s.h}px`,
        backgroundPosition: `${-(CELL.eBeacon * s.w)}px 0px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  )
}

function WarningBeacon({ districtId, isHovered }: { districtId: DistrictId; isHovered: boolean }) {
  const anchor = INCIDENT_ANCHORS[districtId]
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: `${anchor.x}%`, top: `${anchor.y}%`, transform: 'translate(-50%, -100%)', zIndex: 20 }}
    >
      <motion.div
        animate={{ opacity: [1, 0.45, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BeaconSprite />
      </motion.div>
      <motion.div
        className="absolute rounded-full border border-red-500/60"
        style={{ width: 28, height: 28, bottom: -6, left: '50%', marginLeft: -14 }}
        animate={{ scale: [1, 1.9, 1], opacity: [0.65, 0, 0.65] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
      {isHovered && (
        <motion.div
          className="absolute left-8 top-2 bg-neutral-900/90 border border-red-500/50 rounded px-1.5 py-0.5 text-[8px] text-red-400 uppercase tracking-widest whitespace-nowrap"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
        >
          ⚠ Incident Active
        </motion.div>
      )}
    </div>
  )
}

export function IncidentOverlay({ alertDistricts, hoveredDistrict }: IncidentOverlayProps) {
  if (alertDistricts.size === 0) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded">
      {Array.from(alertDistricts).map((id) => (
        <WarningBeacon key={id} districtId={id} isHovered={hoveredDistrict === id} />
      ))}
    </div>
  )
}
