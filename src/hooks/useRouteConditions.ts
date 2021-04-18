import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ComponentId, Condition, GameId, StudioId } from '../data/types'

const useRouteConditions = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): Condition[] | undefined => {
  const conditions = useLiveQuery(
    () => new LibraryDatabase(studioId).conditions.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  return conditions
}

const useRouteCondition = (
  studioId: StudioId,
  conditionId: ComponentId,
  deps?: any[]
): Condition | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).conditions
        .where({ id: conditionId })
        .first(),
    deps || [],
    undefined
  )

const useRouteConditionsByRouteRef = (
  studioId: StudioId,
  routeId: ComponentId,
  deps?: any[]
): Condition[] | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).conditions.where({ routeId }).toArray(),
    deps || [],
    undefined
  )

const useRouteConditionsCountByRouteRef = (
  studioId: StudioId,
  routeId: ComponentId,
  deps?: any[]
): number | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).conditions.where({ routeId }).count(),
    deps || [],
    undefined
  )

export {
  useRouteCondition,
  useRouteConditionsByRouteRef,
  useRouteConditionsCountByRouteRef
}

export default useRouteConditions
