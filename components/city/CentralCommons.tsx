'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { VisualConfig } from '@/lib/visualMapping'

interface CentralCommonsProps {
  visual: VisualConfig
}

/**
 * SVG sprite overlay for the Central Commons hotspot zone.
 * Positioned absolutely over the commons area in CityScenePanel.
 * Reacts to social vitality and hope via VisualConfig.
 */
export function CentralCommons({ visual }: CentralCommonsProps) {
  const { commons, stage } = visual
  const isStage4 = stage === 4

  // Opacity of the whole overlay fades as the city becomes more dystopian
  const overlayOpacity = isStage4 ? 0.25 : stage === 3 ? 0.5 : 0.75

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: overlayOpacity, transition: 'opacity 3s ease-in-out' }}
    >
      {/* Fountain — active or dry */}
      <AnimatePresence mode="wait">
        {commons.fountainActive ? (
          <motion.img
            key="fountain-active"
            src="/assets/voxel-fountain-active.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute"
            style={{ width: '28%', bottom: '36%', left: '36%' }}
          />
        ) : (
          <motion.img
            key="fountain-dry"
            src="/assets/voxel-fountain-dry.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute"
            style={{ width: '28%', bottom: '36%', left: '36%' }}
          />
        )}
      </AnimatePresence>

      {/* Trees — alive or dead */}
      <AnimatePresence mode="wait">
        {commons.treesAlive ? (
          <motion.img
            key="tree-alive"
            src="/assets/voxel-tree.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute"
            style={{ width: '18%', top: '8%', left: '12%' }}
          />
        ) : (
          <motion.img
            key="tree-dead"
            src="/assets/voxel-tree-dead.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute"
            style={{ width: '18%', top: '8%', left: '12%' }}
          />
        )}
      </AnimatePresence>

      {/* Second tree — right side */}
      <AnimatePresence mode="wait">
        {commons.treesAlive ? (
          <motion.img
            key="tree-alive-r"
            src="/assets/voxel-tree.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, delay: 0.3 }}
            className="absolute"
            style={{ width: '16%', top: '12%', right: '10%' }}
          />
        ) : (
          <motion.img
            key="tree-dead-r"
            src="/assets/voxel-tree-dead.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, delay: 0.3 }}
            className="absolute"
            style={{ width: '16%', top: '12%', right: '10%' }}
          />
        )}
      </AnimatePresence>

      {/* People — crowd group (high vitality) */}
      <AnimatePresence>
        {commons.showCrowdGroup && (
          <motion.img
            key="crowd"
            src="/assets/voxel-crowd-group.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5 }}
            className="absolute"
            style={{ width: '40%', bottom: '8%', left: '30%' }}
          />
        )}
      </AnimatePresence>

      {/* People — sitting (mid vitality) */}
      <AnimatePresence>
        {commons.showPersonSitting && (
          <motion.img
            key="sitting"
            src="/assets/voxel-person-sitting.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute"
            style={{ width: '14%', bottom: '14%', left: '42%' }}
          />
        )}
      </AnimatePresence>

      {/* Market stall — only at high vitality stage 1 */}
      <AnimatePresence>
        {commons.showCrowdGroup && stage === 1 && (
          <motion.img
            key="market"
            src="/assets/voxel-market-stall.svg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute"
            style={{ width: '22%', bottom: '20%', right: '8%' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
