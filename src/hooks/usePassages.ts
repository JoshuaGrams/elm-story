import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Passage, ComponentId } from '../data/types'

const usePassages = (
  studioId: StudioId,
  sceneId: ComponentId
): Passage[] | undefined => {
  const passages = useLiveQuery(() =>
    new LibraryDatabase(studioId).passages.where({ sceneId }).toArray()
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (passages) passages.sort((a, b) => (a.title > b.title ? 1 : -1))

  return passages
}

export default usePassages
