import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { Passage, ComponentId, StudioId } from '../data/types'

export async function savePassage(
  studioId: StudioId,
  passage: Passage
): Promise<ComponentId> {
  if (!passage.id) passage.id = uuid()

  passage.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).savePassage(passage)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removePassage(
  studioId: StudioId,
  passageId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removePassage(passageId)
  } catch (error) {
    throw new Error(error)
  }
}
