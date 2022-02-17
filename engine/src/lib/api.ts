import Dexie from 'dexie'
import { v4 as uuid } from 'uuid'
import { cloneDeep, pick } from 'lodash'
import semver from 'semver'
// @ts-ignore
import lzwCompress from 'lzwcompress'

import { DB_NAME, LibraryDatabase } from './db'

import {
  COMPARE_OPERATOR_TYPE,
  ElementId,
  ELEMENT_TYPE,
  WorldId,
  SET_OPERATOR_TYPE,
  VARIABLE_TYPE,
  ESGEngineCollectionData,
  ENGINE_THEME,
  EngineLiveEventStateCollection,
  EngineConditionData,
  EngineVariableData,
  EngineLiveEventData,
  EnginePathData,
  ENGINE_LIVE_EVENT_TYPE,
  EngineChoiceData,
  EngineInputData,
  StudioId,
  EngineVariableCollection,
  EngineWorldData,
  EngineEventData,
  EngineLiveEventResult,
  CHARACTER_MASK_TYPE,
  CharacterMask,
  PATH_CONDITIONS_TYPE,
  EngineSettingsData,
  ENGINE_FONT
} from '../types'
import {
  AUTO_ENGINE_BOOKMARK_KEY,
  DEFAULT_ENGINE_SETTINGS_KEY,
  INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY
} from '../lib'

export const getWorldInfo = async (
  studioId: StudioId,
  worldId: WorldId
): Promise<EngineWorldData | null> => {
  try {
    const foundWorld = await new LibraryDatabase(studioId).worlds.get(worldId)

    if (foundWorld) {
      return foundWorld
    }
  } catch (error) {
    throw error
  }

  return null
}

export const saveWorldMeta = (studioId: StudioId, worldId: WorldId) => {
  const worldMeta = localStorage.getItem(worldId)

  // feedback#96
  if (!worldMeta || (worldMeta && JSON.parse(worldMeta).gameId)) {
    localStorage.setItem(worldId, JSON.stringify({ worldId, studioId }))
  }
}

export const saveEngineCollectionData = async (
  engineData: ESGEngineCollectionData,
  update: boolean // #373: when the world requires update, update engine defaults
): Promise<boolean> => {
  const {
    children,
    copyright,
    description,
    designer,
    engine,
    id: worldId,
    jump,
    schema,
    studioId,
    studioTitle,
    tags,
    title,
    updated,
    version,
    website
  } = engineData._

  const databaseExists = await Dexie.exists(`${DB_NAME}-${studioId}`)
  let installedWorld: EngineWorldData | undefined

  if (databaseExists) {
    installedWorld = await new LibraryDatabase(studioId).worlds.get(worldId)
  }

  if (databaseExists && installedWorld && !update) {
    if (semver.gt(version, installedWorld.version)) {
      return true
    }

    if (semver.lt(version, installedWorld.version)) {
      console.error(
        `[STORYTELLER] unable to save world data to database.\n[STORYTELLER] incoming: ${version}, installed: ${installedWorld.version}\n[STORYTELLER] more info: https://docs.elmstory.com/guides/data/pwa`
      )
    }
  }

  if (!databaseExists || (databaseExists && !installedWorld)) {
    saveWorldMeta(studioId, worldId)

    const libraryDatabase = new LibraryDatabase(studioId)

    try {
      await Promise.all([
        libraryDatabase.saveCharacterCollectionData(
          worldId,
          engineData.characters
        ),
        libraryDatabase.saveChoiceCollectionData(worldId, engineData.choices),
        libraryDatabase.saveConditionCollectionData(
          worldId,
          engineData.conditions
        ),
        libraryDatabase.saveEffectCollectionData(worldId, engineData.effects),
        libraryDatabase.saveInputCollectionData(worldId, engineData.inputs),
        libraryDatabase.saveJumpCollectionData(worldId, engineData.jumps),
        libraryDatabase.saveEventCollectionData(worldId, engineData.events),
        libraryDatabase.savePathCollectionData(worldId, engineData.paths),
        libraryDatabase.saveSceneCollectionData(worldId, engineData.scenes),
        libraryDatabase.saveVariableCollectionData(
          worldId,
          engineData.variables
        ),
        libraryDatabase.saveWorldData({
          children,
          copyright,
          description,
          designer,
          engine,
          id: worldId,
          jump,
          schema,
          studioId,
          studioTitle,
          tags,
          title,
          updated,
          version,
          website
        })
      ])

      update &&
        (await updateEngineDefaultWorldCollectionData(studioId, worldId))

      !update &&
        (await saveEngineDefaultWorldCollectionData(studioId, worldId, version))
    } catch (error) {
      throw error
    }
  }

  return false
}

