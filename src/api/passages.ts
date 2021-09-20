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

import api from '.'

export async function getPassage(studioId: StudioId, passageId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getPassage(passageId)
  } catch (error) {
    throw error
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
    throw error
  }
}

export async function removePassage(
  studioId: StudioId,
  passageId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removePassage(passageId)
  } catch (error) {
    throw error
  }
}

export async function getPassagesByGameRef(
  studioId: StudioId,
  gameId: GameId
): Promise<Passage[]> {
  try {
    return await new LibraryDatabase(studioId).getPassagesByGameRef(gameId)
  } catch (error) {
    throw error
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
    throw error
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
    throw error
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
    throw error
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
    throw error
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
    throw error
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
    throw error
  }
}

export async function switchPassageFromChoiceToInputType(
  studioId: StudioId,
  passage: Passage
) {
  if (passage && passage.id) {
    try {
      await Promise.all([
        passage.choices.map(
          async (choiceId) =>
            await api().choices.removeChoice(studioId, choiceId)
        ),
        api().passages.saveChoiceRefsToPassage(studioId, passage.id, []),
        api().passages.savePassageType(studioId, passage.id, PASSAGE_TYPE.INPUT)
      ])

      const input = await api().inputs.saveInput(studioId, {
        gameId: passage.gameId,
        passageId: passage.id,
        tags: [],
        title: 'Untitled Input',
        variableId: undefined
      })

      input.id &&
        (await api().passages.savePassageInput(studioId, passage.id, input.id))
    } catch (error) {
      throw error
    }
  } else {
    throw new Error(
      'Unable to switch passage type from choice to input. Missing passage or passage ID.'
    )
  }
}

export async function switchPassageFromInputToChoiceType(
  studioId: StudioId,
  passage: Passage
) {
  if (passage && passage.id && passage.input) {
    try {
      await Promise.all([
        api().inputs.removeInput(studioId, passage.input),
        api().passages.savePassageInput(studioId, passage.id, undefined),
        api().passages.savePassageType(
          studioId,
          passage.id,
          PASSAGE_TYPE.CHOICE
        )
      ])
    } catch (error) {
      throw error
    }
  } else {
    throw new Error(
      'Unable to switch passage type from input to choice. Missing passage, passage ID or input ID.'
    )
  }
}

export async function setPassageGameEnd(
  studioId: StudioId,
  passageId: ComponentId,
  gameEnd: boolean
) {
  try {
    await new LibraryDatabase(studioId).setPassageGameEnd(passageId, gameEnd)
  } catch (error) {
    throw error
  }
}
