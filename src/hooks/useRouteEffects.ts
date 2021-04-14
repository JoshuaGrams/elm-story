import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ComponentId, Effect, GameId, StudioId } from '../data/types'

const useRouteEffects = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): Effect[] | undefined => {
  const effects = useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  return effects
}

const useRouteEffect = (
  studioId: StudioId,
  effectId: ComponentId,
  deps?: any[]
): Effect | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ id: effectId }).first(),
    deps || [],
    undefined
  )

const useRouteEffectsByRouteRef = (
  studioId: StudioId,
  routeId: ComponentId,
  deps?: any[]
): Effect | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ id: routeId }).first(),
    deps || [],
    undefined
  )

export { useRouteEffect, useRouteEffectsByRouteRef }

export default useRouteEffects
