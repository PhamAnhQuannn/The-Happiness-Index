'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { VisualConfig } from '@/lib/visualMapping'
import type { DistrictId } from '@/types'

interface DistrictTileProps {
  id: DistrictId
  visual: VisualConfig
  // Position as % of the city scene container — matches DISTRICT_HOTSPOTS
  position: { top: number; left: number; width: number; height: number }
}

// Primary building asset per district
const BUILDING_ASSET: Record<DistrictId, string> = {
  residential: '/assets/voxel-building-residential.svg',
  industrial:  '/assets/voxel-warehouse.svg',
  education:   '/assets/voxel-school-building.svg',
  cultural:    '/assets/voxel-building-cultural.svg',
  transit:     '/assets/voxel-train-platform.svg',
}

// Degraded / dark variant (used at stage 3-4 or dark assetVariant)
const BUILDING_ASSET_DARK: Partial<Record<DistrictId, string>> = {
  residential: '/assets/voxel-building-residential-dark.svg',
}

export function DistrictTile({ id, visual, position }: DistrictTileProps) {
  const dv = visual.districts[id]
  if (!dv) return null

  const isDim  = dv.assetVariant === 'dim'
  const isDark = dv.assetVariant === 'dark'

  // Choose building asset — use dark variant if available, else apply CSS filter
  const buildingAsset =
    isDark && BUILDING_ASSET_DARK[id]
      ? BUILDING_ASSET_DARK[id]!
      : BUILDING_ASSET[id]

  // CSS filter adjustments for dim/dark states
  const buildingFilter =
    isDark  ? 'saturate(20%) brightness(55%)' :
    isDim   ? 'saturate(60%) brightness(80%)' :
    'none'

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top:    `${position.top}%`,
        left:   `${position.left}%`,
        width:  `${position.width}%`,
        height: `${position.height}%`,
        zIndex: 18,
      }}
    >
      {/* Primary building */}
      <motion.img
        src={buildingAsset}
        alt=""
        draggable={false}
        animate={{ filter: buildingFilter, opacity: isDark ? 0.6 : 0.75 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        className="absolute"
        style={{ width: '60%', left: '20%', bottom: '10%' }}
      />

      {/* Industrial: smoke — appears when showSmoke */}
      {id === 'industrial' && (
        <AnimatePresence>
          {dv.showSmoke && (
            <motion.img
              key="smoke"
              src="/assets/voxel-smokestack.svg"
              alt=""
              draggable={false}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute"
              style={{ width: '22%', right: '18%', top: '8%' }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Cultural: mural — fades as stage increases */}
      {id === 'cultural' && (
        <motion.img
          src="/assets/voxel-mural-wall.svg"
          alt=""
          draggable={false}
          animate={{ opacity: isDark ? 0.1 : isDim ? 0.35 : 0.65 }}
          transition={{ duration: 3 }}
          className="absolute"
          style={{ width: '35%', right: '5%', bottom: '25%' }}
        />
      )}

      {/* Transit: barrier gate — appears when showBarrier */}
      {id === 'transit' && (
        <AnimatePresence>
          {dv.showBarrier && (
            <motion.img
              key="barrier"
              src="/assets/voxel-barrier-gate.svg"
              alt=""
              draggable={false}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 0.8, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute"
              style={{ width: '15%', left: '30%', bottom: '15%' }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Surveillance camera — education + transit when atmosphere.showSurveillance */}
      {(id === 'education' || id === 'transit') && visual.atmosphere.showSurveillance && (
        <motion.img
          src="/assets/voxel-surveillance-camera.svg"
          alt=""
          draggable={false}
          animate={{ opacity: visual.atmosphere.gridOpacity * 0.8 }}
          transition={{ duration: 2 }}
          className="absolute"
          style={{ width: '8%', right: '10%', top: '10%' }}
        />
      )}
    </div>
  )
}
