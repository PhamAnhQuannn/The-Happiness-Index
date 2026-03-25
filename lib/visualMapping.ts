// ─────────────────────────────────────────────
//  The Happiness Index — Visual Mapping Engine
//  Translates GameState → VisualConfig
//  Consumed by: CityScenePanel, CentralCommons,
//               IncidentOverlay, DistrictTile
// ─────────────────────────────────────────────

import type { GameState, DistrictId, StageId } from '@/types'
import { INCIDENTS } from '@/data/incidents'

// ── Types ─────────────────────────────────────

export type VisualState = 'normal' | 'dim' | 'dark'
export type CrowdMode   = 'free' | 'restricted' | 'static'
export type FogLevel    = 'none' | 'light' | 'heavy'

export interface DistrictVisual {
  assetVariant: VisualState
  showSmoke:   boolean   // industrial only — stress > 60 or active incident
  showBarrier: boolean   // transit only   — freedom < 40
  showAlert:   boolean   // any district   — has active incident
}

export interface VisualConfig {
  stage: StageId

  commons: {
    showCrowdGroup:    boolean   // socialVitality > 70
    showPersonSitting: boolean   // socialVitality 40–70
    fountainActive:    boolean   // socialVitality > 50
    treesAlive:        boolean   // hope > 50
  }

  people: {
    mode: CrowdMode              // freedom > 60 → free | > 30 → restricted | else static
  }

  atmosphere: {
    fogLevel:          FogLevel  // hope < 30 → heavy | < 60 → light | else none
    gridOpacity:       number    // freedom < 60 → (60 - freedom) / 60, else 0
    showSurveillance:  boolean   // freedom < 60
    showBarriers:      boolean   // freedom < 40
    showPropaganda:    boolean   // controlPressure > 3
  }

  incidents: {
    // ⚠️ ActiveIncident has no .district field — resolved via INCIDENTS data lookup
    activeDistrictAlerts: DistrictId[]
  }

  districts: Record<DistrictId, DistrictVisual>
}

// ── Main function ─────────────────────────────

export function deriveVisualConfig(state: GameState): VisualConfig {
  const { hiddenValues, metrics, activeIncidents, stage, controlPressure } = state
  const { socialVitality, freedom, hope } = hiddenValues
  const { stress } = metrics

  // Resolve which districts have active incidents via INCIDENTS data lookup.
  // ActiveIncident only carries incidentId — district lives on the Incident definition.
  const activeDistrictAlerts: DistrictId[] = activeIncidents
    .map((ai) => INCIDENTS.find((inc) => inc.id === ai.incidentId)?.district)
    .filter((d): d is DistrictId => d !== undefined)

  // ── Commons ───────────────────────────────
  const commons = {
    showCrowdGroup:    socialVitality > 70,
    showPersonSitting: socialVitality > 40 && socialVitality <= 70,
    fountainActive:    socialVitality > 50,
    treesAlive:        hope > 50,
  }

  // ── People mode ───────────────────────────
  const crowdMode: CrowdMode =
    freedom > 60 ? 'free' :
    freedom > 30 ? 'restricted' :
    'static'

  // ── Atmosphere ────────────────────────────
  const fogLevel: FogLevel =
    hope < 30 ? 'heavy' :
    hope < 60 ? 'light' :
    'none'

  const atmosphere = {
    fogLevel,
    gridOpacity:      freedom < 60 ? (60 - freedom) / 60 : 0,
    showSurveillance: freedom < 60,
    showBarriers:     freedom < 40,
    showPropaganda:   controlPressure > 3,
  }

  // ── Per-district visuals ──────────────────
  const baseVariant: VisualState =
    stage >= 4 ? 'dark' :
    stage >= 2 ? 'dim' :
    'normal'

  const districtIds: DistrictId[] = [
    'residential', 'industrial', 'education', 'cultural', 'transit',
  ]

  const districts = Object.fromEntries(
    districtIds.map((id) => {
      const hasAlert = activeDistrictAlerts.includes(id)
      return [id, {
        assetVariant: baseVariant,
        showAlert:   hasAlert,
        showSmoke:   id === 'industrial' && (stress > 60 || hasAlert),
        showBarrier: id === 'transit'    && freedom < 40,
      } satisfies DistrictVisual]
    })
  ) as Record<DistrictId, DistrictVisual>

  return {
    stage,
    commons,
    people:    { mode: crowdMode },
    atmosphere,
    incidents: { activeDistrictAlerts },
    districts,
  }
}
