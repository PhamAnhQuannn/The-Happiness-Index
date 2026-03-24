'use client'

import { motion } from 'framer-motion'
import type { StageId } from '@/types'
import { SHEETS, CELL, SCALE } from './citySceneConfig'

interface CentralCommonsProps {
  socialVitality: number
  hope: number
  stage: StageId
}

function Sprite({
  src, col, row, sheetCols, sheetRows = 2, w, h, opacity = 1, grayscale = false,
}: {
  src: string; col: number; row: number; sheetCols: number; sheetRows?: number
  w: number; h: number; opacity?: number; grayscale?: boolean
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

export function CentralCommons({ socialVitality, hope, stage }: CentralCommonsProps) {
  const vitHigh = socialVitality > 65
  const vitMid  = socialVitality > 35

  // Park tile selection: lively [0,1] or dead [1,1]
  const deadPark = stage >= 3 || hope <= 35
  const [parkCol, parkRow] = deadPark ? CELL.tParkDead : CELL.tParkLively

  // Tree flanks: lush or bare
  const [treeCol, treeRow] = stage >= 3 ? CELL.tBare : CELL.tLush

  // Crowd: park crowd [1,1] when thriving, rigid [1,0] when subdued
  const showCrowd = stage < 4 && socialVitality > 15
  const [crowdCol, crowdRow] = socialVitality > 50 && stage < 3 ? CELL.cCrowd : CELL.cRigid

  // Pulse ring
  const ringOpacity = stage === 4 ? 0 : hope > 60 ? 0.28 : hope > 30 ? 0.14 : 0.05

  const parkSize = SCALE.park  // 96×96

  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <span className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-medium">
        Central Commons
      </span>

      {/* Main commons composition */}
      <div className="relative flex items-end justify-center gap-2">
        {/* Left tree */}
        {stage < 4 && (
          <Sprite
            src={SHEETS.trees.src}
            col={treeCol} row={treeRow}
            sheetCols={2} w={44} h={44}
            opacity={hope > 35 ? 0.85 : 0.4}
            grayscale={stage === 4}
          />
        )}

        {/* Central park tile with pulse ring */}
        <div className="relative flex items-center justify-center">
          {ringOpacity > 0 && (
            <motion.div
              className="absolute rounded-full border border-emerald-500/40 pointer-events-none"
              style={{ inset: -10 }}
              animate={{ opacity: [ringOpacity, ringOpacity * 0.2, ringOpacity] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <Sprite
            src={SHEETS.trees.src}
            col={parkCol} row={parkRow}
            sheetCols={2}
            w={parkSize.w} h={parkSize.h}
            opacity={stage === 4 ? 0.4 : 1}
            grayscale={stage === 4}
          />

          {/* Crowd overlay — bottom-right of park tile */}
          {showCrowd && (
            <div className="absolute bottom-0 right-0 pointer-events-none">
              <Sprite
                src={SHEETS.characters.src}
                col={crowdCol} row={crowdRow}
                sheetCols={2} w={42} h={42}
                opacity={stage >= 3 ? 0.42 : 0.8}
                grayscale={stage >= 3}
              />
            </div>
          )}

          {/* Second crowd cluster — left side, only when vitality high */}
          {vitHigh && stage < 3 && (
            <div className="absolute bottom-2 left-0 pointer-events-none">
              <Sprite
                src={SHEETS.characters.src}
                col={CELL.cWalking[0]} row={CELL.cWalking[1]}
                sheetCols={2} w={34} h={34}
                opacity={0.65}
              />
            </div>
          )}
        </div>

        {/* Right tree */}
        {stage < 3 && (
          <Sprite
            src={SHEETS.trees.src}
            col={treeCol} row={treeRow}
            sheetCols={2} w={38} h={38}
            opacity={0.7}
          />
        )}
      </div>

      {/* Vitality label */}
      <span className={`text-[8px] tracking-widest transition-colors duration-1000 ${
        stage === 4 ? 'text-neutral-700'
        : vitHigh ? 'text-emerald-600'
        : vitMid  ? 'text-yellow-700'
        : 'text-red-800'
      }`}>
        {stage === 4 ? 'INERT' : vitHigh ? 'THRIVING' : vitMid ? 'SUBDUED' : 'EMPTY'}
      </span>
    </div>
  )
}
