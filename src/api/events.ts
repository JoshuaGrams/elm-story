import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import { Descendant } from 'slate'
import {
  Event,
  ElementId,
  StudioId,
  WorldId,
  EVENT_TYPE,
  CharacterRefs,
  CharacterMask,
  CHARACTER_MASK_TYPE,
  ELEMENT_TYPE
} from '../data/types'

import api from '.'

export async function getEvent(studioId: StudioId, eventId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getEvent(eventId)
  } catch (error) {
    throw error
  }
}

export async function saveEvent(
  studioId: StudioId,
  event: Event
): Promise<Event> {
  if (!event.id) event.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveEvent(event)
  } catch (error) {
    throw error
  }
}

export async function removeEvent(
  studioId: StudioId,
  eventId: ElementId,
  skipOriginPaths: boolean = false,
  skipDestinationPaths: boolean = false
) {
  try {
    await new LibraryDatabase(studioId).removeEvent(
      eventId,
      skipOriginPaths,
      skipDestinationPaths
    )
  } catch (error) {
    throw error
  }
}

export async function getEventsByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Event[]> {
  try {
    return await new LibraryDatabase(studioId).getEventsByWorldRef(worldId)
  } catch (error) {
    throw error
  }
}

export async function saveEventTitle(
  studioId: StudioId,
  eventId: ElementId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveElementTitle(
      eventId,
      LIBRARY_TABLE.EVENTS,
      title
    )
  } catch (error) {
    throw error
  }
}

export async function saveEventType(
  studioId: StudioId,
  eventId: ElementId,
  type: EVENT_TYPE
) {
  try {
    await new LibraryDatabase(studioId).saveEventType(eventId, type)
  } catch (error) {
    throw error
  }
}

export async function saveEventInput(
  studioId: StudioId,
  eventId: ElementId,
  inputId?: ElementId
) {
  try {
    await new LibraryDatabase(studioId).saveEventInput(eventId, inputId)
  } catch (error) {
    throw error
  }
}

export async function saveEventContent(
  studioId: StudioId,
  eventId: ElementId,
  contentObject: Descendant[]
) {
  try {
    await new LibraryDatabase(studioId).saveEventContent(
      eventId,
      JSON.stringify(contentObject)
    )
  } catch (error) {
    throw error
  }
}

export async function saveSceneRefToEvent(
  studioId: StudioId,
  sceneId: ElementId,
  eventId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).saveSceneRefToEvent(sceneId, eventId)
  } catch (error) {
    throw error
  }
}

export async function saveChoiceRefsToEvent(
  studioId: StudioId,
  eventId: ElementId,
  choices: ElementId[]
) {
  try {
    await new LibraryDatabase(studioId).saveChoiceRefsToEvent(eventId, choices)
  } catch (error) {
    throw error
  }
}

export async function switchEventFromChoiceToInputType(
  studioId: StudioId,
  event: Event
) {
  if (event && event.id) {
    try {
      const foundPassthroughPaths = await api().paths.getPassthroughPathsByEventRef(
        studioId,
        event.id
      )

      await Promise.all([
        foundPassthroughPaths.map(async (foundPath) => {
          foundPath.id &&
            foundPath.choiceId === undefined &&
            api().paths.removePath(studioId, foundPath.id)
        }),
        event.choices.map(
          async (choiceId) =>
            await api().choices.removeChoice(studioId, choiceId)
        ),
        api().events.saveChoiceRefsToEvent(studioId, event.id, []),
        api().events.saveEventType(studioId, event.id, EVENT_TYPE.INPUT)
      ])

      const input = await api().inputs.saveInput(studioId, {
        worldId: event.worldId,
        eventId: event.id,
        tags: [],
        title: 'Untitled Input',
        variableId: undefined
      })

      input.id &&
        (await api().events.saveEventInput(studioId, event.id, input.id))
    } catch (error) {
      throw error
    }
  } else {
    throw new Error(
      'Unable to switch event type from choice to input. Missing event or event ID.'
    )
  }
}

