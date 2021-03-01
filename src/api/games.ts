import { LibraryDatabase } from '../db'
import { ComponentId, GameDocument } from '../data/types'
import { v4 as uuid } from 'uuid'
import api from '../api'

export async function getGame(
  studioId: ComponentId,
  gameId: ComponentId
): Promise<GameDocument> {
  try {
    return await new LibraryDatabase(studioId).getGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getGames(
  studioId: ComponentId,
  gameRefs: ComponentId[]
): Promise<(GameDocument | undefined)[]> {
  return await new LibraryDatabase(studioId).games.bulkGet(gameRefs)
}

export async function saveGame(
  studioId: ComponentId,
  game: GameDocument
): Promise<ComponentId> {
  if (!game.id) game.id = uuid()

  game.updated = Date.now()

  try {
    await api().studios.saveGameRef(studioId, game.id)

    return await new LibraryDatabase(studioId).saveGame(game)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeGame(studioId: ComponentId, gameId: ComponentId) {
  try {
    await api().studios.removeGameRef(studioId, gameId)

    await new LibraryDatabase(studioId).removeGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}
