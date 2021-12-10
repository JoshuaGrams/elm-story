import logger from '../lib/logger'

import { AppDatabase, LibraryDatabase } from '../db'
import { WorldId, Studio, StudioId } from '../data/types'
import { v4 as uuid } from 'uuid'

export async function getStudio(
  studioId: StudioId
): Promise<Studio | undefined> {
  try {
    return new AppDatabase().getStudio(studioId)
  } catch (error) {
    throw error
  }
}
export async function getGameRefs(studioId: StudioId): Promise<WorldId[]> {
  const studio = await getStudio(studioId)

  return studio ? studio.worlds : []
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
    throw error
  }
}

export async function saveWorldRef(studioId: StudioId, worldId: WorldId) {
  try {
    const studio = await getStudio(studioId),
      exists = studio ? studio.worlds.indexOf(worldId) !== -1 : false

    if (!exists) {
      if (studio) {
        studio.worlds = [...studio.worlds, worldId]

        saveStudio(studio)
      } else {
        throw new Error(
          `Unable to save world with ID: ${worldId}. Studio with ID ${studioId} does not exist.`
        )
      }
    } else {
      logger.info(
        `Unable to add world ref ${worldId} to studio ${studioId}. Already exists. Likely world is being updated.`
      )
    }
  } catch (error) {
    throw error
  }
}

export async function removeWorldRef(studioId: StudioId, worldId: WorldId) {
  try {
    const studio = await getStudio(studioId)

    if (studio) {
      const index = studio.worlds.indexOf(worldId)

      if (index !== -1) {
        studio.worlds.splice(index, 1)
      }

      await saveStudio(studio)
    } else {
      throw new Error(
        `Unable to remove world with ID: ${worldId}. Studio with ID ${studioId} does not exist.`
      )
    }
  } catch (error) {
    throw error
  }
}
