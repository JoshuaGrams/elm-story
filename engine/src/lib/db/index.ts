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
  EngineLiveEventData,
  EngineWorldData,
  EngineInputCollection,
  EngineInputData,
  EngineJumpCollection,
  EngineJumpData,
  EngineLiveEventCollection,
  EngineEventData,
  EnginePathCollection,
  EnginePathData,
  EngineSceneCollection,
  EngineSceneData,
  EngineSettingsCollection,
  EngineSettingsData,
  EngineVariableCollection,
  EngineVariableData,
  WorldId,
  StudioId,
  EngineCharacterCollection
} from '../../types'

export enum LIBRARY_TABLE {
  BOOKMARKS = 'bookmarks',
  CHARACTERS = 'characters',
  CHOICES = 'choices',
  CONDITIONS = 'conditions',
  EFFECTS = 'effects',
  EVENTS = 'events',
  FOLDERS = 'folders',
  INPUTS = 'inputs',
  JUMPS = 'jumps',
  LIVE_EVENTS = 'live_events',
  PATHS = 'paths',
  SCENES = 'scenes',
  SETTINGS = 'settings',
  VARIABLES = 'variables',
  WORLDS = 'worlds'
}

import v6 from './v6'
import v7 from './v7'
import v8 from './v8'
import v9 from './v9'
import v10 from './v10'

export const DB_NAME = 'esg-library'

export class LibraryDatabase extends Dexie {
  public bookmarks: Dexie.Table<EngineBookmarkData, string>
  public characters: Dexie.Table<EngineCharacterData, string>
  public choices: Dexie.Table<EngineChoiceData, string>
  public conditions: Dexie.Table<EngineConditionData, string>
  public effects: Dexie.Table<EngineEffectData, string>
  public events: Dexie.Table<EngineEventData, string>
  public inputs: Dexie.Table<EngineInputData, string>
  public jumps: Dexie.Table<EngineJumpData, string>
  public live_events: Dexie.Table<EngineLiveEventData, string>
  public paths: Dexie.Table<EnginePathData, string>
  public scenes: Dexie.Table<EngineSceneData, string>
  public settings: Dexie.Table<EngineSettingsData, string>
  public variables: Dexie.Table<EngineVariableData, string>
  public worlds: Dexie.Table<EngineWorldData, string>

  public constructor(studioId: StudioId) {
    super(`${DB_NAME}-${studioId}`)

    v6(this)
    v7(this)
    v8(this)
    v9(this)
    v10(this)

    this.bookmarks = this.table(LIBRARY_TABLE.BOOKMARKS)
    this.characters = this.table(LIBRARY_TABLE.CHARACTERS)
    this.choices = this.table(LIBRARY_TABLE.CHOICES)
    this.conditions = this.table(LIBRARY_TABLE.CONDITIONS)
    this.effects = this.table(LIBRARY_TABLE.EFFECTS)
    this.events = this.table(LIBRARY_TABLE.EVENTS)
    this.inputs = this.table(LIBRARY_TABLE.INPUTS)
    this.jumps = this.table(LIBRARY_TABLE.JUMPS)
    this.live_events = this.table(LIBRARY_TABLE.LIVE_EVENTS)
    this.paths = this.table(LIBRARY_TABLE.PATHS)
    this.scenes = this.table(LIBRARY_TABLE.SCENES)
    this.settings = this.table(LIBRARY_TABLE.SETTINGS)
    this.variables = this.table(LIBRARY_TABLE.VARIABLES)
    this.worlds = this.table(LIBRARY_TABLE.WORLDS)
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

  public async saveCharacterCollectionData(
    worldId: WorldId,
    characterCollection: EngineCharacterCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.characters,
        async () =>
          await Promise.all([
            Object.keys(characterCollection).map(
              async (key) =>
                await this.characters.add(
                  { ...characterCollection[key], worldId },
                  characterCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveChoiceCollectionData(
    worldId: WorldId,
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
                  { ...choiceCollection[key], worldId },
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
    worldId: WorldId,
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
                  { ...conditionCollection[key], worldId },
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
    worldId: WorldId,
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
                  { ...effectCollection[key], worldId },
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
    worldId: WorldId,
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
                  { ...eventCollection[key], worldId },
                  eventCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveInputCollectionData(
    worldId: WorldId,
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
                  { ...inputCollection[key], worldId },
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
    worldId: WorldId,
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
                  { ...jumpCollection[key], worldId },
                  jumpCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveLiveEventCollectionData(
    worldId: WorldId,
    liveEventCollection: EngineLiveEventCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.live_events,
        async () =>
          await Promise.all([
            Object.keys(liveEventCollection).map(
              async (key) =>
                await this.live_events.add(
                  { ...liveEventCollection[key], worldId },
                  liveEventCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async savePathCollectionData(
    worldId: WorldId,
    routeCollection: EnginePathCollection
  ) {
    try {
      await this.transaction(
        'rw',
        this.paths,
        async () =>
          await Promise.all([
            Object.keys(routeCollection).map(
              async (key) =>
                await this.paths.add(
                  { ...routeCollection[key], worldId },
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
    worldId: WorldId,
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
                  { ...sceneCollection[key], worldId },
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
    worldId: WorldId,
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
                  { ...variableCollection[key], worldId },
                  variableCollection[key].id
                )
            )
          ])
      )
    } catch (error) {
      throw error
    }
  }

  public async saveWorldData(worldData: EngineWorldData) {
    try {
      await this.transaction(
        'rw',
        this.worlds,
        async () => await this.worlds.add(worldData, worldData.id)
      )
    } catch (error) {
      throw error
    }
  }
}
