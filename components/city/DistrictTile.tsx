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
 * Per-district SVG building + effect overlay.
 * Positioned absolutely over the matching zone in CityScenePanel.
 * Asset variant and effects driven entirely by VisualConfig.
 */

const BUILDING_ASSETS: Record<DistrictId, { normal: string; dark: string }> = {
  residential: {
    normal: '/assets/voxel-building-residential.svg',
    dark:   '/assets/voxel-building-residential-dark.svg',
  },
  industrial: {
    normal: '/assets/voxel-warehouse.svg',
    dark:   '/assets/voxel-warehouse.svg',
  },
  education: {
    normal: '/assets/voxel-school-building.svg',
    dark:   '/assets/voxel-school-building.svg',
  },
  cultural: {
    normal: '/assets/voxel-building-cultural.svg',
    dark:   '/assets/voxel-building-cultural.svg',
  },
  transit: {
    normal: '/assets/voxel-train-platform.svg',
    dark:   '/assets/voxel-train-platform.svg',
  },
}

export function DistrictTile({ id, visual, top, left, width, height }: DistrictTileProps) {
  const dv = visual.districts[id]
  const assets = BUILDING_ASSETS[id]
  const isDark = dv.assetVariant === 'dark'
  const isDim  = dv.assetVariant === 'dim'

  // Opacity: normal → full, dim → reduced, dark → low
  const buildingOpacity = isDark ? 0.45 : isDim ? 0.7 : 0.88

  // Cultural district desaturates when dim/dark
  const buildingFilter =
    id === 'cultural' && isDark ? 'grayscale(0.9) brightness(0.6)' :
    id === 'cultural' && isDim  ? 'grayscale(0.4) brightness(0.8)' :
    undefined

  const src = isDark ? assets.dark : assets.normal

  return (
    <div
      className="absolute pointer-events-none"
      style={{ top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }}
    >
      {/* Main building SVG */}
      <motion.img
        src={src}
        alt=""
        aria-hidden="true"
        animate={{ opacity: buildingOpacity }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        className="absolute"
        style={{ width: '60%', bottom: '10%', left: '20%', filter: buildingFilter }}
      />

      {/* Industrial smoke — visible when stress > 60 or incident active */}
      {id === 'industrial' && (
        <motion.img
          src="/assets/voxel-smokestack.svg"
          alt=""
          aria-hidden="true"
          animate={{ opacity: dv.showSmoke ? 0.7 : 0 }}
          transition={{ duration: 2 }}
          className="absolute"
          style={{ width: '30%', bottom: '55%', left: '15%' }}
        />
      )}

      {/* Transit barrier — visible when freedom < 40 */}
      {id === 'transit' && (
        <motion.img
          src="/assets/voxel-barrier-gate.svg"
          alt=""
          aria-hidden="true"
          animate={{ opacity: dv.showBarrier ? 0.75 : 0 }}
          transition={{ duration: 2 }}
          className="absolute"
          style={{ width: '25%', bottom: '20%', right: '10%' }}
        />
      )}

      {/* Surveillance camera — appears on all districts when freedom < 60 */}
      {visual.atmosphere.showSurveillance && (
        <motion.img
          src="/assets/voxel-surveillance-camera.svg"
          alt=""
          aria-hidden="true"
          animate={{ opacity: isDark ? 0.6 : 0.35 }}
          transition={{ duration: 2 }}
          className="absolute"
          style={{ width: '14%', top: '6%', right: '8%' }}
        />
      )}
    </div>
  )
}

