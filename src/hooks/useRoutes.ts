import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ComponentId, GameId, Route, StudioId } from '../data/types'

const useRoutes = (
  studioId: StudioId,
  gameId: GameId,
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
  routeId: ComponentId,
  deps?: any[]
): Route | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).routes.where({ id: routeId }).first(),
    deps || [],
    undefined
  )

const useRoutesBySceneRef = (
  studioId: StudioId,
  sceneId: ComponentId,
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
  passageId: ComponentId,
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

const useRoutesByChoiceRef = (
  studioId: StudioId,
  choiceId: ComponentId,
  deps?: any[]
): Route[] | undefined => {
  const routes = useLiveQuery(
    () => new LibraryDatabase(studioId).routes.where({ choiceId }).toArray(),
    deps || [],
    undefined
  )

  return routes
}

export {
  useRoute,
  useRoutesBySceneRef,
  useRoutesByPassageRef,
  useRoutesByChoiceRef
}

export default useRoutes