export const saveEngineDefaultWorldCollectionData = async (
  studioId: StudioId,
  worldId: WorldId,
  worldVersion: string
) => {
  const libraryDatabase = new LibraryDatabase(studioId)

  try {
    const [
      existingAutoBookmark,
      existingDefaultSettings,
      existingInitialLiveEvent
    ] = await Promise.all([
      libraryDatabase.bookmarks.get(`${AUTO_ENGINE_BOOKMARK_KEY}${worldId}`),
      libraryDatabase.settings.get(`${DEFAULT_ENGINE_SETTINGS_KEY}${worldId}`),
      libraryDatabase.live_events.get(
        `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}`
      )
    ])

    let promises: Promise<void>[] = []

    if (!existingAutoBookmark) {
      promises.push(
        libraryDatabase.saveBookmarkCollectionData({
          AUTO_ENGINE_BOOKMARK_KEY: {
            worldId,
            id: `${AUTO_ENGINE_BOOKMARK_KEY}${worldId}`,
            title: AUTO_ENGINE_BOOKMARK_KEY,
            liveEventId: undefined,
            updated: Date.now(),
            version: worldVersion
          }
        })
      )
    }

    if (!existingDefaultSettings) {
      promises.push(
        libraryDatabase.saveSettingCollectionData({
          DEFAULT_ENGINE_SETTINGS: {
            worldId,
            id: `${DEFAULT_ENGINE_SETTINGS_KEY}${worldId}`,
            font: ENGINE_FONT.SERIF,
            theme: ENGINE_THEME.CONSOLE
          }
        })
      )
    }

    await Promise.all(promises)

    if (!existingInitialLiveEvent) {
      const variablesArr = await libraryDatabase.variables
        .where({ worldId })
        .toArray()

      let variables: EngineVariableCollection = {}

      variablesArr.map(
        (variable) => (variables[variable.id] = cloneDeep(variable))
      )

      // event is used when player first starts world
      const initialWorldState: EngineLiveEventStateCollection = {}

      Object.keys(variables).map((key) => {
        const { title, type, initialValue } = pick(variables[key], [
          'title',
          'type',
          'initialValue'
        ])

        initialWorldState[key] = { worldId, title, type, value: initialValue }
      })

      const startingDestination = await findStartingDestinationLiveEvent(
        studioId,
        worldId
      )

      if (startingDestination) {
        await libraryDatabase.saveLiveEventCollectionData(worldId, {
          INITIAL_ENGINE_EVENT: {
            worldId,
            id: `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}`,
            destination: startingDestination,
            state: initialWorldState,
            type: ENGINE_LIVE_EVENT_TYPE.INITIAL,
            updated: Date.now(),
            version: worldVersion
          }
        })
      }
    }
  } catch (error) {
    throw error
  }
}

// #373: recursive
const findLiveEventFromBookmarkWithExistingDestination = async (
  studioId: StudioId,
  liveEventId: ElementId
): Promise<EngineLiveEventData | undefined> => {
  const libraryDatabase = new LibraryDatabase(studioId)

  try {
    const foundLiveEvent = await libraryDatabase.live_events.get(liveEventId)

    if (foundLiveEvent) {
      // feedback#94
      const foundDestination = await libraryDatabase.events.get(
        foundLiveEvent.destination
      )

      if (foundDestination) {
        return foundLiveEvent
      } else {
        if (foundLiveEvent.prev) {
          return findLiveEventFromBookmarkWithExistingDestination(
            studioId,
            foundLiveEvent.prev
          )
        } else {
          return undefined
        }
      }
    } else {
      return undefined
    }
  } catch (error) {
    throw error
  }
}

