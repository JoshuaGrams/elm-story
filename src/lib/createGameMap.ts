/**
 * Transform ESG into denormalized map
 */

import {
  Chapter,
  ComponentId,
  COMPONENT_TYPE,
  Game,
  Passage,
  Scene
} from '../data/types'

export interface GameMap {
  [componentId: string]: {
    type: COMPONENT_TYPE
    title: string
    parentId?: ComponentId
  }
}

const createGampMap = (
  game: Game,
  chapters: Chapter[],
  scenes: Scene[],
  passages: Passage[]
): GameMap => {
  const gameMap: GameMap = {}

  if (game.id) {
    gameMap[game.id] = {
      type: COMPONENT_TYPE.GAME,
      title: game.title
    }
  } else {
    throw new Error('Unable to create game map. Missing game ID.')
  }

  chapters.map((chapter) => {
    if (chapter.id) {
      gameMap[chapter.id] = {
        type: COMPONENT_TYPE.CHAPTER,
        title: chapter.title
      }
    }
  })

  scenes.map((scene) => {
    if (scene.id) {
      gameMap[scene.id] = {
        type: COMPONENT_TYPE.SCENE,
        title: scene.title,
        parentId: scene.chapterId
      }
    }
  })

  passages.map((passage) => {
    if (passage.id) {
      gameMap[passage.id] = {
        type: COMPONENT_TYPE.PASSAGE,
        title: passage.title,
        parentId: passage.sceneId
      }
    }
  })

  return gameMap
}

export default createGampMap
