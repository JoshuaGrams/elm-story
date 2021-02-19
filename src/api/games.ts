import { LibraryDatabase } from '../db'
import { DocumentId, GameDocument } from '../data/types'
import { v4 as uuid } from 'uuid'
import api from '../api'

export async function getGame(
  profileId: DocumentId,
  gameId: DocumentId
): Promise<GameDocument> {
  try {
    return await new LibraryDatabase(profileId).getGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getGames(
  profileId: DocumentId,
  gameRefs: DocumentId[]
): Promise<(GameDocument | undefined)[]> {
  return await new LibraryDatabase(profileId).games.bulkGet(gameRefs)
}

export async function saveGame(
  profileId: DocumentId,
  game: GameDocument
): Promise<DocumentId> {
  if (!game.id) game.id = uuid()

  game.updated = Date.now()

  try {
    await api().profiles.saveGameRef(profileId, game.id)

    return await new LibraryDatabase(profileId).saveGame(game)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeGame(profileId: DocumentId, gameId: DocumentId) {
  try {
    await api().profiles.removeGameRef(profileId, gameId)

    await new LibraryDatabase(profileId).removeGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}
