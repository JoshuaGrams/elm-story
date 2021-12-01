import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, WorldId, Path, StudioId } from '../data/types'

const useRoutes = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Path[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).paths.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoute = (
  studioId: StudioId,
  routeId: ElementId,
  deps?: any[]
): Path | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).paths.where({ id: routeId }).first(),
    deps || [],
    undefined
  )

const useRoutesBySceneRef = (
  studioId: StudioId,
  sceneId: ElementId,
  deps?: any[]
): Path[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).paths.where({ sceneId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoutesByEventRef = (
  studioId: StudioId,
  eventId: ElementId,
  deps?: any[]
): Path[] | undefined => {
  const routes = useLiveQuery(
    () =>
      new LibraryDatabase(studioId).paths
        .where({ destinationId: eventId })
        .toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoutePassthroughsByEventRef = (
  studioId: StudioId,
  eventId?: ElementId,
  deps?: any[]
): Path[] | undefined => {
  const routes = useLiveQuery(
    async () => {
      const foundRoutes = await new LibraryDatabase(studioId).paths
        .where({ originId: eventId })
        .toArray()

      return foundRoutes.filter(
        (foundRoute) => foundRoute.choiceId === undefined
      )
    },
    deps || [],
    undefined
  )

  return routes
}

const useRoutesByChoiceRef = (
  studioId: StudioId,
  choiceId: ElementId,
  deps?: any[]
): Path[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).paths.where({ choiceId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoutesByInputRef = (
  studioId: StudioId,
  inputId: ElementId,
  deps?: any[]
): Path[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).paths.where({ inputId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

export {
  useRoutePassthroughsByEventRef,
  useRoute,
  useRoutesBySceneRef,
  useRoutesByEventRef,
  useRoutesByChoiceRef,
  useRoutesByInputRef
}

export default useRoutes
