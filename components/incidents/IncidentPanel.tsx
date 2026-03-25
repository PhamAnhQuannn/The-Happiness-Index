'use client'

import { useGameStore } from '@/store/gameStore'
import { INCIDENTS } from '@/data/incidents'

export function IncidentPanel() {
  const activeIncidents = useGameStore((s) => s.activeIncidents)

  if (activeIncidents.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3 sticky top-0 bg-neutral-950 pb-1">
          Incidents
        </div>
        <p className="text-xs text-neutral-600 italic">No active incidents.</p>
      </div>
    )
  }

  // Show max 3 without scroll in MVP
  const visible = activeIncidents.slice(0, 3)

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3 sticky top-0 bg-neutral-950 pb-1">
        Incidents
      </div>

      <div className="flex flex-col gap-3">
        {visible.map((ai) => {
          const inc = INCIDENTS.find((i) => i.id === ai.incidentId)
          if (!inc) return null

          return (
            <div
              key={ai.incidentId}
              className="border border-neutral-800 rounded p-2.5 bg-neutral-900"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 uppercase tracking-widest">
                    [{inc.district}]
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      ai.escalated ? 'text-red-400' : 'text-neutral-200'
                    }`}
                  >
                    {inc.title}
                  </span>
                </div>
                {ai.unresolvedTurns > 0 && (
                  <span className="text-xs text-amber-500 ml-2 whitespace-nowrap">
                    unresolved ×{ai.unresolvedTurns}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {inc.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
