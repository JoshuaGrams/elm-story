import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import {
  ElementId,
  WorldId,
  Jump,
  JumpPath,
  StudioId,
  EVENT_TYPE,
  ELEMENT_TYPE
} from '../data/types'
import { DEFAULT_EVENT_CONTENT } from '../data/eventContentTypes'

import api from '.'

export async function getJump(studioId: StudioId, jumpId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getJump(jumpId)
  } catch (error) {
    throw error
  }
}

export async function getJumpsByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Jump[]> {
  try {
    return await new LibraryDatabase(studioId).getJumpsByWorldRef(worldId)
  } catch (error) {
    throw error
  }
}

export async function getJumpsBySceneRef(
  studioId: StudioId,
  sceneId: ElementId
): Promise<Jump[]> {
  try {
    return await new LibraryDatabase(studioId).getJumpsBySceneRef(sceneId)
  } catch (error) {
    throw error
  }
}

export async function getJumpsByEventRef(
  studioId: StudioId,
  eventId: ElementId
): Promise<Jump[]> {
  try {
    return await new LibraryDatabase(studioId).getJumpsByEventRef(eventId)
  } catch (error) {
    throw error
  }
}

export async function saveJump(studioId: StudioId, jump: Jump): Promise<Jump> {
  if (!jump.id) jump.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveJump(jump)
  } catch (error) {
    throw error
  }
}

export async function saveJumpTitle(
  studioId: StudioId,
  eventId: ElementId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveElementTitle(
      eventId,
      LIBRARY_TABLE.JUMPS,
      title
    )
  } catch (error) {
    throw error
  }
}

export async function saveJumpPath(
  studioId: StudioId,
  jumpId: ElementId,
  jumpPath: JumpPath
): Promise<void> {
  try {
    await new LibraryDatabase(studioId).saveJumpPath(jumpId, jumpPath)
  } catch (error) {
    throw error
  }
}

export async function saveSceneRefToJump(
  studioId: StudioId,
  sceneId: ElementId,
  eventId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).saveSceneRefToJump(sceneId, eventId)
  } catch (error) {
    throw error
  }
}

export async function switchJumpToChoiceOrInputEventType(
  studioId: StudioId,
  jump: Jump,
  eventType: EVENT_TYPE.CHOICE | EVENT_TYPE.INPUT
) {
  if (jump?.id && jump.sceneId) {
    const newEventId = uuid()

    let inputId: string | undefined

    if (eventType === EVENT_TYPE.INPUT) {
      inputId = (
        await api().inputs.saveInput(studioId, {
          eventId: newEventId,
          tags: [],
          title: 'Untitled Input',
          worldId: jump.worldId
        })
      ).id
    }

    const [event, updatedSceneChildRefs, pathsToPatch] = await Promise.all([
      api().events.saveEvent(studioId, {
        characters: [],
        choices: [],
        composer: jump.composer,
        content: JSON.stringify([...DEFAULT_EVENT_CONTENT]),
        ending: false,
        id: newEventId,
        images: [],
        input: inputId,
        sceneId: jump.sceneId,
        tags: [],
        title: 'Untitled Event',
        type: eventType,
        worldId: jump.worldId
      }),
      api().scenes.getChildRefsBySceneRef(studioId, jump.sceneId),
      api().paths.getPathsByDestinationRef(studioId, jump.id),
      api().jumps.removeJump(studioId, jump.id, true)
    ])

    if (event?.id) {
      const foundJumpPosition = updatedSceneChildRefs.findIndex(
        (child) => child[1] === jump.id
      )

      if (foundJumpPosition !== -1) {
        updatedSceneChildRefs[foundJumpPosition] = [
          ELEMENT_TYPE.EVENT,
          event.id
        ]

        await Promise.all([
          pathsToPatch.map(async (path) => {
            event?.id &&
              (await api().paths.savePath(studioId, {
                ...path,
                destinationId: event.id,
                destinationType: ELEMENT_TYPE.EVENT
              }))
          }),
          api().scenes.saveChildRefsToScene(
            studioId,
            jump.sceneId,
            updatedSceneChildRefs
          )
        ])
      }
    }

    return event?.id
  } else {
    throw 'Unable to switch event type from jump to choice. Missing jump or jump ID.'
  }
}

export async function removeJump(
  studioId: StudioId,
  jumpId: ElementId,
  skipDestinationPaths: boolean = false
) {
  try {
    await new LibraryDatabase(studioId).removeJump(jumpId, skipDestinationPaths)
  } catch (error) {
    throw error
  }
}
