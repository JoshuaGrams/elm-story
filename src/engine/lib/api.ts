import Dexie from 'dexie'
import { cloneDeep, pick } from 'lodash'
// @ts-ignore
import lzwCompress from 'lzwcompress'

import { DB_NAME, LibraryDatabase } from './db'

import {
  AUTO_ENGINE_BOOKMARK_KEY,
  DEFAULT_ENGINE_SETTINGS_KEY,
  INITIAL_ENGINE_EVENT_ORIGIN_KEY
} from '../lib'

import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  GameId,
  SET_OPERATOR_TYPE,
  VARIABLE_TYPE,
  ESGEngineCollectionData,
  ENGINE_THEME,
  EngineEventStateCollection,
  EngineConditionData,
  EngineVariableData,
  EngineEventData,
  EngineRouteData,
  ENGINE_EVENT_TYPE,
  EngineChoiceData,
  EngineInputData,
  StudioId,
  EngineVariableCollection,
  EngineGameData,
  EngineGameMeta
} from '../types/0.5.0'

export const getGameInfo = async (
  gameId: GameId
): Promise<EngineGameData | null> => {
  const gameMeta = localStorage.getItem(gameId)

  if (gameMeta) {
    try {
      const parsedGameMeta: EngineGameMeta = JSON.parse(gameMeta),
        foundGame = await new LibraryDatabase(
          parsedGameMeta.studioId
        ).games.get(gameId)

      if (foundGame) {
        return foundGame
      }
    } catch (error) {
      throw error
    }
  }

  return null
}

export const saveGameMeta = (studioId: StudioId, gameId: GameId) => {
  if (!localStorage.getItem(gameId))
    localStorage.setItem(gameId, JSON.stringify({ gameId, studioId }))
}

export const saveEngineCollectionData = async (
  engineData: ESGEngineCollectionData
) => {
  const {
    children,
    designer,
    engine,
    id: gameId,
    jump,
    schema,
    studioId,
    studioTitle,
    tags,
    title,
    updated,
    version
  } = engineData._

  const databaseExists = await Dexie.exists(`${DB_NAME}-${studioId}`)

  if (!databaseExists) {
    const libraryDatabase = new LibraryDatabase(studioId)

    try {
      await Promise.all([
        libraryDatabase.saveChoiceCollectionData(gameId, engineData.choices),
        libraryDatabase.saveConditionCollectionData(
          gameId,
          engineData.conditions
        ),
        libraryDatabase.saveEffectCollectionData(gameId, engineData.effects),
        libraryDatabase.saveGameData({
          children,
          designer,
          engine,
          id: gameId,
          jump,
          schema,
          studioId,
          studioTitle,
          tags,
          title,
          updated,
          version
        }),
        libraryDatabase.saveInputCollectionData(gameId, engineData.inputs),
        libraryDatabase.saveJumpCollectionData(gameId, engineData.jumps),
        libraryDatabase.savePassageCollectionData(gameId, engineData.passages),
        libraryDatabase.saveRouteCollectionData(gameId, engineData.routes),
        libraryDatabase.saveSceneCollectionData(gameId, engineData.scenes),
        libraryDatabase.saveVariableCollectionData(gameId, engineData.variables)
      ])

      await saveEngineDefaultGameCollectionData(studioId, gameId)
    } catch (error) {
      throw error
    }
  }
}

