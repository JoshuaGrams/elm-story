import { v4 as uuid } from 'uuid'

import { LibraryDatabase } from '../db'

import { Character, ComponentId, StudioId } from '../data/types'

export async function getCharacter(
  studioId: StudioId,
  characterId: ComponentId
) {
  try {
    return await new LibraryDatabase(studioId).getCharacter(characterId)
  } catch (error) {
    throw error
  }
}

export async function saveCharacter(studioId: StudioId, character: Character) {
  if (!character.id) character.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveCharacter(character)
  } catch (error) {
    throw error
  }
}

export async function removeCharacter(
  studioId: StudioId,
  characterId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removeCharacter(characterId)
  } catch (error) {
    throw error
  }
}
