import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Passage, WorldId, ElementId } from '../data/types'

const usePassages = (
  studioId: StudioId,
  gameId: WorldId,
  deps?: any[]
): Passage[] | undefined => {
  const passages = useLiveQuery(
    () => new LibraryDatabase(studioId).passages.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (passages) passages.sort((a, b) => (a.title > b.title ? 1 : -1))

  return passages
}

const usePassagesBySceneRef = (
  studioId: StudioId,
  sceneId: ElementId,
  deps?: any[]
): Passage[] | undefined => {
  const passages = useLiveQuery(
    () => new LibraryDatabase(studioId).passages.where({ sceneId }).toArray(),
    deps || [],
    undefined
  )

  return passages
}

const usePassage = (
  studioId: StudioId,
  passageId: ElementId | undefined | null,
  deps?: any[]
): Passage | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).passages
        .where({ id: passageId || '' })
        .first(),
    deps || [],
    undefined
  )

export { usePassagesBySceneRef, usePassage }

export default usePassages
