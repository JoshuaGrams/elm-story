import Dexie from 'dexie'
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

  public async docExists(table: APP_TABLE, id: ComponentId): Promise<boolean> {
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

  public async removeStudio(studioId: StudioId) {
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

  public async docExists(
    table: LIBRARY_TABLE,
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

    return game.id
  }

  public async removeGame(gameId: GameId) {
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

  public async saveChapter(chapter: Chapter): Promise<ComponentId> {
    if (!chapter.gameId)
      throw new Error('Unable to save chapter to databse. Missing game ID.')
    if (!chapter.id)
      throw new Error('Unable to save chapter to database. Missing ID.')

    try {
      await this.transaction('rw', this.chapters, async () => {
        if (chapter.id) {
          if (await this.docExists(LIBRARY_TABLE.CHAPTERS, chapter.id)) {
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
        if (await this.docExists(LIBRARY_TABLE.CHAPTERS, chapterId)) {
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

  public async saveScene(scene: Scene): Promise<ComponentId> {
    if (!scene.chapterId)
      throw new Error('Unable to save scene to databse. Missing chapter ID.')
    if (!scene.id)
      throw new Error('Unable to save scene to database. Missing ID.')

    try {
      await this.transaction('rw', this.scenes, async () => {
        if (scene.id) {
          if (await this.docExists(LIBRARY_TABLE.SCENES, scene.id)) {
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
        if (await this.docExists(LIBRARY_TABLE.SCENES, sceneId)) {
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

  public async savePassage(passage: Passage): Promise<ComponentId> {
    if (!passage.sceneId)
      throw new Error('Unable to save passage to databse. Missing scene ID.')
    if (!passage.id)
      throw new Error('Unable to save passage to database. Missing ID.')

    try {
      await this.transaction('rw', this.passages, async () => {
        if (passage.id) {
          if (await this.docExists(LIBRARY_TABLE.PASSAGES, passage.id)) {
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
        if (await this.docExists(LIBRARY_TABLE.PASSAGES, passageId)) {
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
}

// async function test() {
//   const chapterIds = ['chapter-1-id', 'chapter-3-id']

//   const chapters = await new LibraryDatabase(
//     '74966fb5-983b-4771-958f-586b168539c5'
//   ).chapters
//     .filter((chapter) => {
//       return chapter.id ? chapterIds.includes(chapter.id) : false
//     })
//     .toArray()

//   console.log(chapters)
// }

// test()

new LibraryDatabase('a62179d1-d1ba-4f35-91b2-951ab5d1e360').saveChapter({
  gameId: 'd9ca9b20-42b8-4579-8929-3b5c46adbb8e',
  id: 'chapter-1-id',
  tags: [],
  title: 'Chapter 1',
  updated: Date.now()
})

new LibraryDatabase('a62179d1-d1ba-4f35-91b2-951ab5d1e360').saveScene({
  gameId: 'd9ca9b20-42b8-4579-8929-3b5c46adbb8e',
  chapterId: 'chapter-1-id',
  id: 'scene-1-id',
  tags: [],
  title: 'Scene 1',
  updated: Date.now()
})

new LibraryDatabase('a62179d1-d1ba-4f35-91b2-951ab5d1e360').savePassage({
  gameId: 'd9ca9b20-42b8-4579-8929-3b5c46adbb8e',
  sceneId: 'scene-1-id',
  id: 'passage-1-id',
  tags: [],
  title: 'Passage 1',
  updated: Date.now(),
  content: ''
})

new LibraryDatabase('a62179d1-d1ba-4f35-91b2-951ab5d1e360').savePassage({
  gameId: 'd9ca9b20-42b8-4579-8929-3b5c46adbb8e',
  sceneId: 'scene-1-id',
  id: 'passage-3-id',
  tags: [],
  title: 'Passage 3',
  updated: Date.now(),
  content: ''
})