export async function switchEventFromChoiceOrInputToJumpType(
  studioId: StudioId,
  event: Event
): Promise<ElementId | undefined> {
  if (event?.id) {
    try {
      const [jump, updatedSceneChildRefs, pathsToPatch] = await Promise.all([
        api().jumps.saveJump(studioId, {
          composer: event.composer,
          path: [event.sceneId],
          sceneId: event.sceneId,
          tags: [],
          title: 'Untitled Jump',
          worldId: event.worldId
        }),
        api().scenes.getChildRefsBySceneRef(studioId, event.sceneId),
        api().paths.getPathsByDestinationRef(studioId, event.id),
        api().events.removeEvent(studioId, event.id, false, true)
      ])

      if (jump?.id) {
        const foundEventPosition = updatedSceneChildRefs.findIndex(
          (child) => child[1] === event.id
        )

        if (foundEventPosition !== -1) {
          updatedSceneChildRefs[foundEventPosition] = [
            ELEMENT_TYPE.JUMP,
            jump.id
          ]

          await Promise.all([
            pathsToPatch.map(async (path) => {
              jump?.id &&
                (await api().paths.savePath(studioId, {
                  ...path,
                  destinationId: jump.id,
                  destinationType: ELEMENT_TYPE.JUMP
                }))
            }),
            api().scenes.saveChildRefsToScene(
              studioId,
              event.sceneId,
              updatedSceneChildRefs
            )
          ])
        }
      }

      return jump?.id
    } catch (error) {
      throw error
    }
  } else {
    throw 'Unable to switch event type from choice to jump. Missing event or event ID.'
  }
}

export async function switchEventFromInputToChoiceType(
  studioId: StudioId,
  event: Event
) {
  if (event && event.id && event.input) {
    try {
      await Promise.all([
        api().inputs.removeInput(studioId, event.input),
        api().events.saveEventInput(studioId, event.id, undefined),
        api().events.saveEventType(studioId, event.id, EVENT_TYPE.CHOICE)
      ])
    } catch (error) {
      throw error
    }
  } else {
    throw new Error(
      'Unable to switch event type from input to choice or input. Missing event, event ID or input ID.'
    )
  }
}

export async function setEventEnding(
  studioId: StudioId,
  eventId: ElementId,
  ending: boolean
) {
  try {
    await new LibraryDatabase(studioId).setEventEnding(eventId, ending)
  } catch (error) {
    throw error
  }
}

// receive new references and remove dead
export async function removeDeadPersonaRefsFromEvent(
  studioId: StudioId,
  characterId: ElementId,
  newRefs: CharacterRefs
) {
  const db = new LibraryDatabase(studioId)

  try {
    const events = await db.events
      .where('persona')
      .equals(characterId)
      .toArray()

    await Promise.all(
      events.map(async (event) => {
        if (!event.persona) return

        let clearRef = true

        newRefs.map((newRef) => {
          if (newRef[0] === event.persona?.[2]) {
            clearRef = false
            return
          }
        })

        if (clearRef && event.id) {
          try {
            await db.events.update(event.id, {
              ...event,
              persona: [event.persona[0], event.persona[1], undefined],
              updated: Date.now()
            })
          } catch (error) {
            throw error
          }
        }
      })
    )
  } catch (error) {
    throw error
  }
}

// when characters are removed
export async function removeDeadPersonas(
  studioId: StudioId,
  characterId: ElementId
) {
  const db = new LibraryDatabase(studioId)

  try {
    const events = await db.events
      .where('persona')
      .equals(characterId)
      .toArray()

    await Promise.all([
      events.map(async (event) => {
        try {
          event.id &&
            (await db.events.update(event.id, {
              ...event,
              persona: undefined,
              updated: Date.now()
            }))
        } catch (error) {
          throw error
        }
      })
    ])
  } catch (error) {
    throw error
  }
}

// when characters are removed
// elmstorygames/feedback#212
export async function removeDeadCharacterRefs(
  studioId: StudioId,
  characterId: ElementId
) {
  const db = new LibraryDatabase(studioId)

  try {
    const referenceEvents = await db.events
      .where('characters')
      .equals(characterId || '')
      .toArray()

    await Promise.all([
      referenceEvents.map(async (event) => {
        event.id &&
          (await db.events.update(event.id, {
            ...event,
            characters: event.characters.filter(
              (existingCharacterId) => existingCharacterId !== characterId
            ),
            updated: Date.now()
          }))
      })
    ])
  } catch (error) {
    throw error
  }
}

// when mask is disabled, reset to NEUTRAL
export async function resetPersonaMaskFromEvent(
  studioId: StudioId,
  characterId: ElementId,
  newMasks: CharacterMask[]
) {
  const db = new LibraryDatabase(studioId)

  try {
    const events = await db.events
      .where('persona')
      .equals(characterId)
      .toArray()

    await Promise.all(
      events.map(async (event) => {
        if (!event.persona) return

        let resetMask = true

        newMasks.map((newMask) => {
          if (newMask.type === event.persona?.[1] && newMask.active) {
            resetMask = false
            return
          }
        })

        if (resetMask && event.id) {
          try {
            await db.events.update(event.id, {
              ...event,
              persona: [
                event.persona[0],
                CHARACTER_MASK_TYPE.NEUTRAL,
                event.persona[2]
              ],
              updated: Date.now()
            })
          } catch (error) {
            throw error
          }
        }
      })
    )
  } catch (error) {
    throw error
  }
}
