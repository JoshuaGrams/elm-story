import { Chapter, COMPONENT_TYPE, Game, Passage, Scene } from '../data/types'

import { TreeData } from '@atlaskit/tree'

const createGameOutlineTreeData = (
  game: Game,
  chapters: Chapter[],
  scenes: Scene[],
  passages: Passage[]
): TreeData => {
  if (game.id) {
    const gameOutlineTreeData: TreeData = {
      rootId: game.id,
      items: {}
    }

    gameOutlineTreeData.items[game.id] = {
      id: game.id,
      children: chapters
        .map((chapter) => chapter.id)
        .filter((chapterId): chapterId is string => !!chapterId),
      hasChildren: chapters.length > 0,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: game.title,
        type: COMPONENT_TYPE.GAME,
        selected: false,
        parentId: undefined,
        renaming: false
      }
    }

    chapters.map((chapter) => {
      if (chapter.id) {
        gameOutlineTreeData.items[chapter.id] = {
          id: chapter.id,
          children: scenes
            .map((scene) =>
              scene.chapterId === chapter.id ? scene.id : undefined
            )
            .filter((sceneId): sceneId is string => !!sceneId),
          hasChildren: false,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: chapter.title,
            type: COMPONENT_TYPE.CHAPTER,
            selected: false,
            parentId: game.id,
            renaming: false
          }
        }

        gameOutlineTreeData.items[chapter.id].hasChildren =
          gameOutlineTreeData.items[chapter.id].children.length > 0
      }
    })

    scenes.map((scene) => {
      if (scene.id) {
        gameOutlineTreeData.items[scene.id] = {
          id: scene.id,
          children: passages
            .map((passage) =>
              passage.sceneId === scene.id ? passage.id : undefined
            )
            .filter((passageId): passageId is string => !!passageId),
          hasChildren: false,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: scene.title,
            type: COMPONENT_TYPE.SCENE,
            selected: false,
            parentId: scene.chapterId,
            renaming: false
          }
        }

        gameOutlineTreeData.items[scene.id].hasChildren =
          gameOutlineTreeData.items[scene.id].children.length > 0
      }
    })

    passages.map((passage) => {
      if (passage.id) {
        gameOutlineTreeData.items[passage.id] = {
          id: passage.id,
          children: [],
          hasChildren: false,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: passage.title,
            type: COMPONENT_TYPE.PASSAGE,
            selected: false,
            parentId: passage.sceneId,
            renaming: false
          }
        }
      }
    })

    return gameOutlineTreeData
  } else {
    throw new Error('Unable to create game outline tree data. Missing game ID.')
  }
}

export default createGameOutlineTreeData
