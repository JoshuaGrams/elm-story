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
  Choice,
  Condition,
  Effect,
  Variable,
  Route,
  VARIABLE_TYPE,
  Jump,
  JumpRoute,
  SET_OPERATOR_TYPE,
  COMPARE_OPERATOR_TYPE
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
  JUMPS = 'jumps',
  CHAPTERS = 'chapters',
  SCENES = 'scenes',
  ROUTES = 'routes',
  EFFECTS = 'effects',
  PASSAGES = 'passages',
  CHOICES = 'choices',
  CONDITIONS = 'conditions',
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

  public async getStudio(studioId: StudioId): Promise<Studio | undefined> {
    try {
      return await this.studios.get(studioId)
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
  public jumps: Dexie.Table<Jump, string>
  public chapters: Dexie.Table<Chapter, string>
  public scenes: Dexie.Table<Scene, string>
  public routes: Dexie.Table<Route, string>
  public conditions: Dexie.Table<Condition, string>
  public effects: Dexie.Table<Effect, string>
  public passages: Dexie.Table<Passage, string>
  public choices: Dexie.Table<Choice, string>
  public variables: Dexie.Table<Variable, string>

  public constructor(studioId: string) {
    super(`${DATABASE.LIBRARY}-${studioId}`)

    this.version(1).stores({
      games: '&id,title,*tags,updated,template,director,version,engine',
      jumps: '&id,gameId,sceneId,title,*tags,updated,*route',
      chapters: '&id,gameId,title,*tags,updated',
      scenes: '&id,gameId,chapterId,title,*tags,updated',
      routes:
        '&id,gameId,sceneId,title,originId,choiceId,originType,destinationId,destinationType,*tags,updated',
      conditions: '&id,gameId,routeId,variableId,title,*tags,updated',
      effects: '&id,gameId,routeId,variableId,title,*tags,updated',
      passages: '&id,gameId,sceneId,title,*tags,updated',
      choices: '&id,gameId,passageId,title,*tags,updated',
      variables: '&id,gameId,title,type,*tags,updated'
    })

    this.version(2)
      .stores({
        games: '&id,title,*tags,updated,template,designer,version,engine',
        variables: '&id,gameId,title,type,*tags,updated'
      })
      .upgrade((tx) => {
        tx.table('games')
          .toCollection()
          .modify((game) => {
            game.designer = game.director
            delete game.director
          })

        tx.table('variables')
          .toCollection()
          .modify((variable) => {
            variable.initialValue = variable.defaultValue
            delete variable.defaultValue
          })
      })

    this.tables.map((table) => table.name)

    this.games = this.table(LIBRARY_TABLE.GAMES)
    this.jumps = this.table(LIBRARY_TABLE.JUMPS)
    this.chapters = this.table(LIBRARY_TABLE.CHAPTERS)
    this.scenes = this.table(LIBRARY_TABLE.SCENES)
    this.routes = this.table(LIBRARY_TABLE.ROUTES)
    this.conditions = this.table(LIBRARY_TABLE.CONDITIONS)
    this.effects = this.table(LIBRARY_TABLE.EFFECTS)
    this.passages = this.table(LIBRARY_TABLE.PASSAGES)
    this.choices = this.table(LIBRARY_TABLE.CHOICES)
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

  public async getComponentsByGameRef(gameId: GameId, table: LIBRARY_TABLE) {
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
      const game = await this.games.get(gameId)

      if (game) {
        return game
      } else {
        throw new Error(
          `Unable to get game with ID: ${gameId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveGame(game: Game): Promise<Game> {
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

    return game
  }

  public async saveChapterRefsToGame(gameId: GameId, chapters: ComponentId[]) {
    try {
      await this.transaction('rw', this.games, async () => {
        if (gameId) {
          const game = await this.getComponent(LIBRARY_TABLE.GAMES, gameId)

          if (game) {
            this.games.update(gameId, { ...game, chapters })
          } else {
            throw new Error('Unable to save chapter refs. Game missing.')
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveJumpRefToGame(gameId: GameId, jumpId: ComponentId | null) {
    try {
      await this.transaction('rw', this.games, async () => {
        if (gameId) {
          const game = await this.getComponent(LIBRARY_TABLE.GAMES, gameId)

          if (game) {
            this.games.update(gameId, { ...game, jump: jumpId })
          } else {
            throw new Error('Unable to save jump ref. Game missing.')
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeGame(gameId: GameId) {
    if (!gameId) throw new Error('Unable to remove game. Missing ID.')

    try {
      const jumps = await this.jumps.where({ gameId }).toArray(),
        chapters = await this.chapters.where({ gameId }).toArray(),
        scenes = await this.scenes.where({ gameId }).toArray(),
        passages = await this.passages.where({ gameId }).toArray(),
        routes = await this.routes.where({ gameId }).toArray(),
        conditions = await this.conditions.where({ gameId }).toArray(),
        effects = await this.effects.where({ gameId }).toArray(),
        choices = await this.choices.where({ gameId }).toArray(),
        variables = await this.variables.where({ gameId }).toArray()

      logger.info(`Removing game with ID: ${gameId}`)
      logger.info(`JUMPS: Removing ${jumps.length}...`)
      logger.info(`CHAPTERS: Removing ${chapters.length}...`)
      logger.info(`SCENES: Removing ${scenes.length}...`)
      logger.info(`PASSAGES: Removing ${passages.length}...`)
      logger.info(`ROUTES: Remove ${routes.length}...`)
      logger.info(`ROUTE CONDITIONS: Remove ${conditions.length}...`)
      logger.info(`ROUTE EFFECTS: Remove ${effects.length}...`)
      logger.info(`CHOICES: Removing ${choices.length}...`)
      logger.info(`VARIABLES: Removing ${variables.length}...`)

      // TODO: replace 'delete' method with methods that handle children
      await Promise.all([
        jumps.map(async (jump) => {
          if (jump.id) await this.jumps.delete(jump.id)
        }),
        chapters.map(async (chapter) => {
          if (chapter.id) await this.chapters.delete(chapter.id)
        }),
        scenes.map(async (scene) => {
          if (scene.id) await this.scenes.delete(scene.id)
        }),
        passages.map(async (passage) => {
          if (passage.id) await this.passages.delete(passage.id)
        }),
        routes.map(async (route) => {
          if (route.id) await this.routes.delete(route.id)
        }),
        conditions.map(async (condition) => {
          if (condition.id) await this.conditions.delete(condition.id)
        }),
        effects.map(async (effect) => {
          if (effect.id) await this.effects.delete(effect.id)
        }),
        choices.map(async (passage) => {
          if (passage.id) await this.choices.delete(passage.id)
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

  public async getJump(jumpId: ComponentId): Promise<Jump> {
    try {
      const jump = await this.jumps.get(jumpId)

      if (jump) {
        return jump
      } else {
        throw new Error(
          `Unable to get jump with ID: ${jumpId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getJumpsByGameRef(gameId: GameId): Promise<Jump[]> {
    try {
      return await this.jumps.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveJump(jump: Jump): Promise<Jump> {
    if (!jump.gameId)
      throw new Error('Unable to save jump to database. Missing game ID.')
    if (!jump.id)
      throw new Error('Unable to save jump to database. Missing ID.')

    try {
      await this.transaction('rw', this.jumps, async () => {
        if (jump.id) {
          if (await this.getComponent(LIBRARY_TABLE.JUMPS, jump.id)) {
            await this.jumps.update(jump.id, jump)
          } else {
            await this.jumps.add(jump)
          }
        } else {
          throw new Error('Unable to save jump to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return jump
  }

  public async saveJumpRoute(jumpId: ComponentId, route: JumpRoute) {
    logger.info(
      `LibraryDatabase->saveJumpRoute->jumpId: ${jumpId} route: ${route}`
    )

    try {
      await this.transaction('rw', this.jumps, async () => {
        if (jumpId) {
          const jump = await this.getComponent(LIBRARY_TABLE.JUMPS, jumpId)

          if (jump) {
            this.jumps.update(jumpId, { ...jump, route })
          } else {
            throw new Error('Unable to save jump route. Jump missing.')
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeJump(jumpId: ComponentId) {
    logger.info(`LibraryDatabase->removeJump:${jumpId}`)

    const routes = await this.routes.where({ destinationId: jumpId }).toArray()

    if (routes.length > 0) {
      logger.info(
        `removeJump->Removing ${routes.length} route(s) from jump with ID: ${jumpId}`
      )
    }

    await Promise.all(
      routes.map(
        async (route) => route.id && (await this.removeRoute(route.id))
      )
    )

    try {
      await this.transaction('rw', this.jumps, async () => {
        if (await this.getComponent(LIBRARY_TABLE.JUMPS, jumpId)) {
          logger.info(
            `LibraryDatabase->removeJump->Removing jump with ID: ${jumpId}`
          )

          await this.jumps.delete(jumpId)
        } else {
          // TODO: WHY
          logger.error(
            `LibraryDatabase->removeJump->Unable to remove jump with ID: '${jumpId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getJumpsBySceneRef(sceneId: ComponentId): Promise<Jump[]> {
    try {
      return await this.jumps.where({ route: sceneId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getJumpsByPassageRef(passageId: ComponentId): Promise<Jump[]> {
    try {
      return await this.jumps.where({ route: passageId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getChapter(chapterId: ComponentId): Promise<Chapter> {
    try {
      const chapter = await this.chapters.get(chapterId)

      if (chapter) {
        return chapter
      } else {
        throw new Error(
          `Unable to get chapter with ID: ${chapterId}. Does not exist.`
        )
      }
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

  public async saveSceneRefsToChapter(
    chapterId: ComponentId,
    scenes: ComponentId[]
  ) {
    try {
      await this.transaction('rw', this.chapters, async () => {
        if (chapterId) {
          const chapter = await this.getComponent(
            LIBRARY_TABLE.CHAPTERS,
            chapterId
          )

          if (chapter) {
            this.chapters.update(chapterId, { ...chapter, scenes })
          } else {
            throw new Error('Unable to save scene refs. Chapter missing.')
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeChapter(chapterId: ComponentId) {
    try {
      const jumps = await this.jumps.where({ route: chapterId }).toArray(),
        scenes = await this.scenes.where({ chapterId }).toArray()

      if (jumps.length > 0) {
        logger.info(
          `LibraryDatabase->removeChapter->Updating ${jumps.length} jumps(s) from chapter with ID: ${chapterId}`
        )
      }

      await Promise.all(
        jumps.map(async (jump) => jump.id && (await this.removeJump(jump.id)))
      )

      if (scenes.length > 0) {
        logger.info(
          `removeChapter->Removing ${scenes.length} scene(s) from chapter with ID: ${chapterId}`
        )
      }

      await Promise.all(
        scenes.map(async (scene) => {
          if (scene.id) {
            const passages = await this.passages
              .where({ sceneId: scene.id })
              .toArray()

            if (passages.length > 0) {
              logger.info(
                `removeChapter->Removing ${passages.length} passage(s) from scene with ID: ${scene.id}`
              )
            }

            await Promise.all(
              passages.map(
                async (passage) =>
                  passage.id && (await this.removePassage(passage.id))
              )
            )

            await this.scenes.delete(scene.id)
          }
        })
      )

      await this.transaction('rw', this.chapters, async () => {
        if (await this.getComponent(LIBRARY_TABLE.CHAPTERS, chapterId)) {
          logger.info(`Removing chapter with ID: ${chapterId}`)

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

  public async getChaptersByGameRef(gameId: GameId): Promise<Chapter[]> {
    try {
      return await this.chapters.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getSceneRefsByChapterRef(
    chapterId: ComponentId
  ): Promise<ComponentId[]> {
    try {
      const chapter = await this.chapters.where({ id: chapterId }).first()

      if (chapter) {
        return chapter.scenes
      } else {
        throw new Error('Chapter not found.')
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getScene(sceneId: ComponentId): Promise<Scene> {
    try {
      const scene = await this.scenes.get(sceneId)

      if (scene) {
        return scene
      } else {
        throw new Error(
          `Unable to get scene with ID: ${sceneId}. Does not exist.`
        )
      }
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

  public async saveChapterRefToScene(
    chapterId: ComponentId,
    sceneId: ComponentId
  ) {
    try {
      const scene = await this.getComponent(LIBRARY_TABLE.SCENES, sceneId)

      if (scene && scene.id) {
        await this.scenes.update(scene.id, { ...scene, chapterId })
      } else {
        throw new Error('Unable to save chapter ID. Missing scene.')
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async savePassageRefsToScene(
    sceneId: ComponentId,
    passages: ComponentId[]
  ) {
    try {
      await this.transaction('rw', this.scenes, async () => {
        if (sceneId) {
          const scene = await this.getComponent(LIBRARY_TABLE.SCENES, sceneId)

          if (scene) {
            this.scenes.update(sceneId, { ...scene, passages })
          } else {
            throw new Error('Unable to save passage refs. Scene missing.')
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveJumpRefsToScene(sceneId: ComponentId, jumps: ComponentId[]) {
    try {
      await this.transaction('rw', this.scenes, async () => {
        if (sceneId) {
          const scene = await this.getComponent(LIBRARY_TABLE.SCENES, sceneId)

          if (scene) {
            this.scenes.update(sceneId, { ...scene, jumps })
          } else {
            throw new Error('Unable to save jump refs. Scene missing.')
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveSceneViewTransform(
    sceneId: ComponentId,
    transform: { x: number; y: number; zoom: number }
  ) {
    try {
      await this.transaction('rw', this.scenes, async () => {
        if (sceneId) {
          const scene = await this.getComponent(LIBRARY_TABLE.SCENES, sceneId)

          if (scene) {
            this.scenes.update(sceneId, {
              ...scene,
              editor: {
                componentEditorTransformX: transform.x,
                componentEditorTransformY: transform.y,
                componentEditorTransformZoom: transform.zoom
              }
            })
          } else {
            throw new Error(
              `Unable to save scene view transform. Scene missing.`
            )
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeScene(sceneId: ComponentId) {
    logger.info(`LibraryDatabase->removeScene`)

    try {
      const scene = await this.scenes.get(sceneId)

      scene?.jumps &&
        logger.info(
          `LibraryDatabase->removeScene->Removing ${scene.jumps.length}jump(s) from scene with ID: ${sceneId}`
        ) &&
        (await Promise.all(
          scene.jumps.map(async (jumpId) => await this.removeJump(jumpId))
        ))

      const jumpsRefScene = await this.jumps
          .where({ route: sceneId })
          .toArray(),
        passages = await this.passages.where({ sceneId }).toArray()

      if (jumpsRefScene.length > 0) {
        logger.info(
          `LibraryDatabase->removeScene->Updating ${jumpsRefScene.length} jumpsRefScene(s) from scene with ID: ${sceneId}`
        )
      }

      await Promise.all(
        jumpsRefScene.map(
          async (jump) =>
            jump.id && (await this.saveJumpRoute(jump.id, [jump.route[0]]))
        )
      )

      if (passages.length > 0) {
        logger.info(
          `LibraryDatabase->removeScene->Removing ${passages.length} passage(s) from scene with ID: ${sceneId}`
        )
      }

      await Promise.all(
        passages.map(
          async (passage) =>
            passage.id && (await this.removePassage(passage.id))
        )
      )

      await this.transaction('rw', this.scenes, async () => {
        if (await this.getComponent(LIBRARY_TABLE.SCENES, sceneId)) {
          logger.info(
            `LibraryDatabase->removeScene->Removing scene with ID: ${sceneId}`
          )

          await this.scenes.delete(sceneId)
        } else {
          throw new Error(
            `LibraryDatabase->removeScene->Unable to remove scene with ID: '${sceneId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getScenesByGameRef(gameId: GameId): Promise<Scene[]> {
    try {
      return await this.scenes.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getPassageRefsBySceneRef(
    sceneId: ComponentId
  ): Promise<ComponentId[]> {
    try {
      const scene = await this.scenes.where({ id: sceneId }).first()

      if (scene) {
        return scene.passages
      } else {
        throw new Error('Scene not found.')
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getRoute(routeId: ComponentId): Promise<Route> {
    try {
      const route = await this.routes.get(routeId)

      if (route) {
        return route
      } else {
        throw new Error(
          `Unable to get route with ID: ${routeId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getRoutesByGameRef(gameId: GameId): Promise<Route[]> {
    try {
      return await this.routes.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveRoute(route: Route): Promise<ComponentId> {
    if (!route.sceneId)
      throw new Error('Unable to save route to databse. Missing scene ID.')
    if (!route.id)
      throw new Error('Unable to save route to database. Missing ID.')

    try {
      await this.transaction('rw', this.routes, async () => {
        if (route.id) {
          if (await this.getComponent(LIBRARY_TABLE.ROUTES, route.id)) {
            await this.routes.update(route.id, route)
          } else {
            await this.routes.add(route)
          }
        } else {
          throw new Error('Unable to save route to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return route.id
  }

  public async removeRoute(routeId: ComponentId) {
    logger.info(`LibraryDatabase->removeRoute`)

    try {
      const conditions = await this.conditions.where({ routeId }).toArray(),
        effects = await this.effects.where({ routeId }).toArray()

      await Promise.all([
        conditions.map(
          async (condition) =>
            condition.id && (await this.removeCondition(condition.id))
        ),
        effects.map(
          async (effect) => effect.id && (await this.removeEffect(effect.id))
        )
      ])

      await this.transaction('rw', this.routes, async () => {
        if (await this.getComponent(LIBRARY_TABLE.ROUTES, routeId)) {
          logger.info(
            `LibraryDatabase->removeRoute->Removing route with ID: ${routeId}`
          )

          await this.routes.delete(routeId)
        } else {
          // TODO: #70; async issue - we can do things in order, but this is likely more efficent
          logger.error(
            `LibraryDatabase->removeRoute->Unable to remove route with ID: '${routeId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeRoutesByPassageRef(passageId: ComponentId) {
    logger.info(`LibraryDatabase->removeRoutesByPassageRef`)

    try {
      const originRoutes = await this.routes
          .where({ originId: passageId })
          .toArray(),
        destinationRoutes = await this.routes
          .where({ destinationId: passageId })
          .toArray()

      await Promise.all([
        originRoutes.map(
          async (originRoute) =>
            originRoute.id && (await this.removeRoute(originRoute.id))
        ),
        destinationRoutes.map(
          async (destinationRoute) =>
            destinationRoute.id && (await this.removeRoute(destinationRoute.id))
        )
      ])
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeRoutesByChoiceRef(choiceId: ComponentId) {
    try {
      const routes = await this.routes.where({ choiceId }).toArray()

      await Promise.all(
        routes.map(
          async (route) => route.id && (await this.removeRoute(route.id))
        )
      )
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getCondition(conditionId: ComponentId): Promise<Condition> {
    try {
      const condition = await this.conditions.get(conditionId)

      if (condition) {
        return condition
      } else {
        throw new Error(
          `Unable to get condition with ID: ${conditionId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getConditionsByGameRef(gameId: GameId): Promise<Condition[]> {
    try {
      return await this.conditions.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getConditionsByRouteRef(
    routeId: ComponentId,
    countOnly?: boolean
  ): Promise<number | Condition[]> {
    try {
      return countOnly
        ? await this.conditions.where({ routeId }).count()
        : await this.conditions.where({ routeId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getConditionsByVariableRef(
    variableId: ComponentId
  ): Promise<Condition[]> {
    try {
      return await this.conditions.where({ variableId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveCondition(condition: Condition): Promise<ComponentId> {
    if (!condition.routeId)
      throw new Error('Unable to save condition to databse. Missing route ID.')
    if (!condition.id)
      throw new Error('Unable to save condition to database. Missing ID.')

    try {
      await this.transaction('rw', this.conditions, async () => {
        if (condition.id) {
          if (await this.getComponent(LIBRARY_TABLE.CONDITIONS, condition.id)) {
            await this.conditions.update(condition.id, condition)
          } else {
            await this.conditions.add(condition)
          }
        } else {
          throw new Error('Unable to save condition to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return condition.id
  }

  public async saveConditionCompareOperatorType(
    condtionId: ComponentId,
    newCompareOperatorType: COMPARE_OPERATOR_TYPE
  ) {
    try {
      await this.transaction('rw', this.conditions, async () => {
        if (condtionId) {
          const condition = await this.conditions
            .where({ id: condtionId })
            .first()

          if (condition) {
            await this.conditions.update(condtionId, {
              ...condition,
              compare: [
                condition.compare[0],
                newCompareOperatorType,
                condition.compare[2],
                condition.compare[3]
              ]
            })
          } else {
            throw new Error(
              'Unable to set condition compare operator type. Component missing.'
            )
          }
        } else {
          throw new Error(
            'Unable to set condition compare operator type. Missing ID.'
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveConditionValue(conditionId: ComponentId, newValue: string) {
    try {
      await this.transaction('rw', this.conditions, async () => {
        if (conditionId) {
          const condition = await this.conditions
            .where({ id: conditionId })
            .first()

          if (condition) {
            await this.conditions.update(conditionId, {
              ...condition,
              compare: [
                condition.compare[0],
                condition.compare[1],
                newValue,
                condition.compare[3]
              ]
            })
          } else {
            throw new Error('Unable to set condition value. Component missing.')
          }
        } else {
          throw new Error('Unable to set condition value. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeCondition(conditionId: ComponentId) {
    logger.info(`LibraryDatabase->removeCondition`)

    try {
      await this.transaction('rw', this.conditions, async () => {
        if (await this.getComponent(LIBRARY_TABLE.CONDITIONS, conditionId)) {
          logger.info(
            `LibraryDatabase->removeCondition->Removing condition with ID: ${conditionId}`
          )

          await this.conditions.delete(conditionId)
        } else {
          // TODO: #70; async issue - we can do things in order, but this is likely more efficent
          logger.error(
            `LibraryDatabase->removeCondition->Unable to remove condition with ID: '${conditionId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getEffect(effectId: ComponentId): Promise<Effect> {
    try {
      const effect = await this.effects.get(effectId)

      if (effect) {
        return effect
      } else {
        throw new Error(
          `Unable to get effect with ID: ${effectId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getEffectsByGameRef(gameId: GameId): Promise<Effect[]> {
    try {
      return await this.effects.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getEffectsByRouteRef(
    routeId: ComponentId,
    countOnly?: boolean
  ): Promise<number | Effect[]> {
    try {
      return countOnly
        ? await this.effects.where({ routeId }).count()
        : await this.effects.where({ routeId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getEffectsByVariableRef(
    variableId: ComponentId
  ): Promise<Effect[]> {
    try {
      return await this.effects.where({ variableId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveEffect(effect: Effect): Promise<ComponentId> {
    if (!effect.routeId)
      throw new Error('Unable to save effect to databse. Missing route ID.')
    if (!effect.id)
      throw new Error('Unable to save effect to database. Missing ID.')

    try {
      await this.transaction('rw', this.effects, async () => {
        if (effect.id) {
          if (await this.getComponent(LIBRARY_TABLE.EFFECTS, effect.id)) {
            await this.effects.update(effect.id, effect)
          } else {
            await this.effects.add(effect)
          }
        } else {
          throw new Error('Unable to save effect to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return effect.id
  }

  public async saveEffectSetOperatorType(
    effectId: ComponentId,
    newSetOperatorType: SET_OPERATOR_TYPE
  ) {
    try {
      await this.transaction('rw', this.effects, async () => {
        if (effectId) {
          const effect = await this.effects.where({ id: effectId }).first()

          if (effect) {
            await this.effects.update(effectId, {
              ...effect,
              set: [effect.set[0], newSetOperatorType, effect.set[2]]
            })
          } else {
            throw new Error(
              'Unable to set effect set operator type. Component missing.'
            )
          }
        } else {
          throw new Error('Unable to set effect set operator type. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveEffectValue(effectId: ComponentId, newValue: string) {
    try {
      await this.transaction('rw', this.effects, async () => {
        if (effectId) {
          const effect = await this.effects.where({ id: effectId }).first()

          if (effect) {
            await this.effects.update(effectId, {
              ...effect,
              set: [effect.set[0], effect.set[1], newValue]
            })
          } else {
            throw new Error('Unable to set effect value. Component missing.')
          }
        } else {
          throw new Error('Unable to set effect value. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removeEffect(effectId: ComponentId) {
    logger.info(`LibraryDatabase->removeEffect`)

    try {
      await this.transaction('rw', this.effects, async () => {
        if (await this.getComponent(LIBRARY_TABLE.EFFECTS, effectId)) {
          logger.info(
            `LibraryDatabase->removeEffect->Removing effect with ID: ${effectId}`
          )

          await this.effects.delete(effectId)
        } else {
          // TODO: #70; async issue - we can do things in order, but this is likely more efficent
          logger.error(
            `LibraryDatabase->removeEffect->Unable to remove effect with ID: '${effectId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getPassage(passageId: ComponentId): Promise<Passage> {
    try {
      const passage = await this.passages.get(passageId)

      if (passage) {
        return passage
      } else {
        throw new Error(
          `Unable to get passage with ID: ${passageId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async savePassage(passage: Passage): Promise<Passage> {
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

    return passage
  }

  public async savePassageContent(passageId: ComponentId, content: string) {
    try {
      await this.transaction('rw', this.passages, async () => {
        if (passageId) {
          const component = await this.getComponent(
            LIBRARY_TABLE.PASSAGES,
            passageId
          )

          if (component) {
            await this.passages.update(passageId, { ...component, content })
          } else {
            throw new Error(
              'Unable to save content to passage. Passage missing.'
            )
          }
        } else {
          throw new Error('Unable to save content to passage. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveSceneRefToPassage(
    sceneId: ComponentId,
    passageId: ComponentId
  ) {
    logger.info(
      `LibraryDatabase->saveSceneRefToPassage->scene: ${sceneId}->passage: ${passageId}`
    )

    try {
      const passage = await this.getComponent(LIBRARY_TABLE.PASSAGES, passageId)

      if (passage && passage.id) {
        await this.passages.update(passage.id, { ...passage, sceneId })
      } else {
        throw new Error('Unable to save scene ID. Missing passage.')
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveChoiceRefsToPassage(
    passageId: ComponentId,
    choices: ComponentId[]
  ) {
    try {
      await this.transaction('rw', this.passages, async () => {
        if (passageId) {
          const passage = await this.getComponent(
            LIBRARY_TABLE.PASSAGES,
            passageId
          )

          if (passage) {
            this.passages.update(passageId, { ...passage, choices })
          } else {
            throw new Error('Unable to save choice refs. Passage missing.')
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async removePassage(passageId: ComponentId) {
    try {
      logger.info('LibraryDatabase->removePassage')

      const jumps = await this.jumps.where({ route: passageId }).toArray(),
        routes = await this.routes
          .where({ destinationId: passageId })
          .toArray(),
        choices = await this.choices.where({ passageId }).toArray()

      if (routes.length > 0) {
        logger.info(
          `LibraryDatabase->removePassage->Updating ${jumps.length} jump(s) from passage with ID: ${passageId}`
        )
      }

      await Promise.all(
        jumps.map(
          async (jump) =>
            jump.id &&
            (await this.saveJumpRoute(jump.id, [jump.route[0], jump.route[1]]))
        )
      )

      if (routes.length > 0) {
        logger.info(
          `LibraryDatabase->removePassage->Removing ${routes.length} route(s) from passage with ID: ${passageId}`
        )
      }

      await Promise.all(
        routes.map(
          async (route) => route.id && (await this.removeRoute(route.id))
        )
      )

      if (choices.length > 0) {
        logger.info(
          `LibraryDatabase->removePassage->Removing ${choices.length} choice(s) from passage with ID: ${passageId}`
        )
      }

      await Promise.all(
        choices.map(
          async (choice) => choice.id && (await this.removeChoice(choice.id))
        )
      )

      await this.transaction('rw', this.passages, async () => {
        if (await this.getComponent(LIBRARY_TABLE.PASSAGES, passageId)) {
          logger.info(
            `LibraryDatabase->removePassage->Removing passage with ID: ${passageId}`
          )

          await this.passages.delete(passageId)
        } else {
          throw new Error(
            `LibraryDatabase->removePassage->Unable to remove passage with ID: '${passageId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getPassagesByGameRef(gameId: GameId): Promise<Passage[]> {
    try {
      return await this.passages.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getChoice(choiceId: ComponentId): Promise<Choice> {
    logger.info(`LibraryDatabase->getChoice`)

    try {
      const choice = await this.choices.get(choiceId)

      if (choice) {
        return choice
      } else {
        throw new Error(
          `LibraryDatabase->getChoice->Unable to get choice with ID: ${choiceId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getChoicesByGameRef(gameId: GameId): Promise<Choice[]> {
    try {
      return await this.choices.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveChoice(choice: Choice): Promise<Choice> {
    if (!choice.gameId)
      throw new Error('Unable to save choice to database. Missing game ID.')
    if (!choice.passageId)
      throw new Error('Unable to save choice to database. Missing passage ID.')
    if (!choice.id)
      throw new Error('Unable to save choice to database. Missing ID.')

    try {
      await this.transaction('rw', this.choices, async () => {
        if (choice.id) {
          if (await this.getComponent(LIBRARY_TABLE.CHOICES, choice.id)) {
            await this.choices.update(choice.id, choice)
          } else {
            await this.choices.add(choice)
          }
        } else {
          throw new Error('Unable to save choice to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return choice
  }

  public async removeChoice(choiceId: ComponentId) {
    try {
      const routes = await this.routes.where({ choiceId }).toArray()

      if (routes.length > 0) {
        logger.info(
          `removeChoice->Removing ${routes.length} route(s) from choice with ID: ${choiceId}`
        )
      }

      await Promise.all(
        routes.map(
          async (route) => route.id && (await this.removeRoute(route.id))
        )
      )

      await this.transaction('rw', this.choices, async () => {
        if (await this.getComponent(LIBRARY_TABLE.CHOICES, choiceId)) {
          logger.info(`removeChoice->Removing choice with ID: ${choiceId}`)

          await this.choices.delete(choiceId)
        } else {
          throw new Error(
            `removeChoice->Unable to remove choice with ID: '${choiceId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getVariable(variableId: ComponentId): Promise<Variable> {
    try {
      const variable = await this.variables.get(variableId)

      if (variable) {
        return variable
      } else {
        throw new Error(
          `Unable to get variable with ID: ${variableId}. Does not exist.`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  public async getVariablesByGameRef(gameId: GameId): Promise<Variable[]> {
    try {
      return await this.variables.where({ gameId }).toArray()
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveVariable(variable: Variable): Promise<ComponentId> {
    if (!variable.gameId)
      throw new Error('Unable to save variable to databse. Missing game ID.')
    if (!variable.id)
      throw new Error('Unable to save variable to database. Missing ID.')

    try {
      await this.transaction('rw', this.variables, async () => {
        if (variable.id) {
          if (await this.getComponent(LIBRARY_TABLE.VARIABLES, variable.id)) {
            await this.variables.update(variable.id, variable)
          } else {
            await this.variables.add(variable)
          }
        } else {
          throw new Error('Unable to save variable to database. Missing ID.')
        }
      })
    } catch (error) {
      throw new Error(error)
    }

    return variable.id
  }

  public async removeVariable(variableId: ComponentId) {
    logger.info(`LibraryDatabase->removeVariable:${variableId}`)

    try {
      const conditions = await this.conditions.where({ variableId }).toArray(),
        effects = await this.effects.where({ variableId }).toArray()

      await Promise.all([
        conditions.map(
          async (condition) =>
            condition.id && (await this.removeCondition(condition.id))
        ),
        effects.map(
          async (effect) => effect.id && (await this.removeEffect(effect.id))
        )
      ])

      await this.transaction('rw', this.variables, async () => {
        if (await this.getComponent(LIBRARY_TABLE.VARIABLES, variableId)) {
          logger.info(
            `LibraryDatabase->removeVariable->Removing variable with ID: ${variableId}`
          )

          await this.variables.delete(variableId)
        } else {
          throw new Error(
            `LibraryDatabase->removeVariable->Unable to remove variable with ID: '${variableId}'. Does not exist.`
          )
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  public async saveVariableType(variableId: ComponentId, type: VARIABLE_TYPE) {
    await this.transaction('rw', this.variables, async () => {
      if (variableId) {
        const component = await this.getComponent(
          LIBRARY_TABLE.VARIABLES,
          variableId
        )

        if (component) {
          await this.variables.update(variableId, {
            ...component,
            type,
            initialValue: type === VARIABLE_TYPE.BOOLEAN ? 'false' : ''
          })
        } else {
          throw new Error('Unable to save variable type. Variable missing.')
        }
      } else {
        throw new Error('Unable to save variable type. Missing ID.')
      }
    })
  }

  public async saveVariableDefaultValue(
    variableId: ComponentId,
    initialValue: string
  ) {
    await this.transaction('rw', this.variables, async () => {
      if (variableId) {
        const component = await this.getComponent(
          LIBRARY_TABLE.VARIABLES,
          variableId
        )

        if (component) {
          await this.variables.update(variableId, {
            ...component,
            initialValue
          })
        } else {
          throw new Error(
            'Unable to save variable initialValue. Variable missing.'
          )
        }
      } else {
        throw new Error('Unable to save variable initialValue. Missing ID.')
      }
    })
  }
}
