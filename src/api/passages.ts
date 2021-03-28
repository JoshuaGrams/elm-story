import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import { Passage, ComponentId, StudioId, GameId } from '../data/types'

export async function getPassage(studioId: StudioId, passageId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getPassage(passageId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function savePassage(
  studioId: StudioId,
  passage: Passage
): Promise<Passage> {
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

export async function getPassagesByGameRef(
  studioId: StudioId,
  gameId: GameId
): Promise<Passage[]> {
  try {
    return await new LibraryDatabase(studioId).getPassagesByGameRef(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function savePassageTitle(
  studioId: StudioId,
  passageId: ComponentId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveComponentTitle(
      passageId,
      LIBRARY_TABLE.PASSAGES,
      title
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveSceneRefToPassage(
  studioId: StudioId,
  sceneId: ComponentId,
  passageId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).saveSceneRefToPassage(
      sceneId,
      passageId
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveChoiceRefsToPassage(
  studioId: StudioId,
  passageId: ComponentId,
  choices: ComponentId[]
) {
  try {
    await new LibraryDatabase(studioId).saveChoiceRefsToPassage(
      passageId,
      choices
    )
  } catch (error) {
    throw new Error(error)
  }
}
