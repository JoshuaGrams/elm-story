import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Passage, GameId, ComponentId } from '../data/types'

const usePassages = (
  studioId: StudioId,
  gameId: GameId
): Passage[] | undefined => {
  const passages = useLiveQuery(() =>
    new LibraryDatabase(studioId).passages.where({ gameId }).toArray()
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (passages) passages.sort((a, b) => (a.title > b.title ? 1 : -1))

  return passages
}

const usePassage = (
  studioId: StudioId,
  passageId: ComponentId,
  deps?: any[]
): Passage | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).passages.where({ id: passageId }).first(),
    deps || [],
    undefined
  )

export { usePassage }

export default usePassages
