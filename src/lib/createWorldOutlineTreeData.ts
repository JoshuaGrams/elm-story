import { ELEMENT_TYPE, Folder, World, Event, Scene, Jump } from '../data/types'

import { TreeData } from '@atlaskit/tree'

const createWorldOutlineTreeData = (
  game: World,
  folders: Folder[],
  scenes: Scene[],
  events: Event[],
  jumps: Jump[]
): TreeData => {
  if (game.id) {
    const worldOutlineTreeData: TreeData = {
      rootId: game.id,
      items: {}
    }

    worldOutlineTreeData.items[game.id] = {
      id: game.id,
      children: game.children.map((child) => child[1]),
      hasChildren: game.children.length > 0,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: game.title,
        type: ELEMENT_TYPE.WORLD,
        selected: false,
        parentId: undefined,
        renaming: false
      }
    }

    folders.map((folder) => {
      if (folder.id) {
        worldOutlineTreeData.items[folder.id] = {
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

        worldOutlineTreeData.items[folder.id].hasChildren =
          worldOutlineTreeData.items[folder.id].children.length > 0
      }
    })

    scenes.map((scene) => {
      if (scene.id) {
        worldOutlineTreeData.items[scene.id] = {
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

        worldOutlineTreeData.items[scene.id].hasChildren =
          worldOutlineTreeData.items[scene.id].children.length > 0
      }
    })

    events.map((event) => {
      if (event.id) {
        worldOutlineTreeData.items[event.id] = {
          id: event.id,
          children: [],
          hasChildren: false,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: event.title,
            type: ELEMENT_TYPE.EVENT,
            selected: false,
            parentId: event.sceneId,
            renaming: false
          }
        }
      }
    })

    jumps.map((jump) => {
      if (jump.id) {
        worldOutlineTreeData.items[jump.id] = {
          id: jump.id,
          children: [],
          hasChildren: false,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: jump.title,
            type: ELEMENT_TYPE.JUMP,
            selected: false,
            parentId: jump.sceneId,
            renaming: false
          }
        }
      }
    })

    return worldOutlineTreeData
  } else {
    throw new Error(
      'Unable to create world outline tree data. Missing world ID.'
    )
  }
}

export default createWorldOutlineTreeData
