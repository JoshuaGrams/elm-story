import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Game, GameId } from '../data/types'

const useGames = (studioId: StudioId, deps?: any[]): Game[] | undefined => {
  const games = useLiveQuery(
    () => new LibraryDatabase(studioId).games.toArray(),
    deps || [],
    undefined
  )

  // sort alphabetical by studio title
  if (games) games.sort((a, b) => (a.title > b.title ? 1 : -1))

  return games
}

const useGame = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): Game | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).games.where({ id: gameId }).first(),
    deps || [],
    undefined
  )

export { useGame }

export default useGames
