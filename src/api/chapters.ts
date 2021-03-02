import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { Chapter, ComponentId, StudioId } from '../data/types'

export async function saveChapter(
  studioId: StudioId,
  chapter: Chapter
): Promise<ComponentId> {
  if (!chapter.id) chapter.id = uuid()

  chapter.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveChapter(chapter)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeChapter(
  studioId: StudioId,
  chapterId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removeChapter(chapterId)
  } catch (error) {
    throw new Error(error)
  }
}
