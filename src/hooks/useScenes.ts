import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Scene, ComponentId } from '../data/types'

const useScenes = (
  studioId: StudioId,
  chapterId: ComponentId
): Scene[] | undefined => {
  const scenes = useLiveQuery(() =>
    new LibraryDatabase(studioId).scenes.where({ chapterId }).toArray()
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (scenes) scenes.sort((a, b) => (a.title > b.title ? 1 : -1))

  return scenes
}

export default useScenes