export const saveEngineDefaultGameCollectionData = async (
  studioId: StudioId,
  gameId: GameId
) => {
  saveGameMeta(studioId, gameId)

  const libraryDatabase = new LibraryDatabase(studioId)

  try {
    const [
      existingAutoBookmark,
      existingDefaultSettings,
      existingInitialEvent
    ] = await Promise.all([
      libraryDatabase.bookmarks.get(`${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`),
      libraryDatabase.settings.get(`${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`),
      libraryDatabase.events.get(`${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`)
    ])

    let promises: Promise<void>[] = []

    if (!existingAutoBookmark) {
      promises.push(
        libraryDatabase.saveBookmarkCollectionData({
          AUTO_ENGINE_BOOKMARK_KEY: {
            gameId,
            id: `${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`,
            title: AUTO_ENGINE_BOOKMARK_KEY,
            event: undefined,
            updated: Date.now()
          }
        })
      )
    }

    if (!existingDefaultSettings) {
      promises.push(
        libraryDatabase.saveSettingCollectionData({
          DEFAULT_ENGINE_SETTINGS: {
            gameId,
            id: `${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`,
            theme: ENGINE_THEME.BOOK
          }
        })
      )
    }

    await Promise.all(promises)

    if (!existingInitialEvent) {
      const variablesArr = await libraryDatabase.variables
        .where({ gameId })
        .toArray()

      let variables: EngineVariableCollection = {}

      variablesArr.map(
        (variable) => (variables[variable.id] = cloneDeep(variable))
      )

      // event is used when player first starts game
      const initialGameState: EngineEventStateCollection = {}

      Object.keys(variables).map((key) => {
        const { title, type, initialValue } = pick(variables[key], [
          'title',
          'type',
          'initialValue'
        ])

        initialGameState[key] = { gameId, title, type, value: initialValue }
      })

      await libraryDatabase.saveEventCollectionData(gameId, {
        INITIAL_ENGINE_EVENT: {
          gameId,
          id: `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`,
          destination: await findStartingDestinationPassage(studioId, gameId),
          state: initialGameState,
          type: ENGINE_EVENT_TYPE.INITIAL,
          updated: Date.now()
        }
      })
    }
  } catch (error) {
    throw error
  }
}

export const unpackEngineData = (
  packedEngineData: string
): ESGEngineCollectionData => lzwCompress.unpack(packedEngineData)

// #30
export const resetGame = async (studioId: StudioId, gameId: GameId) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId)

    try {
      await Promise.all([
        libraryDatabase.bookmarks.where({ gameId }).delete(),
        libraryDatabase.events.where({ gameId }).delete(),
        libraryDatabase.settings.where({ gameId }).delete()
      ])

      await saveEngineDefaultGameCollectionData(studioId, gameId)
    } catch (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}

export const findStartingDestinationPassage = async (
  studioId: StudioId,
  gameId: GameId
): Promise<ComponentId> => {
  const libraryDatabase = new LibraryDatabase(studioId),
    game = await libraryDatabase.games.get(gameId)

  if (game) {
    try {
      if (game.jump) {
        const foundJump = await libraryDatabase.jumps.get(game.jump)

        if (foundJump) {
          if (foundJump.route[1]) {
            return foundJump.route[1]
          }

          if (!foundJump.route[1] && foundJump.route[0]) {
            const foundScene = await libraryDatabase.scenes.get(
              foundJump.route[0]
            )

            if (!foundScene)
              throw 'Unable to find starting passage. Missing scene.'

            if (foundScene.children[0][1]) {
              return foundScene.children[0][1]
            } else {
              throw 'Unable to find starting passage. Missing passage in scene.'
            }
          } else {
            throw 'Unable to find starting passage. Missing scene in route.'
          }
        }
      }

      if (!game.jump) {
        const libraryDatabase = new LibraryDatabase(studioId),
          foundScene = game.children[0]
            ? await libraryDatabase.scenes.get(game.children[0])
            : await libraryDatabase.scenes.toCollection().first()

        if (!foundScene) throw 'Unable to find starting passage. Missing scene.'

        if (foundScene.children[0][1]) {
          // TODO: scenes may eventually have nested folders

          return foundScene.children[0][1]
        } else {
          throw 'Unable to find starting passage. Missing passage in scene.'
        }
      }

      throw 'Unable to find starting passage.'
    } catch (error) {
      throw error
    }
  } else {
    throw 'Unable to find starting location. Missing game info.'
  }
}

