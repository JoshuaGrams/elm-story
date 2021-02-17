import Dexie from 'dexie'
import {
  DocumentId,
  ProfileDocument,
  EditorDocument,
  GameDocument,
  ChapterDocument,
  SceneDocument,
  PassageDocument,
  ActionDocument,
  ConditionDocument,
  EffectDocument,
  VariableDocument
} from '../data/types'

export enum DATABASE {
  APP = 'esg-app',
  LIBRARY = 'esg-library'
}

export enum APP_TABLE {
  PROFILES = 'profiles',
  EDITORS = 'editors'
}

export enum LIBRARY_TABLE {
  GAMES = 'games',
  CHAPTERS = 'chapters',
  SCENES = 'scenes',
  PASSAGES = 'passages',
  ACTIONS = 'actions',
  CONDITIONS = 'conditions',
  EFFECTS = 'effects',
  VARIABLES = 'variables'
}

export class AppDatabase extends Dexie {
  public profiles: Dexie.Table<ProfileDocument, string>
  public editors: Dexie.Table<EditorDocument, string>

  public constructor() {
    super(DATABASE.APP)

    this.version(1).stores({
      profiles: '&id,title,*tags,updated',
      editors: '&id,updated'
    })

    this.profiles = this.table(APP_TABLE.PROFILES)
    this.editors = this.table(APP_TABLE.EDITORS)
  }

  public async docExists(table: APP_TABLE, id: DocumentId): Promise<boolean> {
    let exists = false

    try {
      exists = (await this[table].where({ id }).first()) ? true : false
    } catch (error) {
      throw new Error(error)
    }

    return exists
  }

  public async getProfile(profileId: DocumentId): Promise<ProfileDocument> {
    try {
      const profile = await this.profiles.get(profileId)

      if (profile) {
        return profile
      } else {
        throw new Error(
          `Unable to get profile with ID: ${profileId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveProfile(profile: ProfileDocument): Promise<DocumentId> {
    try {
      await this.transaction('rw', this.profiles, async () => {
        if (profile.id) {
          if (await this.docExists(APP_TABLE.PROFILES, profile.id)) {
            await this.profiles.update(profile.id, profile)
          } else {
            await this.profiles.add(profile)
          }
        } else {
          throw new Error('Unable to save profile to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    if (profile.id) {
      return profile.id
    } else {
      throw new Error('Unable to save profile to database. Missing ID.')
    }
  }

  public async removeProfile(profileId: DocumentId) {
    try {
      await this.transaction('rw', this.profiles, async () => {
        if (await this.docExists(APP_TABLE.PROFILES, profileId)) {
          await this.profiles.delete(profileId)
        } else {
          throw new Error(
            `Unable to remove profile with ID: '${profileId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }
}

export class LibraryDatabase extends Dexie {
  public games: Dexie.Table<GameDocument, string>
  public chapters: Dexie.Table<ChapterDocument, string>
  public scenes: Dexie.Table<SceneDocument, string>
  public passages: Dexie.Table<PassageDocument, string>
  public actions: Dexie.Table<ActionDocument, string>
  public conditions: Dexie.Table<ConditionDocument, string>
  public effects: Dexie.Table<EffectDocument, string>
  public variables: Dexie.Table<VariableDocument, string>

  public constructor(profileId: string) {
    super(`${DATABASE.LIBRARY}-${profileId}`)

    this.version(2).stores({
      games: '&id,title,*tags,updated,template,director,version,engine',
      chapters: '&id,title,*tags,updated',
      scenes: '&id,title,*tags,updated',
      passages: '&id,title,*tags,updated',
      actions: '&id,title,*tags,updated',
      conditions: '&id,title,*tags,updated',
      effects: '&id,title,*tags,updated',
      variables: '&id,title,*tags,updated'
    })

    this.tables.map((table) => table.name)

    this.games = this.table(LIBRARY_TABLE.GAMES)
    this.chapters = this.table(LIBRARY_TABLE.CHAPTERS)
    this.scenes = this.table(LIBRARY_TABLE.SCENES)
    this.passages = this.table(LIBRARY_TABLE.PASSAGES)
    this.actions = this.table(LIBRARY_TABLE.ACTIONS)
    this.conditions = this.table(LIBRARY_TABLE.CONDITIONS)
    this.effects = this.table(LIBRARY_TABLE.EFFECTS)
    this.variables = this.table(LIBRARY_TABLE.VARIABLES)
  }

  public async docExists(
    table: LIBRARY_TABLE,
    id: DocumentId
  ): Promise<boolean> {
    let exists = false

    try {
      exists = (await this[table].where({ id }).first()) ? true : false
    } catch (error) {
      throw new Error(error)
    }

    return exists
  }

  public async getGame(gameId: DocumentId): Promise<GameDocument> {
    try {
      const profile = await this.games.get(gameId)

      if (profile) {
        return profile
      } else {
        throw new Error(
          `Unable to get profile with ID: ${gameId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveGame(game: GameDocument): Promise<DocumentId> {
    try {
      await this.transaction('rw', this.games, async () => {
        if (game.id) {
          if (await this.docExists(LIBRARY_TABLE.GAMES, game.id)) {
            await this.games.update(game.id, game)
          } else {
            await this.games.add(game)
          }
        } else {
          throw new Error('Unable to save game to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    if (game.id) {
      return game.id
    } else {
      throw new Error('Unable to save game to database. Missing ID.')
    }
  }

  public async removeGame(gameId: DocumentId) {
    try {
      await this.transaction('rw', this.games, async () => {
        if (await this.docExists(LIBRARY_TABLE.GAMES, gameId)) {
          await this.games.delete(gameId)
        } else {
          throw new Error(
            `Unable to remove game with ID: '${gameId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }
}
