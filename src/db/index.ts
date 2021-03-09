import Dexie from 'dexie'
import logger from '../lib/logger'

import {
  Studio,
  StudioId,
  Editor,
  Game,
  GameId,
  ComponentId,
  Chapter,
  Scene,
  Passage,
  Action,
  Condition,
  Effect,
  Variable
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
  public studios: Dexie.Table<Studio, string>
  public editors: Dexie.Table<Editor, string>

  public constructor() {
    super(DATABASE.APP)

    this.version(1).stores({
      studios: '&id,title,*tags,updated',
      editors: '&id,updated'
    })

    this.studios = this.table(APP_TABLE.STUDIOS)
    this.editors = this.table(APP_TABLE.EDITORS)
  }

  public async getComponent(
    table: APP_TABLE,
    id: ComponentId
  ): Promise<boolean> {
    let exists = false

    try {
      exists = (await this[table].where({ id }).first()) ? true : false
    } catch (error) {
      throw new Error(error)
    }

    return exists
  }

  public async getStudio(studioId: StudioId): Promise<Studio> {
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

  public async saveStudio(studio: Studio): Promise<StudioId> {
    try {
      await this.transaction('rw', this.studios, async () => {
        if (studio.id) {
          if (await this.getComponent(APP_TABLE.STUDIOS, studio.id)) {
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

  public async removeStudio(studioId: StudioId) {
    try {
      await this.transaction('rw', this.studios, async () => {
        if (await this.getComponent(APP_TABLE.STUDIOS, studioId)) {
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
  public games: Dexie.Table<Game, string>
  public chapters: Dexie.Table<Chapter, string>
  public scenes: Dexie.Table<Scene, string>
  public passages: Dexie.Table<Passage, string>
  public actions: Dexie.Table<Action, string>
  public conditions: Dexie.Table<Condition, string>
  public effects: Dexie.Table<Effect, string>
  public variables: Dexie.Table<Variable, string>

  public constructor(studioId: string) {
    super(`${DATABASE.LIBRARY}-${studioId}`)

    this.version(2).stores({
      games: '&id,title,*tags,updated,template,director,version,engine',
      chapters: '&id,gameId,title,*tags,updated',
      scenes: '&id,gameId,chapterId,title,*tags,updated',
      passages: '&id,gameId,sceneId,title,*tags,updated',
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

  public async getComponent(table: LIBRARY_TABLE, id: ComponentId) {
    let component = undefined

    try {
      component = (await this[table].where({ id }).first()) || undefined
    } catch (error) {
      throw new Error(error)
    }

    return component
  }

  public async getComponentsByGameId(gameId: GameId, table: LIBRARY_TABLE) {
    try {
      return await this[table].where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveComponentTitle(
    componentId: ComponentId,
    table: LIBRARY_TABLE,
    title: string
  ) {
    try {
      await this.transaction('rw', this[table], async () => {
        if (componentId) {
          const component = await this.getComponent(table, componentId)

          if (component) {
            await this[table].update(componentId, { ...component, title })
          } else {
            throw new Error('Unable to rename component. Component missing.')
          }
        } else {
          throw new Error('Unable to rename component. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getGame(gameId: GameId): Promise<Game> {
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

  public async saveGame(game: Game): Promise<GameId> {
    if (!game.id)
      throw new Error('Unable to save game to database. Missing ID.')

    try {
      await this.transaction('rw', this.games, async () => {
        if (game.id) {
          if (await this.getComponent(LIBRARY_TABLE.GAMES, game.id)) {
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

    return game.id
  }

  public async removeGame(gameId: GameId) {
    if (!gameId) throw new Error('Unable to remove game. Missing ID.')

    try {
      const chapters = await this.chapters.where({ gameId }).toArray(),
        scenes = await this.scenes.where({ gameId }).toArray(),
        passages = await this.passages.where({ gameId }).toArray()

      logger.info(`Removing game with ID: ${gameId}`)
      logger.info(`CHAPTERS: Removing ${chapters.length}...`)
      logger.info(`SCENES: Removing ${scenes.length}...`)
      logger.info(`PASSAGES: Removing ${passages.length}...`)

      await Promise.all([
        chapters.map(async (chapter) => {
          if (chapter.id) await this.chapters.delete(chapter.id)
        }),
        scenes.map(async (scene) => {
          if (scene.id) await this.scenes.delete(scene.id)
        }),
        passages.map(async (passage) => {
          if (passage.id) await this.passages.delete(passage.id)
        })
      ])

      await this.transaction('rw', this.games, async () => {
        if (await this.getComponent(LIBRARY_TABLE.GAMES, gameId)) {
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

  public async saveChapter(chapter: Chapter): Promise<ComponentId> {
    if (!chapter.gameId)
      throw new Error('Unable to save chapter to databse. Missing game ID.')
    if (!chapter.id)
      throw new Error('Unable to save chapter to database. Missing ID.')

    try {
      await this.transaction('rw', this.chapters, async () => {
        if (chapter.id) {
          if (await this.getComponent(LIBRARY_TABLE.CHAPTERS, chapter.id)) {
            await this.chapters.update(chapter.id, chapter)
          } else {
            await this.chapters.add(chapter)
          }
        } else {
          throw new Error('Unable to save chapter to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return chapter.id
  }

  public async removeChapter(chapterId: ComponentId) {
    try {
      await this.transaction('rw', this.chapters, async () => {
        if (await this.getComponent(LIBRARY_TABLE.CHAPTERS, chapterId)) {
          await this.chapters.delete(chapterId)
        } else {
          throw new Error(
            `Unable to remove chapter with ID: '${chapterId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getChaptersByGameId(gameId: GameId): Promise<Chapter[]> {
    try {
      return await this.chapters.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveScene(scene: Scene): Promise<ComponentId> {
    if (!scene.chapterId)
      throw new Error('Unable to save scene to databse. Missing chapter ID.')
    if (!scene.id)
      throw new Error('Unable to save scene to database. Missing ID.')

    try {
      await this.transaction('rw', this.scenes, async () => {
        if (scene.id) {
          if (await this.getComponent(LIBRARY_TABLE.SCENES, scene.id)) {
            await this.scenes.update(scene.id, scene)
          } else {
            await this.scenes.add(scene)
          }
        } else {
          throw new Error('Unable to save scene to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return scene.id
  }

  public async removeScene(sceneId: ComponentId) {
    try {
      await this.transaction('rw', this.scenes, async () => {
        if (await this.getComponent(LIBRARY_TABLE.SCENES, sceneId)) {
          await this.scenes.delete(sceneId)
        } else {
          throw new Error(
            `Unable to remove scene with ID: '${sceneId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getScenesByGameId(gameId: GameId): Promise<Scene[]> {
    try {
      return await this.scenes.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async savePassage(passage: Passage): Promise<ComponentId> {
    if (!passage.sceneId)
      throw new Error('Unable to save passage to databse. Missing scene ID.')
    if (!passage.id)
      throw new Error('Unable to save passage to database. Missing ID.')

    try {
      await this.transaction('rw', this.passages, async () => {
        if (passage.id) {
          if (await this.getComponent(LIBRARY_TABLE.PASSAGES, passage.id)) {
            await this.passages.update(passage.id, passage)
          } else {
            await this.passages.add(passage)
          }
        } else {
          throw new Error('Unable to save passage to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return passage.id
  }

  public async removePassage(passageId: ComponentId) {
    try {
      await this.transaction('rw', this.passages, async () => {
        if (await this.getComponent(LIBRARY_TABLE.PASSAGES, passageId)) {
          await this.passages.delete(passageId)
        } else {
          throw new Error(
            `Unable to remove scene with ID: '${passageId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getPassagesByGameId(gameId: GameId): Promise<Passage[]> {
    try {
      return await this.passages.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }
}