export const findDestinationPassage = async (
  studioId: StudioId,
  destinationId: ComponentId,
  destinationType: COMPONENT_TYPE
) => {
  let foundLocation: ComponentId | undefined

  switch (destinationType) {
    case COMPONENT_TYPE.PASSAGE:
      const foundPassage = await getPassage(studioId, destinationId)

      if (foundPassage) {
        foundLocation = foundPassage.id
      }

      break
    case COMPONENT_TYPE.JUMP:
      const foundJump = await getJump(studioId, destinationId)

      if (foundJump && foundJump.route[0]) {
        if (foundJump.route[1]) {
          foundLocation = foundJump.route[1]
        }

        if (!foundJump.route[1]) {
          const foundScene = await getScene(studioId, foundJump.route[0])

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
    throw 'Unable to find destination. Missing passage.'
  }
}

export const getBookmarkAuto = async (studioId: StudioId, gameId: GameId) => {
  try {
    return await new LibraryDatabase(studioId).bookmarks.get(
      `${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`
    )
  } catch (error) {
    throw error
  }
}

export const getBookmark = async (
  studioId: StudioId,
  bookmarkId: ComponentId
) => {
  try {
    return await new LibraryDatabase(studioId).bookmarks.get(bookmarkId)
  } catch (error) {
    throw error
  }
}

export const getBookmarks = async (studioId: StudioId, gameId: GameId) => {
  try {
    return await new LibraryDatabase(studioId).bookmarks
      .where({ gameId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const saveBookmarkEvent = async (
  studioId: StudioId,
  bookmarkId: ComponentId,
  eventId: ComponentId
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundBookmark = await libraryDatabase.bookmarks.get(bookmarkId)

    let updatedBookmark

    if (foundBookmark) {
      updatedBookmark = {
        ...foundBookmark,
        event: eventId,
        updated: Date.now()
      }

      await libraryDatabase.bookmarks.update(bookmarkId, updatedBookmark)

      return updatedBookmark
    }
  } catch (error) {
    throw error
  }
}

export const getChoice = async (studioId: StudioId, choiceId: ComponentId) => {
  try {
    return await new LibraryDatabase(studioId).choices.get(choiceId)
  } catch (error) {
    throw error
  }
}

export const getConditionsByRoutes = async (
  studioId: StudioId,
  routeIds: ComponentId[]
) => {
  try {
    return await new LibraryDatabase(studioId).conditions
      .where('routeId')
      .anyOf(routeIds)
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getEffectsByRouteRef = async (
  studioId: StudioId,
  routeId: ComponentId
) => {
  try {
    return await new LibraryDatabase(studioId).effects
      .where({ routeId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const processEffectsByRoute = async (
  studioId: StudioId,
  routeId: ComponentId,
  state: EngineEventStateCollection
) => {
  const effects = await getEffectsByRouteRef(studioId, routeId)

  if (effects.length > 0) {
    const newState: EngineEventStateCollection = cloneDeep(state)

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

export const saveEvent = async (
  studioId: StudioId,
  eventData: EngineEventData
) => {
  try {
    await new LibraryDatabase(studioId).events.add(eventData)
  } catch (error) {
    throw error
  }
}

export const saveEventNext = async (
  studioId: StudioId,
  eventId: ComponentId,
  nextEventId: ComponentId
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundEvent = await libraryDatabase.events.get(eventId)

    if (foundEvent) {
      await libraryDatabase.events.update(eventId, {
        ...foundEvent,
        next: nextEventId
      })
    }
  } catch (error) {
    throw error
  }
}

export const saveEventResult = async (
  studioId: StudioId,
  eventId: ComponentId,
  result: string
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundEvent = await libraryDatabase.events.get(eventId)

    if (foundEvent) {
      await libraryDatabase.events.update(eventId, {
        ...foundEvent,
        result,
        updated: Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}

export const saveEventType = async (
  studioId: StudioId,
  eventId: ComponentId,
  type: ENGINE_EVENT_TYPE
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundEvent = await libraryDatabase.events.get(eventId)

    if (foundEvent) {
      await libraryDatabase.events.update(eventId, {
        ...foundEvent,
        type,
        updated: Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}
export const saveEventDate = async (
  studioId: StudioId,
  eventId: ComponentId,
  date?: number
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundEvent = await libraryDatabase.events.get(eventId)

    if (foundEvent) {
      await libraryDatabase.events.update(eventId, {
        ...foundEvent,
        updated: date || Date.now()
      })
    }
  } catch (error) {
    throw error
  }
}

export const getRecentEvents = async (
  studioId: StudioId,
  gameId: GameId,
  fromEventId: ComponentId,
  history?: number
) => {
  const libraryDatabase = new LibraryDatabase(studioId)

  try {
    let recentEvents: EngineEventData[] = []

    // https://github.com/dfahlander/Dexie.js/issues/867#issuecomment-507865559
    const orderedEvents = await libraryDatabase.events
        .where('[gameId+updated]')
        .between([gameId, Dexie.minKey], [gameId, Dexie.maxKey])
        .limit(history || 10)
        .reverse()
        .toArray(),
      mostRecentEventIndex = orderedEvents.findIndex(
        (event) => event.id === fromEventId
      )

    // if restartIndex, trim recent events to restart
    const restartIndex = orderedEvents.findIndex(
      (event) => event.type === ENGINE_EVENT_TYPE.RESTART
    )

    if (mostRecentEventIndex !== -1) {
      recentEvents =
        restartIndex !== -1
          ? orderedEvents.slice(mostRecentEventIndex, restartIndex + 1)
          : orderedEvents
    }

    return recentEvents
  } catch (error) {
    throw error
  }
}

export const getEventInitial = async (studioId: StudioId, gameId: GameId) => {
  try {
    return await new LibraryDatabase(studioId).events.get(
      `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`
    )
  } catch (error) {
    throw error
  }
}

export const getEvent = async (studioId: StudioId, eventId: ComponentId) => {
  try {
    return await new LibraryDatabase(studioId).events.get(eventId)
  } catch (error) {
    throw error
  }
}

export const getJump = async (studioId: StudioId, jumpId: ComponentId) => {
  try {
    return await new LibraryDatabase(studioId).jumps.get(jumpId)
  } catch (error) {
    throw error
  }
}

export const getPassage = async (
  studioId: StudioId,
  passageId: ComponentId
) => {
  try {
    return await new LibraryDatabase(studioId).passages.get(passageId)
  } catch (error) {
    throw error
  }
}

export const getChoicesFromPassage = async (
  studioId: StudioId,
  passageId: ComponentId
): Promise<EngineChoiceData[]> => {
  try {
    return await new LibraryDatabase(studioId).choices
      .where({ passageId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getChoicesFromPassageWithOpenRoute = async (
  studioId: StudioId,
  choices: EngineChoiceData[],
  state: EngineEventStateCollection
): Promise<{
  filteredChoices: EngineChoiceData[]
  openRoutes: { [choiceId: ComponentId]: EngineRouteData }
}> => {
  const choicesFromPassage = choices,
    openRoutes: { [choiceId: ComponentId]: EngineRouteData } = {}

  const _choices = await Promise.all(
    choicesFromPassage.map(async (choice) => {
      const routesFromChoice = await getRoutesFromChoice(studioId, choice.id)

      if (routesFromChoice) {
        const openRoute = await findOpenRoute(studioId, routesFromChoice, state)

        if (openRoute) {
          openRoutes[choice.id] = cloneDeep(openRoute)

          return choice
        }
      }

      return undefined
    })
  )

  const filteredChoices = _choices.filter(
    (choice): choice is EngineChoiceData => choice !== undefined
  )

  return {
    filteredChoices,
    openRoutes
  }
}

export const getInputByPassage = async (
  studioId: StudioId,
  passageId: ComponentId
): Promise<EngineInputData | undefined> => {
  try {
    return await new LibraryDatabase(studioId).inputs
      .where({ passageId })
      .first()
  } catch (error) {
    throw error
  }
}

export const getRoutesFromChoice = async (
  studioId: StudioId,
  choiceId: ComponentId
): Promise<EngineRouteData[]> => {
  try {
    return await new LibraryDatabase(studioId).routes
      .where({ choiceId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getRoutesFromChoices = async (
  studioId: StudioId,
  choiceIds: ComponentId[]
) => {
  try {
    return await new LibraryDatabase(studioId).routes
      .where('choiceId')
      .anyOf(choiceIds)
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getRoutesFromInput = async (
  studioId: StudioId,
  inputId: ComponentId
) => {
  try {
    return await new LibraryDatabase(studioId).routes
      .where({ inputId })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const getRouteFromDestination = async (
  studioId: StudioId,
  destinationId: ComponentId
) => {
  try {
    return new LibraryDatabase(studioId).routes.where({ destinationId }).first()
  } catch (error) {
    throw error
  }
}

export const findOpenRoute = async (
  studioId: StudioId,
  routes: EngineRouteData[],
  eventState: EngineEventStateCollection
) => {
  const routeIds = routes.map((route) => route.id),
    conditionsByRoutes = await getConditionsByRoutes(studioId, routeIds),
    openRoutes: EngineRouteData[] = []

  if (conditionsByRoutes) {
    await Promise.all(
      routes.map(async (route) => {
        const routeOpen = await isRouteOpen(
          studioId,
          cloneDeep(eventState),
          conditionsByRoutes.filter(
            (condition) => condition.routeId === route.id
          )
        )

        routeOpen && openRoutes.push(cloneDeep(route))
      })
    )
  }

  return openRoutes.length > 0
    ? openRoutes[(openRoutes.length * Math.random()) | 0]
    : undefined
}

export const isRouteOpen = async (
  studioId: StudioId,
  eventState: EngineEventStateCollection,
  conditions: EngineConditionData[]
) => {
  let isOpen = conditions.length === 0 ? true : false

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

  conditions.length > 0 &&
    conditions.map((condition) => {
      const foundVariable = variablesFromConditions.find(
        (variable) => variable.id === condition.compare[1]
      )

      const currentValue =
        foundVariable && foundVariable.type === VARIABLE_TYPE.NUMBER
          ? Number(eventState[condition.compare[0]].value)
          : eventState[condition.compare[0]].value

      switch (condition.compare[1]) {
        case COMPARE_OPERATOR_TYPE.EQ:
          isOpen = currentValue === `${condition.compare[2]}`
          break
        case COMPARE_OPERATOR_TYPE.GT:
          isOpen = currentValue > condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.GTE:
          isOpen = currentValue >= condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.LT:
          isOpen = currentValue < condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.LTE:
          isOpen = currentValue <= condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.NE:
          isOpen = currentValue !== condition.compare[2]
          break
        default:
          break
      }
    })

  return isOpen
}

export const getScene = async (studioId: StudioId, sceneId: ComponentId) => {
  try {
    return await new LibraryDatabase(studioId).scenes.get(sceneId)
  } catch (error) {
    throw error
  }
}

export const getVariable = async (
  studioId: StudioId,
  variableId: ComponentId
) => {
  try {
    return await new LibraryDatabase(studioId).variables.get(variableId)
  } catch (error) {
    throw error
  }
}

export const getSettingsDefault = async (
  studioId: StudioId,
  gameId: GameId
) => {
  try {
    return await new LibraryDatabase(studioId).settings.get(
      `${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`
    )
  } catch (error) {
    throw error
  }
}

export const saveThemeSetting = async (
  studioId: StudioId,
  gameId: GameId,
  theme: ENGINE_THEME
) => {
  try {
    const libraryDatabase = new LibraryDatabase(studioId),
      foundSettings = await libraryDatabase.settings.get(
        `${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`
      )

    if (foundSettings) {
      await libraryDatabase.settings.update(
        `${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`,
        {
          ...foundSettings,
          theme
        }
      )
    } else {
      throw 'Unable to save theme setting. Missing settings.'
    }
  } catch (error) {
    throw error
  }
}

export const getThemeSetting = async (studioId: StudioId, gameId: GameId) => {
  try {
    return (
      await new LibraryDatabase(studioId).settings.get(
        `${DEFAULT_ENGINE_SETTINGS_KEY}${gameId}`
      )
    )?.theme
  } catch (error) {
    throw error
  }
}
