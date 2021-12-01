import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, Effect, WorldId, StudioId } from '../data/types'

const useRouteEffects = (
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

const useRouteEffect = (
  studioId: StudioId,
  effectId: ElementId,
  deps?: any[]
): Effect | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ id: effectId }).first(),
    deps || [],
    undefined
  )

const useRouteEffectsByRouteRef = (
  studioId: StudioId,
  routeId: ElementId,
  deps?: any[]
): Effect[] | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ routeId }).toArray(),
    deps || [],
    undefined
  )

const useRouteEffectsCountByRouteRef = (
  studioId: StudioId,
  routeId: ElementId,
  deps?: any[]
): number | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ routeId }).count(),
    deps || [],
    undefined
  )

export {
  useRouteEffect,
  useRouteEffectsByRouteRef,
  useRouteEffectsCountByRouteRef
}

export default useRouteEffects