// #373
export const updateEngineDefaultWorldCollectionData = async (
  studioId: StudioId,
  worldId: WorldId
) => {
  const libraryDatabase = new LibraryDatabase(studioId)

  try {
    const foundBookmark = await libraryDatabase.bookmarks.get(
      `${AUTO_ENGINE_BOOKMARK_KEY}${worldId}`
    )

    const [foundWorld, foundLiveEvent] = await Promise.all([
      libraryDatabase.worlds.get(worldId),
      foundBookmark?.liveEventId
        ? findLiveEventFromBookmarkWithExistingDestination(
            studioId,
            foundBookmark.liveEventId
          )
        : undefined
    ])

    if (foundWorld) {
      if (foundLiveEvent) {
        // create new event with patched world state and version
        // update bookmark version and event
        const newLiveEventId = uuid()

        const variables = await libraryDatabase.variables.toArray()

        let newLiveEventState: EngineLiveEventStateCollection = {}

        variables.map(({ id, title, type, initialValue }) => {
          // for each variable, add to new event state
          newLiveEventState[id] = {
            worldId,
            title,
            type,
            value: initialValue
          }

          // if the variable exists in the found world state, use original event state value
          if (foundLiveEvent.state[id]) {
            newLiveEventState[id] = {
              ...newLiveEventState[id],
              value: foundLiveEvent.state[id].value
            }
          }
        })

        await Promise.all([
          libraryDatabase.live_events.add(
            {
              ...foundLiveEvent,
              id: newLiveEventId,
              state: newLiveEventState,
              updated: Date.now(),
              version: foundWorld.version
            },
            newLiveEventId
          ),
          libraryDatabase.bookmarks.update(
            `${AUTO_ENGINE_BOOKMARK_KEY}${worldId}`,
            {
              ...foundBookmark,
              liveEventId: newLiveEventId,
              updated: Date.now(),
              version: foundWorld.version
            }
          )
        ])
      }

      if (!foundLiveEvent) {
        // dump default bookmark and event and recreate
        await Promise.all([
          libraryDatabase.bookmarks.delete(
            `${AUTO_ENGINE_BOOKMARK_KEY}${worldId}`
          ),
          libraryDatabase.live_events.delete(
            `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}`
          )
        ])

        await saveEngineDefaultWorldCollectionData(
          studioId,
          worldId,
          foundWorld.version
        )
      }

      console.info(
        `[STORYTELLER] successfully updated world to ${foundWorld.version}`
      )
    } else {
      throw '[STORYTELLER] unable to update world.\n[STORYTELLER] missing world data.'
    }
  } catch (error) {
    throw error
  }
}

export const unpackEngineData = (
  packedEngineData: string
): ESGEngineCollectionData => lzwCompress.unpack(packedEngineData)

export const removeWorldData = async (studioId: StudioId, worldId: WorldId) => {
  const libraryDatabase = new LibraryDatabase(studioId)

  try {
    await Promise.all([
      libraryDatabase.characters.where({ worldId }).delete(),
      libraryDatabase.choices.where({ worldId }).delete(),
      libraryDatabase.conditions.where({ worldId }).delete(),
      libraryDatabase.effects.where({ worldId }).delete(),
      libraryDatabase.events.where({ worldId }).delete(),
      libraryDatabase.inputs.where({ worldId }).delete(),
      libraryDatabase.jumps.where({ worldId }).delete(),
      libraryDatabase.paths.where({ worldId }).delete(),
      libraryDatabase.scenes.where({ worldId }).delete(),
      libraryDatabase.variables.where({ worldId }).delete(),
      libraryDatabase.worlds.where({ id: worldId }).delete()
    ])
  } catch (error) {
    throw error
  }
}

// #30
export const resetWorld = async (
  studioId: StudioId,
  worldId: WorldId,
  skipInstall?: boolean,
  isEditor?: boolean
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId)

    try {
      await Promise.all([
        libraryDatabase.bookmarks.where({ worldId }).delete(),
        libraryDatabase.live_events.where({ worldId }).delete(),
        libraryDatabase.settings.where({ worldId }).delete()
      ])

      // #412
      if (!isEditor) {
        await removeWorldData(studioId, worldId)

        !skipInstall && localStorage.removeItem(worldId)
      }
    } catch (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}

