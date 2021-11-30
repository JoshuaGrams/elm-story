import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, Condition, WorldId, StudioId } from '../data/types'

const useRouteConditions = (
  studioId: StudioId,
  gameId: WorldId,
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
  conditionId: ElementId,
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
  routeId: ElementId,
  deps?: any[]
): Condition[] | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).conditions.where({ routeId }).toArray(),
    deps || [],
    undefined
  )

const useRouteConditionsByRouteRefs = (
  studioId: StudioId,
  routeIds: ElementId[],
  deps?: any[]
): Condition[] | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).conditions
        .where('routeId')
        .anyOf(routeIds)
        .toArray(),
    deps || [],
    undefined
  )

const useRouteConditionsCountByRouteRef = (
  studioId: StudioId,
  routeId: ElementId,
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
  useRouteConditionsByRouteRefs,
  useRouteConditionsCountByRouteRef
}

export default useRouteConditions
