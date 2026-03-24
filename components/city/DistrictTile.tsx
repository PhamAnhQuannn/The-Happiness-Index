'use client'

import { motion } from 'framer-motion'
import type { DistrictId, StageId, HiddenValueSet } from '@/types'
import {
  SCALE, SHEETS, CELL, SCENE_RECIPES,
  getBuildingCell, getCharacterCell, getVehicleIndex,
  type SceneObject,
} from './citySceneConfig'

// ─── Props ────────────────────────────────────────────────────────────────────
interface DistrictTileProps {
  id: DistrictId
  name: string
  livelinessLevel: number
  hasAlert: boolean
  stage: StageId
  hiddenValues: HiddenValueSet
  isHighlighted: boolean
  onHover: (id: DistrictId | null) => void
}

// ─── District palette ─────────────────────────────────────────────────────────
const DISTRICT_META: Record<DistrictId, { bg: string; border: string; icon: string }> = {
  residential: { bg: 'bg-amber-900/30',  border: 'border-amber-700/50',  icon: '🏠' },
  industrial:  { bg: 'bg-slate-800/50',  border: 'border-slate-600/50',  icon: '🏭' },
  education:   { bg: 'bg-blue-900/30',   border: 'border-blue-700/50',   icon: '🎓' },
  cultural:    { bg: 'bg-purple-900/30', border: 'border-purple-700/50', icon: '🎭' },
  transit:     { bg: 'bg-green-900/30',  border: 'border-green-700/50',  icon: '🚏' },
}

