import logger from '../lib/logger'

import { AppDatabase, LibraryDatabase } from '../db'
import { DocumentId, StudioDocument } from '../data/types'
import { v4 as uuid } from 'uuid'

export async function getStudio(studioId: DocumentId): Promise<StudioDocument> {
  try {
    return new AppDatabase().getStudio(studioId)
  } catch (error) {
    throw new Error(error)
  }
}
export async function getGameRefs(studioId: DocumentId): Promise<DocumentId[]> {
  return (await getStudio(studioId)).games
}

/**
 * Saves app studio.
 * TODO: Link studios to cloud accounts.
 * @returns id on promise resolve
 */
export async function saveStudio(studio: StudioDocument): Promise<DocumentId> {
  if (!studio.id) studio.id = uuid()

  studio.updated = Date.now()

  return await new AppDatabase().saveStudio(studio)
}

/**
 * Delete app studio.
 * TODO: How does this affect cloud accounts?
 */
export async function removeStudio(studioId: DocumentId) {
  try {
    await new LibraryDatabase(studioId).delete()

    await new AppDatabase().removeStudio(studioId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveGameRef(studioId: DocumentId, gameId: DocumentId) {
  try {
    const studio = await getStudio(studioId),
      exists = studio.games.indexOf(gameId) !== -1

    if (!exists) {
      if (studio) {
        studio.games = [...studio.games, gameId]

        saveStudio(studio)
      } else {
        throw new Error(
          `Unable to save game with ID: ${gameId}. Studio with ID ${studioId} does not exist.`
        )
      }
    } else {
      logger.info(
        `Unable to add game ref ${gameId} to studio ${studioId}. Already exists. Likely game is being updated.`
      )
    }
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeGameRef(studioId: DocumentId, gameId: DocumentId) {
  try {
    const studio = await getStudio(studioId)

    if (studio) {
      const index = studio.games.indexOf(gameId)

      if (index !== -1) {
        studio.games.splice(index)
      }

      await saveStudio(studio)
    } else {
      throw new Error(
        `Unable to remove game with ID: ${gameId}. Studio with ID ${studioId} does not exist.`
      )
    }
  } catch (error) {
    throw new Error(error)
  }
}
