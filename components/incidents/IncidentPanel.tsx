'use client'

import { useGameStore } from '@/store/gameStore'
import { INCIDENTS } from '@/data/incidents'

export function IncidentPanel() {
  const activeIncidents = useGameStore((s) => s.activeIncidents)
  const stage = useGameStore((s) => s.stage)
  const isStage4 = stage === 4

  if (activeIncidents.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <div className={`text-xs uppercase tracking-widest mb-3 sticky top-0 pb-1 bg-neutral-950 ${isStage4 ? 'text-neutral-700' : 'text-neutral-500'}`}>
          Incidents
        </div>
        <p className="text-xs text-neutral-600 italic">No active incidents.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className={`text-xs uppercase tracking-widest mb-3 sticky top-0 pb-1 bg-neutral-950 ${isStage4 ? 'text-neutral-700' : 'text-neutral-500'}`}>
        Incidents
        <span className="ml-2 text-neutral-700">({activeIncidents.length})</span>
      </div>

      <div className="flex flex-col gap-3">
        {activeIncidents.map((ai) => {
          const inc = INCIDENTS.find((i) => i.id === ai.incidentId)
          if (!inc) return null

          const escalationMax = inc.escalationTurns ?? null
          const escalationFill = escalationMax
            ? Math.min((ai.unresolvedTurns / escalationMax) * 100, 100)
            : 0
          const nearEscalation = escalationMax !== null && ai.unresolvedTurns >= escalationMax - 1

          return (
            <div
              key={ai.incidentId}
              className={`border rounded p-2.5 ${
                ai.escalated
                  ? 'border-red-900/60 bg-red-950/20'
                  : nearEscalation
                  ? 'border-amber-900/50 bg-amber-950/10'
                  : 'border-neutral-800 bg-neutral-900'
              }`}
            >
              {/* Title row */}
              <div className="flex justify-between items-start mb-1 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-[10px] uppercase tracking-widest shrink-0 ${isStage4 ? 'text-neutral-700' : 'text-neutral-600'}`}>
                    [{inc.district}]
                  </span>
                  <span className={`text-xs font-medium truncate ${ai.escalated ? 'text-red-400' : 'text-neutral-200'}`}>
                    {inc.title}
                  </span>
                </div>
                {ai.unresolvedTurns > 0 && (
                  <span className={`text-xs shrink-0 ${ai.escalated ? 'text-red-400' : 'text-amber-500'}`}>
                    ×{ai.unresolvedTurns}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className={`text-xs leading-relaxed mb-2 ${isStage4 ? 'text-neutral-700' : 'text-neutral-500'}`}>
                {inc.description}
              </p>

              {/* Drain preview */}
              {Object.keys(inc.visibleImpactIfIgnored).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(Object.entries(inc.visibleImpactIfIgnored) as [string, number][]).map(([key, val]) => (
                    <span key={key} className="text-[10px] px-1 rounded text-red-400/70 bg-neutral-800">
                      {key === 'happinessIndex' ? 'HI' :
                       key === 'productivity' ? 'Prod' :
                       key === 'safety' ? 'Safety' :
                       key === 'stress' ? 'Stress' : 'Trust'}{' '}
                      {val > 0 ? '+' : ''}{val}/turn
                    </span>
                  ))}
                </div>
              )}

              {/* Escalation progress bar */}
              {escalationMax !== null && !ai.escalated && (
                <div className="mt-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-[9px] uppercase tracking-widest ${nearEscalation ? 'text-amber-500/70' : 'text-neutral-700'}`}>
                      {nearEscalation ? '⚠ escalating' : 'escalation'}
                    </span>
                    <span className="text-[9px] text-neutral-700">{ai.unresolvedTurns}/{escalationMax}</span>
                  </div>
                  <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${nearEscalation ? 'bg-amber-500' : 'bg-neutral-600'}`}
                      style={{ width: `${escalationFill}%` }}
                    />
                  </div>
                </div>
              )}
              {ai.escalated && (
                <p className="text-[10px] text-red-400/70 mt-1 italic">{inc.escalatedResult}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
