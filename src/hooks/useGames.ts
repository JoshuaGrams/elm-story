import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { DocumentId, GameDocument } from '../data/types'

const useGames = (studioId: DocumentId): GameDocument[] => {
  const games =
    useLiveQuery(() => new LibraryDatabase(studioId).games.toArray(), [
      studioId
    ]) || []

  // sort alphabetical by studio title
  if (games) games.sort((a, b) => (a.title > b.title ? 1 : -1))

  return games
}

export default useGames
