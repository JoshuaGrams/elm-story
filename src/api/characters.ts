import { v4 as uuid } from 'uuid'

import { LibraryDatabase } from '../db'

import { Character, ElementId, StudioId, WorldId } from '../data/types'

export async function getCharacter(studioId: StudioId, characterId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getCharacter(characterId)
  } catch (error) {
    throw error
  }
}

export async function getCharactersByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Character[]> {
  try {
    return await new LibraryDatabase(studioId).getCharactersByWorldRef(worldId)
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
  characterId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).removeCharacter(studioId, characterId)
  } catch (error) {
    throw error
  }
}
