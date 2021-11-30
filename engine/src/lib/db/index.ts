import Dexie from 'dexie'

import {
  EngineBookmarkCollection,
  EngineBookmarkData,
  EngineCharacterData,
  EngineChoiceCollection,
  EngineChoiceData,
  EngineConditionCollection,
  EngineConditionData,
  EngineEffectCollection,
  EngineEffectData,
  EngineEventCollection,
  EngineEventData,
  EngineGameData,
  EngineInputCollection,
  EngineInputData,
  EngineJumpCollection,
  EngineJumpData,
  EnginePassageCollection,
  EnginePassageData,
  EngineRouteCollection,
  EngineRouteData,
  EngineSceneCollection,
  EngineSceneData,
  EngineSettingsCollection,
  EngineSettingsData,
  EngineVariableCollection,
  EngineVariableData,
  WorldId,
  StudioId
} from '../../types'

export enum LIBRARY_TABLE {
  BOOKMARKS = 'bookmarks',
  CHARACTERS = 'characters',
  CHOICES = 'choices',
  CONDITIONS = 'conditions',
  EFFECTS = 'effects',
  EVENTS = 'events',
  GAMES = 'games',
  INPUTS = 'inputs',
  JUMPS = 'jumps',
  PASSAGES = 'passages',
  ROUTES = 'routes',
  SCENES = 'scenes',
  SETTINGS = 'settings',
  VARIABLES = 'variables'
}

import v6 from './v6'
import v7 from './v7'
import v8 from './v8'

export const DB_NAME = 'esg-library'

export class LibraryDatabase extends Dexie {
  public bookmarks: Dexie.Table<EngineBookmarkData, string>
  public characters: Dexie.Table<EngineCharacterData, string>
  public choices: Dexie.Table<EngineChoiceData, string>
  public conditions: Dexie.Table<EngineConditionData, string>
  public effects: Dexie.Table<EngineEffectData, string>
  public events: Dexie.Table<EngineEventData, string>
  public games: Dexie.Table<EngineGameData, string>
  public inputs: Dexie.Table<EngineInputData, string>
  public jumps: Dexie.Table<EngineJumpData, string>
  public passages: Dexie.Table<EnginePassageData, string>
  public routes: Dexie.Table<EngineRouteData, string>
  public scenes: Dexie.Table<EngineSceneData, string>
  public settings: Dexie.Table<EngineSettingsData, string>
  public variables: Dexie.Table<EngineVariableData, string>

  public constructor(studioId: StudioId) {
    super(`${DB_NAME}-${studioId}`)

    v6(this)
    v7(this)
    v8(this)

    this.bookmarks = this.table(LIBRARY_TABLE.BOOKMARKS)
    this.characters = this.table(LIBRARY_TABLE.CHARACTERS)
    this.choices = this.table(LIBRARY_TABLE.CHOICES)
    this.conditions = this.table(LIBRARY_TABLE.CONDITIONS)
    this.effects = this.table(LIBRARY_TABLE.EFFECTS)
    this.events = this.table(LIBRARY_TABLE.EVENTS)
    this.games = this.table(LIBRARY_TABLE.GAMES)
    this.inputs = this.table(LIBRARY_TABLE.INPUTS)
    this.jumps = this.table(LIBRARY_TABLE.JUMPS)
    this.passages = this.table(LIBRARY_TABLE.PASSAGES)
    this.routes = this.table(LIBRARY_TABLE.ROUTES)
    this.scenes = this.table(LIBRARY_TABLE.SCENES)
    this.settings = this.table(LIBRARY_TABLE.SETTINGS)
    this.variables = this.table(LIBRARY_TABLE.VARIABLES)
  }

  public async saveBookmarkCollectionData(
    bookmarkCollection: EngineBookmarkCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.bookmarks,
        async () =>
          await Promise.all([
            Object.keys(bookmarkCollection).map(
              async (key) =>
                await this.bookmarks.add(
                  bookmarkCollection[key],
                  bookmarkCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveChoiceCollectionData(
    gameId: WorldId,
    choiceCollection: EngineChoiceCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.choices,
        async () =>
          await Promise.all([
            Object.keys(choiceCollection).map(
              async (key) =>
                await this.choices.add(
                  { ...choiceCollection[key], gameId },
                  choiceCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveConditionCollectionData(
    gameId: WorldId,
    conditionCollection: EngineConditionCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.conditions,
        async () =>
          await Promise.all([
            Object.keys(conditionCollection).map(
              async (key) =>
                await this.conditions.add(
                  { ...conditionCollection[key], gameId },
                  conditionCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveEffectCollectionData(
    gameId: WorldId,
    effectCollection: EngineEffectCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.effects,
        async () =>
          await Promise.all([
            Object.keys(effectCollection).map(
              async (key) =>
                await this.effects.add(
                  { ...effectCollection[key], gameId },
                  effectCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveEventCollectionData(
    gameId: WorldId,
    eventCollection: EngineEventCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.events,
        async () =>
          await Promise.all([
            Object.keys(eventCollection).map(
              async (key) =>
                await this.events.add(
                  { ...eventCollection[key], gameId },
                  eventCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveGameData(gameData: EngineGameData) {
    try {
      await this.transaction(
        'rw',
        this.games,
        async () => await this.games.add(gameData, gameData.id)
      )
    } catch (error) {
      throw error
    }
  }

  public async saveInputCollectionData(
    gameId: WorldId,
    inputCollection: EngineInputCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.inputs,
        async () =>
          await Promise.all([
            Object.keys(inputCollection).map(
              async (key) =>
                await this.inputs.add(
                  { ...inputCollection[key], gameId },
                  inputCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveJumpCollectionData(
    gameId: WorldId,
    jumpCollection: EngineJumpCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.jumps,
        async () =>
          await Promise.all([
            Object.keys(jumpCollection).map(
              async (key) =>
                await this.jumps.add(
                  { ...jumpCollection[key], gameId },
                  jumpCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async savePassageCollectionData(
    gameId: WorldId,
    passageCollection: EnginePassageCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.passages,
        async () =>
          await Promise.all([
            Object.keys(passageCollection).map(
              async (key) =>
                await this.passages.add(
                  { ...passageCollection[key], gameId },
                  passageCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveRouteCollectionData(
    gameId: WorldId,
    routeCollection: EngineRouteCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.routes,
        async () =>
          await Promise.all([
            Object.keys(routeCollection).map(
              async (key) =>
                await this.routes.add(
                  { ...routeCollection[key], gameId },
                  routeCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveSceneCollectionData(
    gameId: WorldId,
    sceneCollection: EngineSceneCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.scenes,
        async () =>
          await Promise.all([
            Object.keys(sceneCollection).map(
              async (key) =>
                await this.scenes.add(
                  { ...sceneCollection[key], gameId },
                  sceneCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveSettingCollectionData(
    settingsCollection: EngineSettingsCollection,
    update?: boolean
  ) {
    try {
      await this.transaction(
        'rw',
        this.settings,
        async () =>
          await Promise.all([
            Object.keys(settingsCollection).map(async (key) =>
              !update
                ? await this.settings.add(
                    settingsCollection[key],
                    settingsCollection[key].id
                  )
                : await this.settings.update(key, settingsCollection[key])
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveVariableCollectionData(
    gameId: WorldId,
    variableCollection: EngineVariableCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.variables,
        async () =>
          await Promise.all([
            Object.keys(variableCollection).map(
              async (key) =>
                await this.variables.add(
                  { ...variableCollection[key], gameId },
                  variableCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }
}
