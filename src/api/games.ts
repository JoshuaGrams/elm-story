import { LibraryDatabase } from '../db'
import { DocumentId, GameDocument } from '../data/types'
import { v4 as uuid } from 'uuid'
import api from '../api'

export async function getGame(
  studioId: DocumentId,
  gameId: DocumentId
): Promise<GameDocument> {
  try {
    return await new LibraryDatabase(studioId).getGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getGames(
  studioId: DocumentId,
  gameRefs: DocumentId[]
): Promise<(GameDocument | undefined)[]> {
  return await new LibraryDatabase(studioId).games.bulkGet(gameRefs)
}

export async function saveGame(
  studioId: DocumentId,
  game: GameDocument
): Promise<DocumentId> {
  if (!game.id) game.id = uuid()

  game.updated = Date.now()

  try {
    await api().studios.saveGameRef(studioId, game.id)

    return await new LibraryDatabase(studioId).saveGame(game)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeGame(studioId: DocumentId, gameId: DocumentId) {
  try {
    await api().studios.removeGameRef(studioId, gameId)

    await new LibraryDatabase(studioId).removeGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}