export const findStartingDestinationLiveEvent = async (
  studioId: StudioId,
  worldId: WorldId
): Promise<ElementId | undefined> => {
  const libraryDatabase = new LibraryDatabase(studioId),
    world = await libraryDatabase.worlds.get(worldId)

  if (world) {
    try {
      if (world.jump) {
        const foundJump = await libraryDatabase.jumps.get(world.jump)

        if (foundJump) {
          if (foundJump.path[1]) {
            return foundJump.path[1]
          }

          if (!foundJump.path[1] && foundJump.path[0]) {
            const foundScene = await libraryDatabase.scenes.get(
              foundJump.path[0]
            )

            if (!foundScene) return undefined

            if (foundScene.children.length > 0 && foundScene.children[0][1]) {
              return foundScene.children[0][1]
            }
          }
        }
      }

      if (!world.jump) {
        const libraryDatabase = new LibraryDatabase(studioId),
          foundScene =
            world.children[0] && world.children[0][0] !== ELEMENT_TYPE.FOLDER
              ? await libraryDatabase.scenes.get(world.children[0][1])
              : await libraryDatabase.scenes.where({ worldId }).first()

        if (!foundScene) return undefined

        if (foundScene.children.length > 0 && foundScene.children[0][1]) {
          // TODO: scenes may eventually have nested folders
          return foundScene.children[0][1]
        }
      }

      return undefined
    } catch (error) {
      throw error
    }
  } else {
    throw 'Unable to find starting location. Missing world info.'
  }
}

export const findDestinationEvent = async (
  studioId: StudioId,
  destinationId: ElementId,
  destinationType: ELEMENT_TYPE
) => {
  let foundLocation: ElementId | undefined

  switch (destinationType) {
    case ELEMENT_TYPE.EVENT:
      const foundEvent = await getEvent(studioId, destinationId)

      if (foundEvent) {
        foundLocation = foundEvent.id
      }

      break
    case ELEMENT_TYPE.JUMP:
      const foundJump = await getJump(studioId, destinationId)

      if (foundJump && foundJump.path[0]) {
        if (foundJump.path[1]) {
          foundLocation = foundJump.path[1]
        }

        if (!foundJump.path[1]) {
          const foundScene = await getScene(studioId, foundJump.path[0])

          if (foundScene?.children[0][1]) {
            foundLocation = foundScene.children[0][1]
          }
        }
      }

      break
    default:
      break
  }

  if (foundLocation) {
    return foundLocation
  } else {
    throw 'Unable to find destination. Missing event.'
  }
}

export const getBookmarkAuto = async (studioId: StudioId, worldId: WorldId) => {
  try {
    return await new LibraryDatabase(studioId).bookmarks.get(
      `${AUTO_ENGINE_BOOKMARK_KEY}${worldId}`
    )
  } catch (error) {
    throw error
  }
}

export const getBookmark = async (
  studioId: StudioId,
  bookmarkId: ElementId
) => {
  try {
    return await new LibraryDatabase(studioId).bookmarks.get(bookmarkId)
  } catch (error) {
    throw error
  }
}

