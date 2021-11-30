import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Scene, WorldId, ElementId } from '../data/types'

const useScenes = (
  studioId: StudioId,
  gameId: WorldId,
  deps?: any[]
): Scene[] | undefined => {
  const scenes = useLiveQuery(
    () => new LibraryDatabase(studioId).scenes.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (scenes) scenes.sort((a, b) => (a.title > b.title ? 1 : -1))

  return scenes
}

const useScenesByChapterRef = (
  studioId: StudioId,
  chapterId: ElementId,
  deps?: any[]
): Scene[] | undefined => {
  const passages = useLiveQuery(
    () => new LibraryDatabase(studioId).scenes.where({ chapterId }).toArray(),
    deps || [],
    undefined
  )

  return passages
}

const useScene = (
  studioId: StudioId,
  sceneId: ElementId | undefined | null,
  deps?: any[]
): Scene | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).scenes.where({ id: sceneId || '' }).first(),
    deps || [],
    undefined
  )

export { useScenesByChapterRef, useScene }

export default useScenes
