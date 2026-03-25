'use client'

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { deriveVisualConfig } from '@/lib/visualMapping'
import { CentralCommons } from '@/components/city/CentralCommons'
import { IncidentOverlay } from '@/components/city/IncidentOverlay'
import { DistrictTile } from '@/components/city/DistrictTile'
import type { DistrictId, StageId, District } from '@/types'

/* ─────────────────────────────────────────────
   Stage → City Image mapping
   Stage 1 (Managed Normalcy)   = Vibrant city, peak happiness
   Stage 2 (Regulated Order)    = Slightly muted, still good
   Stage 3 (Efficient Silence)  = Dystopian with first cracks
   Stage 4 (Quiet Utopia)       = Full dystopia, grey & controlled
   ───────────────────────────────────────────── */

const STAGE_IMAGES: Record<StageId, string> = {
  1: '/city/stage-1-managed-normalcy.png',
  2: '/city/stage-2-regulated-order.png',
  3: '/city/stage-3-efficient-silence.png',
  4: '/city/stage-4-quiet-utopia.png',
}

/* ─────────────────────────────────────────────
   District hotspot zones — positioned over the
   matching areas in the isometric city images.
   Coordinates are % of the image dimensions.
   ───────────────────────────────────────────── */

type DistrictHotspot = {
  id: DistrictId | 'commons'
  label: string
  labelStage4?: string  // renamed label for dystopian stage
  icon: string
  // Bounding box as % of container
  top: number
  left: number
  width: number
  height: number
}

const DISTRICT_HOTSPOTS: DistrictHotspot[] = [
  {
    // Top-center strip — school building frontage
    id: 'education',
    label: 'Education',
    labelStage4: 'Skill-Acquisition Unit',
    icon: '🎓',
    top: 2,
    left: 28,
    width: 44,
    height: 19,
  },
  {
    // Left column — warehouse / factory yard only, not the road
    id: 'industrial',
    label: 'Industrial',
    icon: '🏭',
    top: 20,
    left: 1,
    width: 24,
    height: 36,
  },
  {
    // Centre plaza — park / commons area between districts
    id: 'commons',
    label: 'Central Commons',
    labelStage4: 'Movement Optimization Zone',
    icon: '🌳',
    top: 24,
    left: 26,
    width: 48,
    height: 30,
  },
  {
    // Right column — arts / cultural buildings, tighter
    id: 'cultural',
    label: 'Cultural',
    labelStage4: 'Data-Processing Center',
    icon: '🎭',
    top: 20,
    left: 75,
    width: 24,
    height: 36,
  },
  {
    // Lower-centre band — residential blocks
    id: 'residential',
    label: 'Residential',
    icon: '🏘️',
    top: 56,
    left: 24,
    width: 52,
    height: 24,
  },
  {
    // Bottom strip — transit / roads
    id: 'transit',
    label: 'Transit',
    icon: '🚇',
    top: 82,
    left: 0,
    width: 100,
    height: 18,
  },
]

/* ─────────────────────────────────────────────
   District colors — for hover states & labels
   ───────────────────────────────────────────── */

const DISTRICT_COLORS: Record<DistrictId | 'commons', {
  glow: string
  label: string
  labelDark: string
}> = {
  education:   { glow: 'rgba(100, 140, 200, 0.15)', label: '#8ab4f8', labelDark: '#4a6080' },
  industrial:  { glow: 'rgba(180, 140, 60, 0.15)',  label: '#d4a84a', labelDark: '#6a5430' },
  cultural:    { glow: 'rgba(200, 90, 120, 0.15)',   label: '#e87090', labelDark: '#7a3848' },
  residential: { glow: 'rgba(140, 180, 70, 0.15)',   label: '#a4cc50', labelDark: '#506828' },
  transit:     { glow: 'rgba(110, 110, 180, 0.15)',  label: '#9090d0', labelDark: '#484868' },
  commons:     { glow: 'rgba(80, 180, 80, 0.15)',    label: '#60cc60', labelDark: '#306030' },
}

/* ─────────────────────────────────────────────
   District Hotspot Overlay — interactive layer
   positioned over the actual city image
   ───────────────────────────────────────────── */

