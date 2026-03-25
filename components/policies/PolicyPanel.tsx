'use client'

import { useGameStore } from '@/store/gameStore'
import { POLICIES } from '@/data/policies'
import type { Policy } from '@/types'

function PolicyCard({ policy }: { policy: Policy }) {
  const selectedPolicyIds = useGameStore((s) => s.selectedPolicyIds)
  const selectPolicy = useGameStore((s) => s.selectPolicy)
  const deselectPolicy = useGameStore((s) => s.deselectPolicy)
  const controlPressure = useGameStore((s) => s.controlPressure)

  const isSelected = selectedPolicyIds.includes(policy.id)

  // Disabled if already at the 2-policy limit (unless this card is already selected)
  const atMaxSelection = !isSelected && selectedPolicyIds.length >= 2
  const isDisabled = atMaxSelection

  const isCoercive = policy.specialRules?.includes('coercive') ?? false
  const hasDelayed = policy.delayedEffects.length > 0
  // Warn if this coercive card would push CP to a danger threshold
  const nextCP = isCoercive ? controlPressure + 1 : controlPressure
  const cpWarning = isCoercive && (nextCP === 3 || nextCP === 5 || nextCP === 7)

  const phaseColor =
    policy.phase === 'early' ? 'text-blue-500/60' :
    policy.phase === 'mid'   ? 'text-amber-500/60' :
                               'text-red-500/60'

  function handleClick() {
    if (isSelected) {
      deselectPolicy(policy.id)
    } else if (!isDisabled) {
      selectPolicy(policy.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled && !isSelected}
      className={`
        relative w-full text-left border rounded p-3 transition-all duration-200
        ${
          isSelected
            ? 'border-neutral-400 bg-neutral-800 shadow-[0_0_8px_rgba(255,255,255,0.05)]'
            : isDisabled
            ? 'border-neutral-800 bg-neutral-950 opacity-40 cursor-not-allowed'
            : 'border-neutral-700 bg-neutral-900 hover:border-neutral-500 hover:bg-neutral-800 cursor-pointer'
        }
      `}
    >
      {/* Header row: name + phase dot */}
      <div className="flex justify-between items-start mb-1.5 gap-2">
        <span className="text-xs font-medium text-neutral-200 leading-tight">{policy.name}</span>
        <span className={`text-[9px] uppercase tracking-widest shrink-0 mt-0.5 ${phaseColor}`}>
          {policy.phase}
        </span>
      </div>

      {/* Summary */}
      <p className="text-xs text-neutral-500 leading-relaxed mb-2">{policy.summary}</p>

      {/* Visible effects preview */}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {(Object.entries(policy.immediateEffects) as [string, number][]).map(
          ([key, val]) => (
            <span
              key={key}
              className={`text-xs px-1 rounded ${
                val > 0 ? 'text-emerald-400' : 'text-red-400'
              } bg-neutral-800`}
            >
              {key === 'happinessIndex'
                ? 'HI'
                : key === 'productivity'
                ? 'Prod'
                : key === 'safety'
                ? 'Safety'
                : key === 'stress'
                ? 'Stress'
                : 'Trust'}{' '}
              {val > 0 ? '+' : ''}
              {val}
            </span>
          )
        )}
        {/* Delayed effects warning */}
        {hasDelayed && (
          <span className="text-xs px-1 rounded text-amber-500/70 bg-neutral-800">
            ⏱ delayed
          </span>
        )}
        {/* Coercive warning + CP threshold alert */}
        {isCoercive && (
          <span className={`text-xs px-1 rounded bg-neutral-800 ${cpWarning ? 'text-red-400' : 'text-orange-500/70'}`}>
            {cpWarning ? '⚠ +CP' : '↑CP'}
          </span>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-neutral-200" />
      )}
    </button>
  )
}

export function PolicyPanel() {
  const policyHandIds = useGameStore((s) => s.policyHandIds)
  const status = useGameStore((s) => s.status)

  const handPolicies = policyHandIds
    .map((id) => POLICIES.find((p) => p.id === id))
    .filter(Boolean) as Policy[]

  if (status !== 'playing') return null

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-neutral-500 uppercase tracking-widest mb-2 sticky top-0 bg-neutral-950 pb-1">
        Policies
      </div>

      {handPolicies.length === 0 ? (
        <p className="text-xs text-neutral-600 italic">No policies in hand.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {handPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      )}
    </div>
  )
}
