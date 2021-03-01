import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { ComponentId, GameDocument } from '../data/types'

const useGames = (
  studioId: ComponentId,
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
  studioId: ComponentId,
  gameId: ComponentId,
  deps?: any[]
): GameDocument | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).games.where({ id: gameId }).first(),
    deps || [],
    undefined
  )

export { useSelectedGame }

export default useGames
