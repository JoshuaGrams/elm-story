import { ELEMENT_TYPE, Folder, World, Event, Scene } from '../data/types'

import { TreeData } from '@atlaskit/tree'

const createGameOutlineTreeData = (
  game: World,
  folders: Folder[],
  scenes: Scene[],
  passages: Event[]
): TreeData => {
  if (game.id) {
    const gameOutlineTreeData: TreeData = {
      rootId: game.id,
      items: {}
    }

    gameOutlineTreeData.items[game.id] = {
      id: game.id,
      children: game.children.map((child) => child[1]),
      hasChildren: game.children.length > 0,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: game.title,
        type: ELEMENT_TYPE.GAME,
        selected: false,
        parentId: undefined,
        renaming: false
      }
    }

    folders.map((folder) => {
      if (folder.id) {
        gameOutlineTreeData.items[folder.id] = {
          id: folder.id,
          children: folder.children.map((child) => child[1]),
          hasChildren: false,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: folder.title,
            type: ELEMENT_TYPE.FOLDER,
            selected: false,
            parentId: game.id,
            renaming: false
          }
        }

        gameOutlineTreeData.items[folder.id].hasChildren =
          gameOutlineTreeData.items[folder.id].children.length > 0
      }
    })

    scenes.map((scene) => {
      if (scene.id) {
        gameOutlineTreeData.items[scene.id] = {
          id: scene.id,
          children: scene.children.map((child) => child[1]),
          hasChildren: false,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: scene.title,
            type: ELEMENT_TYPE.SCENE,
            selected: false,
            parentId: scene.parent[1] || game.id,
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
            type: ELEMENT_TYPE.PASSAGE,
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
