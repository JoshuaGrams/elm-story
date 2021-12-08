import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, WorldId, Path, StudioId } from '../data/types'

const usePaths = (
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

const usePath = (
  studioId: StudioId,
  pathId: ElementId,
  deps?: any[]
): Path | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).paths.where({ id: pathId }).first(),
    deps || [],
    undefined
  )

const usePathsBySceneRef = (
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

const usePathsByEventRef = (
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

const usePathPassthroughsByEventRef = (
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

const usePathsByChoiceRef = (
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

const usePathsByInputRef = (
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
  usePathPassthroughsByEventRef,
  usePath,
  usePathsBySceneRef,
  usePathsByEventRef,
  usePathsByChoiceRef,
  usePathsByInputRef
}

export default usePaths