export const getBookmarks = async (studioId: StudioId, worldId: WorldId) => {
  try {
    return await new LibraryDatabase(studioId).bookmarks
      .where({ worldId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const saveBookmarkLiveEvent = async (
  studioId: StudioId,
  bookmarkId: ElementId,
  liveEventId: ElementId
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundBookmark = await libraryDatabase.bookmarks.get(bookmarkId)

    let updatedBookmark

    if (foundBookmark) {
      updatedBookmark = {
        ...foundBookmark,
        liveEventId,
        updated: Date.now()
      }

      await libraryDatabase.bookmarks.update(bookmarkId, updatedBookmark)

      return updatedBookmark
    }

    return undefined
  } catch (error) {
    throw error
  }
}

export const getChoice = async (studioId: StudioId, choiceId: ElementId) => {
  try {
    return await new LibraryDatabase(studioId).choices.get(choiceId)
  } catch (error) {
    throw error
  }
}

export const getConditionsByPaths = async (
  studioId: StudioId,
  pathIds: ElementId[]
) => {
  try {
    return await new LibraryDatabase(studioId).conditions
      .where('pathId')
      .anyOf(pathIds)
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getEffectsByPathRef = async (
  studioId: StudioId,
  pathId: ElementId
) => {
  try {
    return await new LibraryDatabase(studioId).effects
      .where({ pathId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const processEffectsByRoute = async (
  studioId: StudioId,
  pathId: ElementId,
  state: EngineLiveEventStateCollection
) => {
  const effects = await getEffectsByPathRef(studioId, pathId)

  if (effects.length > 0) {
    const newState: EngineLiveEventStateCollection = cloneDeep(state)

    effects.map((effect) => {
      if (effect.id && newState[effect.variableId]) {
        switch (effect.set[1]) {
          case SET_OPERATOR_TYPE.ASSIGN:
            newState[effect.variableId].value = effect.set[2]
            break
          case SET_OPERATOR_TYPE.ADD:
            newState[effect.variableId].value = `${
              Number(newState[effect.variableId].value) + Number(effect.set[2])
            }`
            break
          case SET_OPERATOR_TYPE.SUBTRACT:
            newState[effect.variableId].value = `${
              Number(newState[effect.variableId].value) - Number(effect.set[2])
            }`
            break
          case SET_OPERATOR_TYPE.MULTIPLY:
            newState[effect.variableId].value = `${
              Number(newState[effect.variableId].value) * Number(effect.set[2])
            }`
            break
          case SET_OPERATOR_TYPE.DIVIDE:
            newState[effect.variableId].value = `${
              Number(newState[effect.variableId].value) / Number(effect.set[2])
            }`
            break
          default:
            break
        }
      }
    })

    return newState
  } else {
    return state
  }
}

export const getEvent = async (studioId: StudioId, eventId: ElementId) => {
  try {
    return await new LibraryDatabase(studioId).events.get(eventId)
  } catch (error) {
    throw error
  }
}

export const getCharacterMask = async (
  studioId: StudioId,
  characterId: ElementId,
  maskType: CHARACTER_MASK_TYPE
): Promise<CharacterMask | undefined> => {
  try {
    const foundCharacter = await new LibraryDatabase(studioId).characters.get(
      characterId
    )

    if (foundCharacter) {
      return foundCharacter.masks.find((mask) => mask.type === maskType)
    }

    return undefined
  } catch (error) {
    throw error
  }
}

export const getCharacterReference = async (
  studioId: StudioId,
  characterId: ElementId,
  refId?: string
): Promise<string | undefined> => {
  try {
    const foundCharacter = await new LibraryDatabase(studioId).characters.get(
      characterId
    )

    if (foundCharacter) {
      if (!refId) {
        return foundCharacter.title
      }

      const foundRef = foundCharacter.refs.find((ref) => ref[0] === refId)

      if (foundRef) {
        return foundRef[1]
      } else {
        return foundCharacter.title
      }
    }

    return undefined
  } catch (error) {
    throw error
  }
}

export const getJump = async (studioId: StudioId, jumpId: ElementId) => {
  try {
    return await new LibraryDatabase(studioId).jumps.get(jumpId)
  } catch (error) {
    throw error
  }
}

export const getChoicesFromEvent = async (
  studioId: StudioId,
  eventId: ElementId
): Promise<EngineChoiceData[]> => {
  try {
    return await new LibraryDatabase(studioId).choices
      .where({ eventId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getChoicesFromEventWithOpenPath = async (
  studioId: StudioId,
  choices: EngineChoiceData[],
  state: EngineLiveEventStateCollection,
  includeAll?: boolean // editor can show choices with closed routes
): Promise<{
  filteredChoices: EngineChoiceData[]
  openPaths: { [choiceId: ElementId]: EnginePathData }
}> => {
  const choicesFromEvent = choices,
    openPaths: { [choiceId: ElementId]: EnginePathData } = {}

  const _choices = await Promise.all(
    choicesFromEvent.map(async (choice) => {
      const pathsFromChoice = await getPathsFromChoice(studioId, choice.id)

      if (pathsFromChoice) {
        const openPath = await findOpenPath(studioId, pathsFromChoice, state)

        if (openPath) {
          openPaths[choice.id] = cloneDeep(openPath)

          return choice
        }
      }

      return includeAll ? choice : undefined
    })
  )

  const filteredChoices = _choices.filter(
    (choice): choice is EngineChoiceData => choice !== undefined
  )

  return {
    filteredChoices,
    openPaths
  }
}

export const getInputByEvent = async (
  studioId: StudioId,
  pathId: ElementId
): Promise<EngineInputData | undefined> => {
  try {
    return await new LibraryDatabase(studioId).inputs.where({ pathId }).first()
  } catch (error) {
    throw error
  }
}

export const saveLiveEvent = async (
  studioId: StudioId,
  liveEventData: EngineLiveEventData
) => {
  try {
    await new LibraryDatabase(studioId).live_events.add(liveEventData)
  } catch (error) {
    throw error
  }
}

export const saveLiveEventDestination = async (
  studioId: StudioId,
  liveEventId: ElementId,
  destination: ElementId
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundLiveEvent = await libraryDatabase.live_events.get(liveEventId)

    if (foundLiveEvent) {
      await libraryDatabase.live_events.update(liveEventId, {
        ...foundLiveEvent,
        destination
      })
    }
  } catch (error) {
    throw error
  }
}

export const saveLiveEventNext = async (
  studioId: StudioId,
  liveEventId: ElementId,
  nextLiveEventId: ElementId
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundLiveEvent = await libraryDatabase.live_events.get(liveEventId)

    if (foundLiveEvent) {
      await libraryDatabase.live_events.update(liveEventId, {
        ...foundLiveEvent,
        next: nextLiveEventId
      })
    }
  } catch (error) {
    throw error
  }
}

export const saveLiveEventResult = async (
  studioId: StudioId,
  liveEventId: ElementId,
  result: EngineLiveEventResult
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundLiveEvent = await libraryDatabase.live_events.get(liveEventId)

    if (foundLiveEvent) {
      await libraryDatabase.live_events.update(liveEventId, {
        ...foundLiveEvent,
        result,
        updated: Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}

export const saveLiveEventState = async (
  studioId: StudioId,
  liveEventId: ElementId,
  state: EngineLiveEventStateCollection
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundLiveEvent = await libraryDatabase.live_events.get(liveEventId)

    if (foundLiveEvent) {
      await libraryDatabase.live_events.update(liveEventId, {
        ...foundLiveEvent,
        state,
        updated: Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}

export const saveLiveEventType = async (
  studioId: StudioId,
  liveEventId: ElementId,
  type: ENGINE_LIVE_EVENT_TYPE
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundEvent = await libraryDatabase.live_events.get(liveEventId)

    if (foundEvent) {
      await libraryDatabase.live_events.update(liveEventId, {
        ...foundEvent,
        type,
        updated: Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}
export const saveLiveEventDate = async (
  studioId: StudioId,
  liveEventId: ElementId,
  date?: number
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundEvent = await libraryDatabase.live_events.get(liveEventId)

    if (foundEvent) {
      await libraryDatabase.live_events.update(liveEventId, {
        ...foundEvent,
        updated: date || Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}

export const getRecentLiveEvents = async (
  studioId: StudioId,
  worldId: WorldId,
  fromLiveEventId: ElementId,
  worldVersion: string,
  history?: number
): Promise<EngineLiveEventData[]> => {
  const libraryDatabase = new LibraryDatabase(studioId)

  try {
    let recentEvents: EngineLiveEventData[] = []

    // https://github.com/dfahlander/Dexie.js/issues/867#issuecomment-507865559
    const orderedLiveEvents = await libraryDatabase.live_events
        .where('[worldId+updated]')
        .between([worldId, Dexie.minKey], [worldId, Dexie.maxKey])
        .filter((liveEvent) => liveEvent.version === worldVersion)
        .limit(history || 10)
        .reverse()
        .toArray(),
      mostRecentEventIndex = orderedLiveEvents.findIndex(
        (liveEvent) => liveEvent.id === fromLiveEventId
      )

    // if restartIndex, trim recent live events to restart
    const restartIndex = orderedLiveEvents.findIndex(
      (liveEvent) => liveEvent.type === ENGINE_LIVE_EVENT_TYPE.RESTART
    )

    if (mostRecentEventIndex !== -1) {
      recentEvents =
        restartIndex !== -1
          ? orderedLiveEvents.slice(mostRecentEventIndex, restartIndex + 1)
          : orderedLiveEvents
    }

    return recentEvents
  } catch (error) {
    throw error
  }
}

export const checkLiveEventDestinations = async (
  studioId: StudioId,
  worldId: WorldId,
  events: EngineEventData[]
) => {
  const eventIds = events.map((event) => event.id),
    liveEventDestinationIds = await (
      await new LibraryDatabase(studioId).live_events
        .where({ worldId })
        .toArray()
    ).map((liveEvent) => liveEvent.destination)

  let destinationsValid = true

  liveEventDestinationIds.map((eventDestinationId) => {
    if (eventIds.indexOf(eventDestinationId) === -1) {
      destinationsValid = false
      return
    }
  })

  return destinationsValid
}

export const getLiveEventInitial = async (
  studioId: StudioId,
  worldId: WorldId
) => {
  try {
    return await new LibraryDatabase(studioId).live_events.get(
      `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}`
    )
  } catch (error) {
    throw error
  }
}

export const getLiveEvent = async (studioId: StudioId, eventId: ElementId) => {
  try {
    return await new LibraryDatabase(studioId).live_events.get(eventId)
  } catch (error) {
    throw error
  }
}

export const getPathsFromChoice = async (
  studioId: StudioId,
  choiceId: ElementId
): Promise<EnginePathData[]> => {
  try {
    return await new LibraryDatabase(studioId).paths
      .where({ choiceId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getPathsFromChoices = async (
  studioId: StudioId,
  choiceIds: ElementId[]
) => {
  try {
    return await new LibraryDatabase(studioId).paths
      .where('choiceId')
      .anyOf(choiceIds)
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getPathsFromInput = async (
  studioId: StudioId,
  inputId: ElementId
) => {
  try {
    return await new LibraryDatabase(studioId).paths
      .where({ inputId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getPathFromDestination = async (
  studioId: StudioId,
  destinationId: ElementId
) => {
  try {
    return new LibraryDatabase(studioId).paths.where({ destinationId }).first()
  } catch (error) {
    throw error
  }
}

export const findOpenPath = async (
  studioId: StudioId,
  paths: EnginePathData[],
  liveEventState: EngineLiveEventStateCollection
) => {
  const pathIds = paths.map((path) => path.id),
    conditionsByPaths = await getConditionsByPaths(studioId, pathIds),
    openPaths: [EnginePathData, number][] = []

  if (conditionsByPaths) {
    await Promise.all(
      paths.map(async (path) => {
        const pathOpen = await isPathOpen(
          studioId,
          cloneDeep(liveEventState),
          path.conditionsType,
          conditionsByPaths.filter((condition) => condition.pathId === path.id)
        )

        pathOpen[0] && openPaths.push([cloneDeep(path), pathOpen[1]])
      })
    )
  }

  if (openPaths.length > 0) {
    const pathsWithConditions = openPaths.filter((path) => path[1] > 0)

    return pathsWithConditions.length > 0
      ? pathsWithConditions[(pathsWithConditions.length * Math.random()) | 0][0]
      : openPaths[(openPaths.length * Math.random()) | 0][0]
  } else {
    return undefined
  }
}

export const isPathOpen = async (
  studioId: StudioId,
  liveEventState: EngineLiveEventStateCollection,
  pathConditionsType: PATH_CONDITIONS_TYPE,
  conditions: EngineConditionData[]
  // feedback#105
): Promise<[boolean, number]> => {
  const totalConditions = conditions.length

  if (totalConditions === 0) return [true, 0]

  const isOpenAgg: boolean[] = []

  const variableIdsFromConditions = conditions.map(
    (condition) => condition.variableId
  )

  let variablesFromConditions: EngineVariableData[]

  try {
    variablesFromConditions = await new LibraryDatabase(studioId).variables
      .where('id')
      .anyOf(variableIdsFromConditions)
      .toArray()
  } catch (error) {
    throw error
  }

  if (conditions.length) {
    conditions.map((condition) => {
      // #400
      const foundVariable = variablesFromConditions.find(
        (variable) => variable.id === condition.compare[0]
      )

      if (foundVariable) {
        const eventValue =
          foundVariable.type === VARIABLE_TYPE.NUMBER
            ? Number(liveEventState[condition.compare[0]].value)
            : liveEventState[condition.compare[0]].value.toLowerCase()

        if (foundVariable.type !== VARIABLE_TYPE.NUMBER) {
          const conditionValueAsString = condition.compare[2].toLowerCase()

          switch (condition.compare[1]) {
            case COMPARE_OPERATOR_TYPE.EQ:
              isOpenAgg.push(eventValue === conditionValueAsString)
              break
            case COMPARE_OPERATOR_TYPE.NE:
              isOpenAgg.push(eventValue !== conditionValueAsString)
              break
            default:
              break
          }
        }

        if (foundVariable.type === VARIABLE_TYPE.NUMBER) {
          const conditionValueAsNumber = Number(condition.compare[2])

          switch (condition.compare[1]) {
            case COMPARE_OPERATOR_TYPE.EQ:
              isOpenAgg.push(eventValue === conditionValueAsNumber)
              break
            case COMPARE_OPERATOR_TYPE.GT:
              isOpenAgg.push(eventValue > conditionValueAsNumber)
              break
            case COMPARE_OPERATOR_TYPE.GTE:
              isOpenAgg.push(eventValue >= conditionValueAsNumber)
              break
            case COMPARE_OPERATOR_TYPE.LT:
              isOpenAgg.push(eventValue < conditionValueAsNumber)
              break
            case COMPARE_OPERATOR_TYPE.LTE:
              isOpenAgg.push(eventValue <= conditionValueAsNumber)
              break
            case COMPARE_OPERATOR_TYPE.NE:
              isOpenAgg.push(eventValue !== conditionValueAsNumber)
              break
            default:
              break
          }
        }
      }
    })
  }

  return pathConditionsType === PATH_CONDITIONS_TYPE.ALL
    ? [isOpenAgg.every((value) => value === true), totalConditions]
    : [isOpenAgg.some((value) => value === true), totalConditions]
}

export const getScene = async (studioId: StudioId, sceneId: ElementId) => {
  try {
    return await new LibraryDatabase(studioId).scenes.get(sceneId)
  } catch (error) {
    throw error
  }
}

export const getVariable = async (
  studioId: StudioId,
  variableId: ElementId
) => {
  try {
    return await new LibraryDatabase(studioId).variables.get(variableId)
  } catch (error) {
    throw error
  }
}

export const getSettingsDefault = async (
  studioId: StudioId,
  worldId: WorldId
) => {
  try {
    return await new LibraryDatabase(studioId).settings.get(
      `${DEFAULT_ENGINE_SETTINGS_KEY}${worldId}`
    )
  } catch (error) {
    throw error
  }
}

export const savePresentationSettings = async (
  studioId: StudioId,
  worldId: WorldId,
  theme: ENGINE_THEME,
  font: ENGINE_FONT
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundSettings = await libraryDatabase.settings.get(
        `${DEFAULT_ENGINE_SETTINGS_KEY}${worldId}`
      )

    if (foundSettings) {
      await libraryDatabase.settings.update(
        `${DEFAULT_ENGINE_SETTINGS_KEY}${worldId}`,
        {
          ...foundSettings,
          theme,
          font
        }
      )
    } else {
      throw 'Unable to save theme setting. Missing settings.'
    }
  } catch (error) {
    throw error
  }
}

export const getPresentationSettings = async (
  studioId: StudioId,
  worldId: WorldId
) => {
  try {
    const settings = await new LibraryDatabase(studioId).settings.get(
      `${DEFAULT_ENGINE_SETTINGS_KEY}${worldId}`
    )

    return { theme: settings?.theme, font: settings?.font }
  } catch (error) {
    throw error
  }
}
