import logger from '../lib/logger'

import { AppDatabase, LibraryDatabase } from '../db'
import { DocumentId, ProfileDocument } from '../data/types'
import { v4 as uuid } from 'uuid'

export async function getProfile(
  profileId: DocumentId
): Promise<ProfileDocument> {
  try {
    return new AppDatabase().getProfile(profileId)
  } catch (error) {
    throw new Error(error)
  }
}
export async function getGameRefs(
  profileId: DocumentId
): Promise<DocumentId[]> {
  return (await getProfile(profileId)).games
}

/**
 * Saves app profile.
 * TODO: Link profiles to cloud accounts.
 * @returns id on promise resolve
 */
export async function saveProfile(
  profile: ProfileDocument
): Promise<DocumentId> {
  if (!profile.id) profile.id = uuid()

  profile.updated = Date.now()

  return await new AppDatabase().saveProfile(profile)
}

/**
 * Delete app profile.
 * TODO: How does this affect cloud accounts?
 */
export async function removeProfile(profileId: DocumentId) {
  try {
    await new LibraryDatabase(profileId).delete()

    await new AppDatabase().removeProfile(profileId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveGameRef(profileId: DocumentId, gameId: DocumentId) {
  try {
    const profile = await getProfile(profileId),
      exists = profile.games.indexOf(gameId) !== -1

    if (!exists) {
      if (profile) {
        profile.games = [...profile.games, gameId]

        saveProfile(profile)
      } else {
        throw new Error(
          `Unable to save game with ID: ${gameId}. Profile with ID ${profileId} does not exist.`
        )
      }
    } else {
      logger.info(
        `Unable to add game ref ${gameId} to profile ${profileId}. Already exists. Likely game is being updated.`
      )
    }
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeGameRef(profileId: DocumentId, gameId: DocumentId) {
  try {
    const profile = await getProfile(profileId)

    if (profile) {
      const index = profile.games.indexOf(gameId)

      if (index !== -1) {
        profile.games.splice(index)
      }

      await saveProfile(profile)
    } else {
      throw new Error(
        `Unable to remove game with ID: ${gameId}. Profile with ID ${profileId} does not exist.`
      )
    }
  } catch (error) {
    throw new Error(error)
  }
}
