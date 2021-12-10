import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, Effect, WorldId, StudioId } from '../data/types'

const usePathEffects = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Effect[] | undefined => {
  const effects = useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  return effects
}

const usePathEffect = (
  studioId: StudioId,
  effectId: ElementId,
  deps?: any[]
): Effect | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ id: effectId }).first(),
    deps || [],
    undefined
  )

const usePathEffectsByPathRef = (
  studioId: StudioId,
  pathId: ElementId,
  deps?: any[]
): Effect[] | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ pathId }).toArray(),
    deps || [],
    undefined
  )

const usePathEffectsCountByPathRef = (
  studioId: StudioId,
  pathId: ElementId,
  deps?: any[]
): number | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ pathId }).count(),
    deps || [],
    undefined
  )

export { usePathEffect, usePathEffectsByPathRef, usePathEffectsCountByPathRef }

export default usePathEffects
