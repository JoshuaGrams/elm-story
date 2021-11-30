import logger from '../lib/logger'

import { AppDatabase, LibraryDatabase } from '../db'
import { GameId, Studio, StudioId } from '../data/types'
import { v4 as uuid } from 'uuid'

export async function getStudio(
  studioId: StudioId
): Promise<Studio | undefined> {
  try {
    return new AppDatabase().getStudio(studioId)
  } catch (error) {
    throw new Error(error)
  }
}
export async function getGameRefs(studioId: StudioId): Promise<GameId[]> {
  const studio = await getStudio(studioId)

  return studio ? studio.games : []
}

/**
 * Saves app studio.
 * TODO: Link studios to cloud accounts.
 * @returns id on promise resolve
 */
export async function saveStudio(studio: Studio): Promise<StudioId> {
  if (!studio.id) studio.id = uuid()

  return await new AppDatabase().saveStudio(studio)
}

/**
 * Delete app studio.
 * TODO: How does this affect cloud accounts?
 */
export async function removeStudio(studioId: StudioId) {
  try {
    await new LibraryDatabase(studioId).delete()

    await new AppDatabase().removeStudio(studioId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveGameRef(studioId: StudioId, gameId: GameId) {
  try {
    const studio = await getStudio(studioId),
      exists = studio ? studio.games.indexOf(gameId) !== -1 : false

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

export async function removeGameRef(studioId: StudioId, gameId: GameId) {
  try {
    const studio = await getStudio(studioId)

    if (studio) {
      const index = studio.games.indexOf(gameId)

      if (index !== -1) {
        studio.games.splice(index, 1)
      }

      await saveStudio(studio)
    } else {
      throw new Error(
        `Unable to remove storyworld with ID: ${gameId}. Studio with ID ${studioId} does not exist.`
      )
    }
  } catch (error) {
    throw new Error(error)
  }
}