function DistrictHotspotOverlay({
  hotspot,
  stage,
  district,
  isHovered,
  onHover,
  onLeave,
}: {
  hotspot: DistrictHotspot
  stage: StageId
  district?: District
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const colors = DISTRICT_COLORS[hotspot.id]
  const hasAlert = district?.hasAlert ?? false
  const liveliness = district?.livelinessLevel ?? 5
  const mood = district?.currentMoodLabel ?? ''
  const isStage4 = stage === 4
  const displayLabel = isStage4 && hotspot.labelStage4
    ? hotspot.labelStage4
    : hotspot.label

  // Tooltip vertical: below for top-edge zones, above for everything else
  const tooltipBelow = hotspot.top < 22

  // Tooltip horizontal: pin to whichever edge is closer so it never overflows
  const hotspotRight = hotspot.left + hotspot.width
  const tooltipAlign: React.CSSProperties =
    hotspot.left < 12
      ? { left: 0, transform: 'none' }                      // near left edge → pin left
      : hotspotRight > 88
        ? { left: 'auto', right: 0, transform: 'none' }     // near right edge → pin right
        : { left: '50%', transform: 'translateX(-50%)' }    // otherwise → center

  return (
    <button
      type="button"
      aria-label={`${displayLabel} district${hasAlert ? ' — has active incident' : ''}`}
      className="absolute cursor-pointer transition-all duration-500 group focus:outline-none"
      style={{
        top: `${hotspot.top}%`,
        left: `${hotspot.left}%`,
        width: `${hotspot.width}%`,
        height: `${hotspot.height}%`,
        background: 'transparent',
        border: 'none',
        padding: 0,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
    >
      {/* Hover highlight border — subtler, 1px, lower opacity */}
      <div
        className="absolute inset-0 rounded-sm transition-all duration-300 pointer-events-none"
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isHovered
            ? (isStage4 ? `${colors.labelDark}90` : `${colors.label}90`)
            : 'transparent',
          backgroundColor: isHovered
            ? colors.glow   // already low-opacity rgba value
            : 'transparent',
          boxShadow: isHovered
            ? `inset 0 0 16px ${colors.glow}`
            : 'none',
        }}
      />

      {/* Incident alert pulse — kept but softer */}
      {hasAlert && (
        <div
          className="absolute inset-0 rounded-sm animate-pulse pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 16px rgba(255, 160, 0, 0.12)',
            border: '1px solid rgba(255, 160, 0, 0.25)',
          }}
        />
      )}

      {/* Info tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: tooltipBelow ? -4 : 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute pointer-events-none"
            style={{
              zIndex: 50,
              ...(tooltipBelow
                ? { top: '100%', marginTop: '6px' }
                : { bottom: '100%', marginBottom: '6px' }),
              ...tooltipAlign,
            }}
          >
            <div
              className="px-3 py-2 rounded-lg shadow-xl backdrop-blur-md border min-w-[140px] max-w-[200px] whitespace-nowrap"
              style={{
                backgroundColor: isStage4
                  ? 'rgba(10, 10, 16, 0.95)'
                  : 'rgba(15, 15, 25, 0.92)',
                borderColor: isStage4
                  ? 'rgba(40, 40, 50, 0.6)'
                  : 'rgba(60, 60, 80, 0.6)',
              }}
            >
              {/* District name */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs" aria-hidden="true">{hotspot.icon}</span>
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: isStage4 ? colors.labelDark : colors.label }}
                >
                  {displayLabel}
                </span>
                {hasAlert && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-1"
                    aria-label="active incident"
                  />
                )}
              </div>

              {/* Mood + liveliness */}
              {district && (
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[10px] truncate"
                    style={{
                      color: isStage4 ? 'rgba(120,120,140,0.7)' : 'rgba(180,180,200,0.7)',
                    }}
                  >
                    {mood}
                  </span>
                  <span className="flex gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: i < liveliness
                            ? (isStage4 ? colors.labelDark : colors.label)
                            : 'rgba(30,30,40,0.8)',
                        }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

/* ─────────────────────────────────────────────
   MAIN CITY SCENE PANEL
   Image-based with crossfading stage transitions
   and interactive district hotspot overlays
   ───────────────────────────────────────────── */

export function CityScenePanel() {
  const stage = useGameStore((s) => s.stage)
  const districts = useGameStore((s) => s.districts)
  // Derive the full visual config from the entire game state
  const gameState = useGameStore((s) => s)
  const visual = useMemo(() => deriveVisualConfig(gameState), [gameState])

  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  const districtMap = useMemo(() => {
    const map: Partial<Record<DistrictId, District>> = {}
    districts.forEach((d) => { map[d.id] = d })
    return map
  }, [districts])

  // Grid opacity now comes from VisualConfig (moved out of inline logic)
  const surveillanceOpacity = visual.atmosphere.gridOpacity * 0.35

  return (
    <div className="relative w-full aspect-[10/7] rounded-lg overflow-hidden bg-[#0a0a10] border border-neutral-800/40 shadow-2xl">

      {/* ── Stage images with crossfade ── */}
      {([1, 2, 3, 4] as StageId[]).map((s) => (
        <img
          key={s}
          src={STAGE_IMAGES[s]}
          alt={`City at stage ${s}`}
          draggable={false}
          className="absolute inset-0 w-full h-full object-fill select-none"
          style={{
            opacity: stage === s ? 1 : 0,
            transition: 'opacity 3s ease-in-out',
            zIndex: stage === s ? 1 : 0,
          }}
        />
      ))}

      {/* ── Dark vignette around edges ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          boxShadow: `inset 0 0 80px rgba(0,0,0,${stage >= 3 ? 0.7 : 0.4})`,
        }}
      />

      {/* ── District tile overlays (buildings + effects) — z-11 ── */}
      <div className="absolute inset-0 z-[11] pointer-events-none">
        {([
          { id: 'education',   top: 2,  left: 28, width: 44, height: 19 },
          { id: 'industrial',  top: 20, left: 1,  width: 24, height: 36 },
          { id: 'cultural',    top: 20, left: 75, width: 24, height: 36 },
          { id: 'residential', top: 56, left: 24, width: 52, height: 24 },
          { id: 'transit',     top: 82, left: 0,  width: 100, height: 18 },
        ] as { id: DistrictId; top: number; left: number; width: number; height: number }[]).map((d) => (
          <DistrictTile key={d.id} id={d.id} visual={visual} top={d.top} left={d.left} width={d.width} height={d.height} />
        ))}
      </div>

      {/* ── Central Commons vitality overlay — z-12 ── */}
      <div
        className="absolute pointer-events-none z-[12]"
        style={{ top: '24%', left: '26%', width: '48%', height: '30%' }}
      >
        <CentralCommons visual={visual} />
      </div>

      {/* ── Incident alert overlays on district zones — z-13 ── */}
      <div className="absolute inset-0 z-[13] pointer-events-none">
        <IncidentOverlay visual={visual} />
      </div>

      {/* ── Surveillance grid overlay for low freedom — z-15 ── */}
      {surveillanceOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-[4000ms]"
          style={{
            zIndex: 15,
            opacity: surveillanceOpacity,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(100,120,180,0.06) 40px, rgba(100,120,180,0.06) 41px),' +
              'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(100,120,180,0.06) 40px, rgba(100,120,180,0.06) 41px)',
          }}
        />
      )}

      {/* ── Stage transition CSS filter tint ── */}
      {stage >= 3 && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-[4000ms]"
          style={{
            zIndex: 16,
            backgroundColor: stage === 4
              ? 'rgba(10, 15, 25, 0.25)'
              : 'rgba(10, 12, 20, 0.12)',
          }}
        />
      )}

      {/* ── Interactive district hotspot overlays ── */}
      <div className="absolute inset-0 z-30">
        {DISTRICT_HOTSPOTS.map((hotspot) => (
          <DistrictHotspotOverlay
            key={hotspot.id}
            hotspot={hotspot}
            stage={stage}
            district={
              hotspot.id === 'commons'
                ? undefined
                : districtMap[hotspot.id as DistrictId]
            }
            isHovered={hoveredDistrict === hotspot.id}
            onHover={() => setHoveredDistrict(hotspot.id)}
            onLeave={() => setHoveredDistrict(null)}
          />
        ))}
      </div>

      {/* ── Stage indicator badge ── */}
      <div className="absolute bottom-3 left-3 z-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md backdrop-blur-md border"
            style={{
              backgroundColor: stage >= 3
                ? 'rgba(10, 10, 16, 0.85)'
                : 'rgba(15, 20, 30, 0.8)',
              borderColor: stage >= 3
                ? 'rgba(40, 40, 55, 0.5)'
                : 'rgba(60, 70, 90, 0.5)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  stage === 1 ? '#4ade80' :
                  stage === 2 ? '#facc15' :
                  stage === 3 ? '#f97316' : '#ef4444',
                boxShadow: `0 0 6px ${
                  stage === 1 ? 'rgba(74,222,128,0.5)' :
                  stage === 2 ? 'rgba(250,204,21,0.5)' :
                  stage === 3 ? 'rgba(249,115,22,0.5)' : 'rgba(239,68,68,0.5)'
                }`,
              }}
            />
            <span
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{
                color: stage >= 3 ? '#666680' : '#a0a8c0',
              }}
            >
              {stage === 1 ? 'Managed Normalcy' :
               stage === 2 ? 'Regulated Order' :
               stage === 3 ? 'Efficient Silence' : 'Quiet Utopia'}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Happiness score badge (top-right) ── */}
      <HappinessScoreBadge />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Happiness Index score overlay badge
   ───────────────────────────────────────────── */

function HappinessScoreBadge() {
  const happiness = useGameStore((s) => s.metrics.happinessIndex)
  const stage = useGameStore((s) => s.stage)
  const isStage4 = stage === 4

  const scoreColor =
    happiness >= 75 ? '#4ade80' :
    happiness >= 50 ? '#facc15' :
    happiness >= 30 ? '#f97316' : '#ef4444'

  return (
    <div className="absolute top-3 right-3 z-40">
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-md backdrop-blur-md border"
        style={{
          backgroundColor: isStage4
            ? 'rgba(10, 10, 16, 0.85)'
            : 'rgba(15, 20, 30, 0.8)',
          borderColor: isStage4
            ? 'rgba(40, 40, 55, 0.5)'
            : 'rgba(60, 70, 90, 0.5)',
        }}
      >
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: isStage4 ? '#555568' : '#808898' }}
        >
          Happiness
        </span>
        <motion.span
          key={happiness}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-sm font-bold font-mono"
          style={{ color: scoreColor }}
        >
          {happiness}
        </motion.span>
      </motion.div>
    </div>
  )
}
