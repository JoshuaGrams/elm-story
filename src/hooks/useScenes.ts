import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Scene, GameId, ComponentId } from '../data/types'

const useScenes = (studioId: StudioId, gameId: GameId): Scene[] | undefined => {
  const scenes = useLiveQuery(() =>
    new LibraryDatabase(studioId).scenes.where({ gameId }).toArray()
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (scenes) scenes.sort((a, b) => (a.title > b.title ? 1 : -1))

  return scenes
}

const useScene = (
  studioId: StudioId,
  sceneId: ComponentId,
  deps?: any[]
): Scene | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).scenes.where({ id: sceneId }).first(),
    deps || [],
    undefined
  )

export { useScene }

export default useScenes
