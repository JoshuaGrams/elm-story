import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import { Descendant } from 'slate'
import {
  Passage,
  ComponentId,
  StudioId,
  GameId,
  PASSAGE_TYPE
} from '../data/types'

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

export async function savePassageType(
  studioId: StudioId,
  passageId: ComponentId,
  type: PASSAGE_TYPE
) {
  try {
    await new LibraryDatabase(studioId).savePassageType(passageId, type)
  } catch (error) {
    throw new Error(error)
  }
}

export async function savePassageInput(
  studioId: StudioId,
  passageId: ComponentId,
  inputId?: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).savePassageInput(passageId, inputId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function savePassageContent(
  studioId: StudioId,
  passageId: ComponentId,
  contentObject: Descendant[]
) {
  try {
    await new LibraryDatabase(studioId).savePassageContent(
      passageId,
      JSON.stringify(contentObject)
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
