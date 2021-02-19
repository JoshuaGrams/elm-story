import Dexie from 'dexie'
import {
  DocumentId,
  StudioDocument,
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
  STUDIOS = 'studios',
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
  public studios: Dexie.Table<StudioDocument, string>
  public editors: Dexie.Table<EditorDocument, string>

  public constructor() {
    super(DATABASE.APP)

    this.version(1).stores({
      studios: '&id,title,*tags,updated',
      editors: '&id,updated'
    })

    this.studios = this.table(APP_TABLE.STUDIOS)
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

  public async getStudio(studioId: DocumentId): Promise<StudioDocument> {
    try {
      const studio = await this.studios.get(studioId)

      if (studio) {
        return studio
      } else {
        throw new Error(
          `Unable to get studio with ID: ${studioId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveStudio(studio: StudioDocument): Promise<DocumentId> {
    try {
      await this.transaction('rw', this.studios, async () => {
        if (studio.id) {
          if (await this.docExists(APP_TABLE.STUDIOS, studio.id)) {
            await this.studios.update(studio.id, studio)
          } else {
            await this.studios.add(studio)
          }
        } else {
          throw new Error('Unable to save studio to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    if (studio.id) {
      return studio.id
    } else {
      throw new Error('Unable to save studio to database. Missing ID.')
    }
  }

  public async removeStudio(studioId: DocumentId) {
    try {
      await this.transaction('rw', this.studios, async () => {
        if (await this.docExists(APP_TABLE.STUDIOS, studioId)) {
          await this.studios.delete(studioId)
        } else {
          throw new Error(
            `Unable to remove studio with ID: '${studioId}'. Does not exist.`
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

  public constructor(studioId: string) {
    super(`${DATABASE.LIBRARY}-${studioId}`)

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
      const studio = await this.games.get(gameId)

      if (studio) {
        return studio
      } else {
        throw new Error(
          `Unable to get studio with ID: ${gameId}. Does not exist.`
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
