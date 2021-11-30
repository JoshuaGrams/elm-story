import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, WorldId, Route, StudioId } from '../data/types'

const useRoutes = (
  studioId: StudioId,
  gameId: WorldId,
  deps?: any[]
): Route[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).routes.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoute = (
  studioId: StudioId,
  routeId: ElementId,
  deps?: any[]
): Route | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).routes.where({ id: routeId }).first(),
    deps || [],
    undefined
  )

const useRoutesBySceneRef = (
  studioId: StudioId,
  sceneId: ElementId,
  deps?: any[]
): Route[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).routes.where({ sceneId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoutesByPassageRef = (
  studioId: StudioId,
  passageId: ElementId,
  deps?: any[]
): Route[] | undefined => {
  const routes = useLiveQuery(
    () =>
      new LibraryDatabase(studioId).routes
        .where({ destinationId: passageId })
        .toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoutePassthroughsByPassageRef = (
  studioId: StudioId,
  passageId?: ElementId,
  deps?: any[]
): Route[] | undefined => {
  const routes = useLiveQuery(
    async () => {
      const foundRoutes = await new LibraryDatabase(studioId).routes
        .where({ originId: passageId })
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
): Route[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).routes.where({ choiceId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

const useRoutesByInputRef = (
  studioId: StudioId,
  inputId: ElementId,
  deps?: any[]
): Route[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).routes.where({ inputId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

export {
  useRoutePassthroughsByPassageRef,
  useRoute,
  useRoutesBySceneRef,
  useRoutesByPassageRef,
  useRoutesByChoiceRef,
  useRoutesByInputRef
}

export default useRoutes
