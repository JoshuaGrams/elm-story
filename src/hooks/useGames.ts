import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Game, WorldId } from '../data/types'

export enum GAME_SORT {
  NAME = 'NAME',
  DATE = 'DATE'
}

const useGames = (
  studioId: StudioId,
  sortBy?: GAME_SORT,
  deps?: any[]
): Game[] | undefined => {
  const games = useLiveQuery(
    () => new LibraryDatabase(studioId).games.toArray(),
    deps || [],
    undefined
  )

  if (games) {
    switch (sortBy) {
      case GAME_SORT.DATE:
        games.sort((a, b) =>
          a.updated && b.updated && a.updated < b.updated ? 1 : -1
        )
        break
      case GAME_SORT.NAME:
      default:
        games.sort((a, b) => (a.title > b.title ? 1 : -1))
    }
  }

  return games
}

const useGame = (
  studioId: StudioId,
  gameId: WorldId,
  deps?: any[]
): Game | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).games.where({ id: gameId }).first(),
    deps || [],
    undefined
  )

export { useGame }

export default useGames
