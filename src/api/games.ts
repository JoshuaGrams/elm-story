import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { StudioId, GameDocument, GameId } from '../data/types'

import api from '../api'

export async function getGame(
  studioId: StudioId,
  gameId: GameId
): Promise<GameDocument> {
  try {
    return await new LibraryDatabase(studioId).getGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getGames(
  studioId: StudioId,
  gameRefs: GameId[]
): Promise<(GameDocument | undefined)[]> {
  return await new LibraryDatabase(studioId).games.bulkGet(gameRefs)
}

export async function saveGame(
  studioId: StudioId,
  game: GameDocument
): Promise<GameId> {
  if (!game.id) game.id = uuid()

  game.updated = Date.now()

  try {
    await api().studios.saveGameRef(studioId, game.id)

    return await new LibraryDatabase(studioId).saveGame(game)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeGame(studioId: StudioId, gameId: GameId) {
  try {
    await api().studios.removeGameRef(studioId, gameId)

    await new LibraryDatabase(studioId).removeGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}
