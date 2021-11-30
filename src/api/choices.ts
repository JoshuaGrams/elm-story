import { v4 as uuid } from 'uuid'

import { LibraryDatabase } from '../db'

import { Choice, ElementId, WorldId, StudioId } from '../data/types'

export async function getChoice(studioId: StudioId, choiceId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getChoice(choiceId)
  } catch (error) {
    throw error
  }
}

export async function getChoicesByGameRef(
  studioId: StudioId,
  gameId: WorldId
): Promise<Choice[]> {
  try {
    return await new LibraryDatabase(studioId).getChoicesByGameRef(gameId)
  } catch (error) {
    throw error
  }
}

export async function saveChoice(studioId: StudioId, choice: Choice) {
  if (!choice.id) choice.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveChoice(choice)
  } catch (error) {
    throw error
  }
}

export async function removeChoice(studioId: StudioId, choiceId: ElementId) {
  try {
    await new LibraryDatabase(studioId).removeChoice(choiceId)
  } catch (error) {
    throw error
  }
}
