import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import { Chapter, ComponentId, GameId, StudioId } from '../data/types'

export async function getChapter(studioId: StudioId, chapterId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getChapter(chapterId)
  } catch (error) {
    throw new Error(error)
  }
}

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

export async function getChaptersByGameId(
  studioId: StudioId,
  gameId: GameId
): Promise<Chapter[]> {
  try {
    return await new LibraryDatabase(studioId).getChaptersByGameId(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getSceneIdsByChapterId(
  studioId: StudioId,
  chapterId: ComponentId
): Promise<ComponentId[]> {
  try {
    return await new LibraryDatabase(studioId).getSceneIdsByChapterId(chapterId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveChapterTitle(
  studioId: StudioId,
  chapterId: ComponentId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveComponentTitle(
      chapterId,
      LIBRARY_TABLE.CHAPTERS,
      title
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveSceneRefsToChapter(
  studioId: StudioId,
  chapterId: ComponentId,
  scenes: ComponentId[]
) {
  try {
    await new LibraryDatabase(studioId).saveSceneRefsToChapter(
      chapterId,
      scenes
    )
  } catch (error) {
    throw new Error(error)
  }
}
