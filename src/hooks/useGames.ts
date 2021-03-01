import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, GameDocument, GameId } from '../data/types'

const useGames = (
  studioId: StudioId,
  deps?: any[]
): GameDocument[] | undefined => {
  const games = useLiveQuery(
    () => new LibraryDatabase(studioId).games.toArray(),
    deps || [],
    undefined
  )

  // sort alphabetical by studio title
  if (games) games.sort((a, b) => (a.title > b.title ? 1 : -1))

  return games
}

const useSelectedGame = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): GameDocument | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).games.where({ id: gameId }).first(),
    deps || [],
    undefined
  )

export { useSelectedGame }

export default useGames
