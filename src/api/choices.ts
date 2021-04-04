import { Choice, ComponentId, StudioId } from '../data/types'
import { v4 as uuid } from 'uuid'
import { LibraryDatabase } from '../db'

export async function saveChoice(studioId: StudioId, choice: Choice) {
  if (!choice.id) choice.id = uuid()

  choice.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveChoice(choice)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeChoice(studioId: StudioId, choiceId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeChoice(choiceId)
  } catch (error) {
    throw new Error(error)
  }
}