// ─── Core sprite primitive ────────────────────────────────────────────────────
function Sprite({
  src, col, row, sheetCols, sheetRows = 2, w, h, grayscale = false, opacity = 1,
}: {
  src: string; col: number; row: number
  sheetCols: number; sheetRows?: number
  w: number; h: number
  grayscale?: boolean; opacity?: number
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: w, height: h, flexShrink: 0,
        backgroundImage: `url('${src}')`,
        backgroundSize: `${w * sheetCols}px ${h * sheetRows}px`,
        backgroundPosition: `${-(col * w)}px ${-(row * h)}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        opacity,
        filter: grayscale ? 'grayscale(1)' : undefined,
      }}
    />
  )
}

// ─── Scene object renderer ────────────────────────────────────────────────────
function SceneItem({
  obj, id, stage, hiddenValues,
}: {
  obj: SceneObject
  id: DistrictId
  stage: StageId
  hiddenValues: HiddenValueSet
}) {
  if (obj.stages && !obj.stages.includes(stage)) return null
  if (obj.hideAtStages && obj.hideAtStages.includes(stage)) return null
  if (obj.showIfAbove) {
    const val = hiddenValues[obj.showIfAbove.key] as number
    if (val <= obj.showIfAbove.threshold) return null
  }
  if (obj.hideIfBelow) {
    const val = hiddenValues[obj.hideIfBelow.key] as number
    if (val < obj.hideIfBelow.threshold) return null
  }

  const stageGray = stage === 4
  const stageOpacity = stage === 4 ? 0.45 : stage === 3 ? 0.7 : 1

  let sprite: React.ReactNode = null

  switch (obj.kind) {
    case 'building-primary': {
      const { src, col, row } = getBuildingCell(id, 'primary', stage)
      const s = SCALE.building
      sprite = <Sprite src={src} col={col} row={row} sheetCols={2} w={s.w} h={s.h} grayscale={stageGray} opacity={stageOpacity} />
      break
    }
    case 'building-secondary': {
      const { src, col, row } = getBuildingCell(id, 'secondary', stage)
      const s = SCALE.building2
      sprite = <Sprite src={src} col={col} row={row} sheetCols={2} w={s.w} h={s.h} grayscale={stageGray} opacity={stageOpacity * 0.85} />
      break
    }
    case 'house-primary': {
      const { src, col, row } = getBuildingCell(id, 'primary', stage)
      const s = SCALE.house
      sprite = <Sprite src={src} col={col} row={row} sheetCols={2} w={s.w} h={s.h} grayscale={stageGray} opacity={stageOpacity} />
      break
    }
    case 'house-secondary': {
      const { src, col, row } = getBuildingCell(id, 'secondary', stage)
      const s = SCALE.house2
      sprite = <Sprite src={src} col={col} row={row} sheetCols={2} w={s.w} h={s.h} grayscale={stageGray} opacity={stageOpacity * 0.8} />
      break
    }
    case 'tree': {
      const treeCol = stage >= 3 ? CELL.tBare[0] : CELL.tLush[0]
      const treeRow = stage >= 3 ? CELL.tBare[1] : CELL.tLush[1]
      const s = SCALE.tree
      sprite = <Sprite src={SHEETS.trees.src} col={treeCol} row={treeRow} sheetCols={2} w={s.w} h={s.h} grayscale={stageGray} opacity={stageOpacity * 0.9} />
      break
    }
    case 'citizen': {
      const [cCol, cRow] = getCharacterCell(hiddenValues.freedom, stage)
      const s = SCALE.citizen
      sprite = <Sprite src={SHEETS.characters.src} col={cCol} row={cRow} sheetCols={2} w={s.w} h={s.h} grayscale={stage >= 3} opacity={stage >= 3 ? 0.5 : 0.85} />
      break
    }
    case 'vehicle': {
      const vIdx = getVehicleIndex(stage, obj.z ?? 0)
      const s = SCALE.vehicle
      sprite = <Sprite src={SHEETS.vehicles.src} col={vIdx} row={0} sheetCols={4} sheetRows={1} w={s.w} h={s.h} grayscale={stage >= 3} opacity={stageOpacity} />
      break
    }
    case 'road': {
      const [rCol, rRow] = obj.cellOverride ??
        (stage >= 3 && obj.stages?.includes(3) ? CELL.rCheckpoint : CELL.rStraight)
      const s = SCALE.road
      sprite = <Sprite src={SHEETS.roads.src} col={rCol} row={rRow} sheetCols={2} w={s.w} h={s.h} opacity={0.75} />
      break
    }
    case 'effect-smoke': {
      const s = SCALE.effect
      sprite = <Sprite src={SHEETS.effects.src} col={CELL.eSmoke} row={0} sheetCols={4} sheetRows={1} w={s.w} h={s.h} opacity={0.6} />
      break
    }
    case 'effect-beacon': {
      const s = SCALE.effect
      sprite = (
        <motion.div animate={{ opacity: [0.9, 0.4, 0.9] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
          <Sprite src={SHEETS.effects.src} col={CELL.eBeacon} row={0} sheetCols={4} sheetRows={1} w={s.w} h={s.h} />
        </motion.div>
      )
      break
    }
  }

  if (!sprite) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: `${obj.x}%`,
        top: `${obj.y}%`,
        zIndex: obj.z ?? 1,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      {sprite}
    </div>
  )
}

// ─── Ground plane ─────────────────────────────────────────────────────────────
function GroundPlane({ id, stage }: { id: DistrictId; stage: StageId }) {
  const colorMap: Record<DistrictId, string> = {
    residential: stage >= 3 ? '#1c1917' : '#292524',
    industrial:  stage >= 3 ? '#111827' : '#1e293b',
    education:   stage >= 3 ? '#0f172a' : '#1e3a5f',
    cultural:    stage >= 3 ? '#1a1033' : '#2e1065',
    transit:     stage >= 3 ? '#052e16' : '#14532d',
  }
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 0, left: '5%', right: '5%',
        height: '38%',
        background: colorMap[id],
        opacity: 0.55,
        borderRadius: '2px 2px 4px 4px',
        pointerEvents: 'none',
      }}
    />
  )
}

// ─── Main DistrictTile ────────────────────────────────────────────────────────
export function DistrictTile({
  id, name, livelinessLevel, hasAlert, stage, hiddenValues, isHighlighted, onHover,
}: DistrictTileProps) {
  const { freedom, hope } = hiddenValues
  const meta = DISTRICT_META[id]

  const hopeWarm = hope > 50
  const borderClass = isHighlighted
    ? 'border-neutral-300/60'
    : hopeWarm ? meta.border : 'border-slate-600/35'

  const barrierOpacity = freedom < 50 ? (1 - freedom / 50) * 0.3 : 0

  return (
    <motion.div
      className={`relative rounded border ${meta.bg} ${borderClass} cursor-default overflow-hidden`}
      style={{ minHeight: 140, transform: 'perspective(240px) rotateX(5deg)' }}
      animate={{
        boxShadow: isHighlighted
          ? '0 0 14px 2px rgba(200,200,200,0.15)'
          : hasAlert
          ? '0 0 10px 2px rgba(239,68,68,0.22)'
          : 'none',
      }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Alert pulse ring */}
      {hasAlert && (
        <motion.div
          className="absolute inset-0 border border-red-500/50 rounded pointer-events-none"
          animate={{ opacity: [0.5, 0.08, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ zIndex: 10 }}
        />
      )}

      {/* Freedom barrier grid */}
      {barrierOpacity > 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(100,120,140,0.12) 0px, transparent 3px, transparent 14px)',
            opacity: barrierOpacity,
            zIndex: 8,
          }}
        />
      )}

      {/* Header */}
      <div className="relative flex items-center gap-1 px-2 pt-1.5 pb-0.5" style={{ zIndex: 9 }}>
        <span className="text-[10px]">{meta.icon}</span>
        <span className="text-[8px] uppercase tracking-widest text-neutral-400/80 font-medium truncate">{name}</span>
        {hasAlert && <span className="ml-auto text-[8px] text-red-400 font-bold animate-pulse">!</span>}
      </div>

      {/* Scene canvas */}
      <GroundPlane id={id} stage={stage} />
      <div className="relative" style={{ height: 130, margin: '0 4px 4px 4px' }}>
        {SCENE_RECIPES[id].map((obj, i) => (
          <SceneItem key={i} obj={obj} id={id} stage={stage} hiddenValues={hiddenValues} />
        ))}
      </div>

      <span className="sr-only">{livelinessLevel}</span>
    </motion.div>
  )
}
