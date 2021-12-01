import logger from '../../lib/logger'
import { cloneDeep } from 'lodash-es'
import createGameOutlineTreeData from '../../lib/createGameOutlineTreeData'

import React, { useContext, useEffect, useState } from 'react'

import {
  ElementId,
  ELEMENT_TYPE,
  DEFAULT_EVENT_CONTENT,
  World,
  EVENT_TYPE,
  SceneChildRefs,
  StudioId
} from '../../data/types'
import { DEFAULT_NODE_SIZE } from '../ElementEditor/SceneMap'

import { ComposerContext, COMPOSER_ACTION_TYPE } from '../../contexts/ComposerContext'

import Tree, {
  mutateTree,
  moveItemOnTree,
  TreeData,
  RenderItemParams,
  TreeSourcePosition,
  TreeDestinationPosition,
  ItemId,
  TreeItem
} from '@atlaskit/tree'
import { Button } from 'antd'

import TitleBar from './TitleBar'
import ElementItem from './ElementItem'

import styles from './styles.module.less'

import api from '../../api'

// TODO: build type for item.data
// { title, type, selected, parentId, renaming }

export type OnSelectElement = (elementId: ElementId) => void
export type OnAddElement = (
  parentComponentId: ElementId,
  childType: ELEMENT_TYPE
) => void
export type OnRemoveElement = (elementId: ElementId) => void
export type OnEditElementTitle = (
  elementId: ElementId,
  title: string | undefined,
  complete: boolean | false
) => void

const addItemToTree = (
  treeData: TreeData,
  parentId: ElementId,
  item: TreeItem
): TreeData => {
  const clonedTree = cloneDeep(treeData),
    parentItem = clonedTree.items[parentId]

  if (!parentItem.children.includes(item.id)) {
    parentItem.children.push(item.id)

    if (!parentItem.isExpanded) parentItem.isExpanded = true

    clonedTree.items[item.id] = item

    return clonedTree
  } else {
    throw new Error('Unable to add item to tree. Child already exists.')
  }
}

const removeItemFromTree = (
  treeData: TreeData,
  itemId: ElementId
): TreeData => {
  const clonedTree = cloneDeep(treeData),
    itemToRemove = clonedTree.items[itemId],
    parentId = itemToRemove.data.parentId || undefined,
    nestedChildrenToRemove: ItemId[] = []

  if (parentId) {
    const parentItem = clonedTree.items[parentId]

    if (parentItem.children.includes(itemToRemove.id)) {
      parentItem.children = parentItem.children.filter(
        (childId) => itemId !== childId
      )

      parentItem.hasChildren = parentItem.children.length > 0 ? true : false

      itemToRemove.children.map((sceneId) => {
        clonedTree.items[sceneId].children.map((eventId) =>
          nestedChildrenToRemove.push(eventId)
        )

        nestedChildrenToRemove.push(sceneId)
      })

      nestedChildrenToRemove.map((childId) => delete clonedTree.items[childId])
      delete clonedTree.items[itemId]

      return clonedTree
    } else {
      throw new Error('Unable to remove item from tree. Child does not exist.')
    }
  } else {
    throw new Error('Unable to remove item from tree. Missing parent ID.')
  }
}

const WorldOutline: React.FC<{ studioId: StudioId; world: World }> = ({
  studioId,
  world
}) => {
  const { composer: editor, composerDispatch: editorDispatch } = useContext(ComposerContext)

  const [treeData, setTreeData] = useState<TreeData | undefined>(undefined),
    [movingElementId, setMovingElementId] = useState<string | undefined>(
      undefined
    )

  function onExpand(itemId: React.ReactText) {
    if (treeData)
      setTreeData(mutateTree(treeData, itemId, { isExpanded: true }))
  }

  function onCollapse(itemId: React.ReactText) {
    if (treeData)
      setTreeData(mutateTree(treeData, itemId, { isExpanded: false }))
  }

  function onDragStart(itemId: React.ReactText) {
    logger.info(`WorldOutline->onDragStart->${itemId}`)

    if (treeData && editor.renamingWorldOutlineElement.id) {
      setTreeData(
        mutateTree(treeData, editor.renamingWorldOutlineElement.id, {
          data: {
            ...treeData.items[editor.renamingWorldOutlineElement.id].data,
            renaming: false
          }
        })
      )

      editorDispatch({
        type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_RENAME,
        renamingWorldOutlineElement: { id: undefined, renaming: false }
      })
    }

    setMovingElementId(itemId as string)
  }

  // TODO: this is a fucking nightmare lol
  async function onDragEnd(
    source: TreeSourcePosition,
    destination?: TreeDestinationPosition
  ) {
    if (!destination || !treeData) return

    const sourceParent = treeData.items[source.parentId],
      destinationParent = treeData.items[destination.parentId],
      movingElement = movingElementId && treeData.items[movingElementId]

    if (
      sourceParent.id === destinationParent.id &&
      source.index === destination.index
    )
      return

    if (
      movingElement &&
      (sourceParent.data.type === destinationParent.data.type ||
        // folder to game or folder
        (movingElement.data.type === ELEMENT_TYPE.FOLDER &&
          destinationParent.data.type === ELEMENT_TYPE.WORLD) ||
        (movingElement.data.type === ELEMENT_TYPE.FOLDER &&
          destinationParent.data.type === ELEMENT_TYPE.FOLDER) ||
        // scene to game or folder
        (movingElement.data.type === ELEMENT_TYPE.SCENE &&
          destinationParent.data.type === ELEMENT_TYPE.WORLD) ||
        (movingElement.data.type === ELEMENT_TYPE.SCENE &&
          destinationParent.data.type === ELEMENT_TYPE.FOLDER))
    ) {
      logger.info(
        `
          moving: ${movingElement.data.title}
          from: ${sourceParent.data.title} (index ${source.index})
          to: ${destinationParent.data.title} (index ${destination.index})
        `
      )

      const newTreeData = moveItemOnTree(treeData, source, destination)

      if (!destinationParent.isExpanded) destinationParent.isExpanded = true

      newTreeData.items[movingElement.id].data.parentId = destinationParent.id
      newTreeData.items[movingElement.id].data.selected =
        editor.selectedWorldOutlineElement.id === movingElement.id

      setTreeData(newTreeData)

      editor.selectedWorldOutlineElement.id === movingElement.id &&
        editorDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
          selectedWorldOutlineElement: {
            id: movingElement.id as string,
            expanded: movingElement.isExpanded || false,
            type: movingElement.data.type,
            title: movingElement.data.title
          }
        })

      if (world.id) {
        try {
          switch (movingElement.data.type) {
            case ELEMENT_TYPE.FOLDER:
              const folderPromises: Promise<void>[] = []

              if (
                sourceParent.data.type === ELEMENT_TYPE.WORLD ||
                destinationParent.data.type === ELEMENT_TYPE.WORLD
              ) {
                folderPromises.push(
                  api().worlds.saveChildRefsToWorld(
                    studioId,
                    world.id,
                    newTreeData.items[world.id].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ElementId
                    ])
                  )
                )
              }

              if (sourceParent.data.type === ELEMENT_TYPE.FOLDER) {
                folderPromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    sourceParent.id as ElementId,
                    newTreeData.items[
                      sourceParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ElementId
                    ])
                  )
                )
              }

              if (destinationParent.data.type === ELEMENT_TYPE.FOLDER) {
                folderPromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    destinationParent.id as ElementId,
                    newTreeData.items[
                      destinationParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ElementId
                    ])
                  )
                )
              }

              folderPromises.push(
                api().folders.saveParentRefToFolder(
                  studioId,
                  [
                    newTreeData.items[destinationParent.id].data.type,
                    newTreeData.items[destinationParent.id].data.type ===
                    ELEMENT_TYPE.WORLD
                      ? null
                      : (destinationParent.id as ElementId)
                  ],
                  movingElement.id as ElementId
                )
              )

              await Promise.all(folderPromises)

              break
            case ELEMENT_TYPE.SCENE:
              const scenePromises: Promise<void>[] = []

              if (
                sourceParent.data.type === ELEMENT_TYPE.WORLD ||
                destinationParent.data.type === ELEMENT_TYPE.WORLD
              ) {
                scenePromises.push(
                  api().worlds.saveChildRefsToWorld(
                    studioId,
                    world.id,
                    newTreeData.items[world.id].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ElementId
                    ])
                  )
                )
              }

              if (sourceParent.data.type === ELEMENT_TYPE.FOLDER) {
                scenePromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    sourceParent.id as ElementId,
                    newTreeData.items[
                      sourceParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ElementId
                    ])
                  )
                )
              }

              if (destinationParent.data.type === ELEMENT_TYPE.FOLDER) {
                scenePromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    destinationParent.id as ElementId,
                    newTreeData.items[
                      destinationParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ElementId
                    ])
                  )
                )
              }

              scenePromises.push(
                api().scenes.saveParentRefToScene(
                  studioId,
                  [
                    newTreeData.items[destinationParent.id].data.type,
                    newTreeData.items[destinationParent.id].data.type ===
                    ELEMENT_TYPE.WORLD
                      ? null
                      : (destinationParent.id as ElementId)
                  ],
                  movingElement.id as ElementId
                )
              )

              await Promise.all(scenePromises)

              break
            case ELEMENT_TYPE.EVENT:
              if (sourceParent.id !== destinationParent.id) {
                const jumps = await api().jumps.getJumpsByEventRef(
                  studioId,
                  movingElement.id as string
                )

                await Promise.all(
                  jumps.map(
                    async (jump) =>
                      jump.id &&
                      (await api().jumps.saveJumpRoute(studioId, jump.id, [
                        jump.path[0],
                        jump.path[1]
                      ]))
                  )
                )

                await api().paths.removePathsByEventRef(
                  studioId,
                  movingElement.id as ElementId
                )
              }

              await Promise.all([
                api().events.saveSceneRefToEvent(
                  studioId,
                  destinationParent.id as ElementId,
                  movingElement.id as ElementId
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  sourceParent.id as ElementId,
                  newTreeData.items[sourceParent.id].children.map((childId) => [
                    ELEMENT_TYPE.EVENT,
                    childId as ElementId
                  ])
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  destinationParent.id as ElementId,
                  newTreeData.items[
                    destinationParent.id
                  ].children.map((childId) => [
                    ELEMENT_TYPE.EVENT,
                    childId as ElementId
                  ])
                )
              ])
              break
            default:
              return
          }
        } catch (error) {
          // TODO: Move the item back to original position?
          throw error
        }
      }
    } else if (movingElement) {
      logger.info(
        `Unable to move component type '${movingElement.data.type}' to type '${destinationParent.data.type}'`
      )
    }
  }

  function onSelect(componentId: ElementId) {
    if (treeData) {
      const {
        id,
        data: { type, title, parentId }
      } = treeData.items[componentId]

      if (type === ELEMENT_TYPE.EVENT) {
        const parentItem = treeData.items[parentId]

        if (editor.selectedWorldOutlineElement.id !== parentItem.id)
          editorDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              id: parentItem.id as ElementId,
              type: parentItem.data.type,
              expanded: true,
              title: parentItem.data.title
            }
          })

        if (editor.selectedSceneMapEvent !== id)
          // TODO: prevent infinite loop when selecting an unselected in an unselected scene
          // from a selected scene by hacking event stackO__O
          setTimeout(
            () =>
              editorDispatch({
                type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                selectedSceneMapEvent: id as ElementId
              }),
            1
          )
      }

      if (type !== ELEMENT_TYPE.EVENT) {
        if (ELEMENT_TYPE.WORLD || ELEMENT_TYPE.FOLDER) {
          editor.selectedSceneMapEvent &&
            editorDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: null
            })

          editor.selectedSceneMapJump &&
            editorDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
              selectedSceneMapJump: null
            })
        }

        editorDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
          selectedWorldOutlineElement: {
            id: id as ElementId,
            type,
            expanded: true,
            title
          }
        })
      }
    }
  }

  async function onAdd(parentComponentId: ElementId, childType: ELEMENT_TYPE) {
    const parentItem = treeData?.items[parentComponentId]

    if (treeData && parentItem && world.id) {
      const data = parentItem.data
      let newTreeData: TreeData

      if (editor.selectedWorldOutlineElement.id)
        treeData.items[
          editor.selectedWorldOutlineElement.id
        ].data.selected = false

      switch (data.type) {
        // add folder or scene
        case ELEMENT_TYPE.WORLD:
          if (
            childType === ELEMENT_TYPE.SCENE ||
            childType === ELEMENT_TYPE.FOLDER
          ) {
            let childId: ElementId,
              childTitle: string =
                childType === ELEMENT_TYPE.SCENE
                  ? 'Untitled Scene'
                  : 'Untitled Folder'

            try {
              childId =
                childType === ELEMENT_TYPE.SCENE
                  ? await api().scenes.saveScene(studioId, {
                      children: [],
                      worldId: world.id,
                      jumps: [],
                      parent: [ELEMENT_TYPE.WORLD, null],
                      tags: [],
                      title: childTitle,
                      editor: {}
                    })
                  : await api().folders.saveFolder(studioId, {
                      children: [],
                      worldId: world.id,
                      parent: [ELEMENT_TYPE.WORLD, null],
                      tags: [],
                      title: childTitle
                    })
            } catch (error) {
              throw error
            }

            parentItem.hasChildren = true

            newTreeData = addItemToTree(treeData, parentItem.id as ElementId, {
              id: childId,
              children: [],
              isExpanded: false,
              hasChildren: false,
              isChildrenLoading: false,
              data: {
                title: childTitle,
                type: childType,
                selected: false,
                parentId: parentItem.id,
                renaming: true
              }
            })

            try {
              await api().worlds.saveChildRefsToWorld(
                studioId,
                world.id,
                newTreeData.items[parentItem.id].children.map((childId) => [
                  newTreeData.items[childId].data.type,
                  childId as ElementId
                ])
              )
            } catch (error) {
              throw error
            }

            setTreeData(newTreeData)

            editorDispatch({
              type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
              selectedWorldOutlineElement: {
                id: childId,
                expanded: true,
                type: childType,
                title: childTitle
              }
            })
          } else {
            throw new Error(
              `Unable to add to game. Component type: ${childType} is not supported.`
            )
          }

          break
        // add scene
        case ELEMENT_TYPE.FOLDER:
          let childId: ElementId | undefined = undefined,
            childTitle: string | undefined = undefined

          try {
            if (childType === ELEMENT_TYPE.FOLDER) {
              childTitle = 'Untitled Folder'

              childId = await api().folders.saveFolder(studioId, {
                children: [],
                worldId: world.id,
                parent: [parentItem.data.type, parentItem.id as ElementId],
                tags: [],
                title: childTitle
              })
            }

            if (childType === ELEMENT_TYPE.SCENE) {
              childTitle = 'Untitled Scene'

              childId = await api().scenes.saveScene(studioId, {
                children: [],
                worldId: world.id,
                jumps: [],
                title: childTitle,
                parent: [parentItem.data.type, parentItem.id as ElementId],
                tags: []
              })
            }
          } catch (error) {
            throw error
          }

          parentItem.hasChildren = true

          if (childId && childTitle) {
            newTreeData = addItemToTree(treeData, parentItem.id as ElementId, {
              id: childId,
              children: [],
              isExpanded: false,
              hasChildren: false,
              isChildrenLoading: false,
              data: {
                title: childTitle,
                type: childType,
                selected: false,
                parentId: parentItem.id,
                renaming: true
              }
            })

            try {
              await api().folders.saveChildRefsToFolder(
                studioId,
                parentItem.id as ElementId,
                newTreeData.items[parentItem.id].children.map((childId) => [
                  newTreeData.items[childId].data.type,
                  childId as ElementId
                ])
              )
            } catch (error) {
              throw error
            }

            setTreeData(newTreeData)

            editorDispatch({
              type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
              selectedWorldOutlineElement: {
                id: childId,
                expanded: true,
                type: childType,
                title: childTitle
              }
            })
          }

          break
        // add passage
        case ELEMENT_TYPE.SCENE:
          let passage = undefined

          try {
            passage = await api().events.saveEvent(studioId, {
              choices: [],
              content: JSON.stringify([...DEFAULT_EVENT_CONTENT]),
              editor: {
                componentEditorPosX:
                  editor.selectedSceneMapCenter.x -
                  DEFAULT_NODE_SIZE.EVENT_WIDTH / 2,
                componentEditorPosY:
                  editor.selectedSceneMapCenter.y -
                  DEFAULT_NODE_SIZE.EVENT_HEIGHT / 2
              },
              ending: false,
              worldId: world.id,
              sceneId: parentItem.id as string,
              title: 'Untitled Event',
              type: EVENT_TYPE.CHOICE,
              tags: []
            })
          } catch (error) {
            throw error
          }

          parentItem.hasChildren = true

          if (passage.id) {
            try {
              // #414
              const sceneChildren: SceneChildRefs = treeData.items[
                parentItem.id
              ].children.map((childId) => [
                ELEMENT_TYPE.EVENT,
                childId as ElementId
              ])

              await api().scenes.saveChildRefsToScene(
                studioId,
                parentItem.id as ElementId,
                [...sceneChildren, [ELEMENT_TYPE.EVENT, passage.id]]
              )
            } catch (error) {
              throw error
            }

            editorDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: passage.id
            })

            editorDispatch({
              type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
              savedElement: {
                id: passage.id,
                type: ELEMENT_TYPE.EVENT
              }
            })
          }

          break
        default:
          break
      }

      logger.info(`adding component to tree with id '${parentComponentId}'`)
    }
  }

  async function onRemove(componentId: ElementId) {
    logger.info(`WorldOutline->onRemove->${componentId}`)

    const item = treeData?.items[componentId],
      data = item?.data

    if (world.id && item && treeData) {
      const newTreeData = removeItemFromTree(treeData, item.id as ElementId),
        parent = newTreeData.items[item.data.parentId]

      if (
        (data.type === ELEMENT_TYPE.EVENT &&
          item.id === editor.selectedSceneMapEvent) ||
        (data.type === ELEMENT_TYPE.SCENE &&
          editor.selectedSceneMapEvent &&
          item.children.includes(editor.selectedSceneMapEvent))
      ) {
        editorDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
          selectedSceneMapEvent: null
        })

        editorDispatch({
          type:
            COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_EVENTS,
          totalSceneMapSelectedEvents: 0
        })
      }

      editorDispatch({
        type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
        removedElement: { id: componentId, type: data.type }
      })

      try {
        switch (data.type) {
          case ELEMENT_TYPE.FOLDER:
            await Promise.all([
              await api().worlds.saveChildRefsToWorld(
                studioId,
                world.id,
                parent.children.map((childId) => [
                  newTreeData.items[childId].data.type,
                  childId as ElementId
                ])
              ),
              await api().folders.removeFolder(studioId, componentId)
            ])
            break
          case ELEMENT_TYPE.SCENE:
            const sceneRemovePromises: Promise<void>[] = []

            if (parent.data.type === ELEMENT_TYPE.WORLD) {
              sceneRemovePromises.push(
                api().worlds.saveChildRefsToWorld(
                  studioId,
                  world.id,
                  parent.children.map((childId) => [
                    newTreeData.items[childId].data.type,
                    childId as ElementId
                  ])
                )
              )
            }

            if (parent.data.type === ELEMENT_TYPE.FOLDER) {
              sceneRemovePromises.push(
                api().folders.saveChildRefsToFolder(
                  studioId,
                  item.data.parentId,
                  parent.children.map((childId) => [
                    newTreeData.items[childId].data.type,
                    childId as ElementId
                  ])
                )
              )
            }

            sceneRemovePromises.push(
              api().scenes.removeScene(studioId, componentId)
            )

            await Promise.all(sceneRemovePromises)

            break
          case ELEMENT_TYPE.EVENT:
            await Promise.all([
              api().scenes.saveChildRefsToScene(
                studioId,
                item.data.parentId,
                parent.children.map((childId) => [
                  ELEMENT_TYPE.EVENT,
                  childId as ElementId
                ])
              ),
              api().events.removeEvent(studioId, item?.id as ElementId)
            ])
            break
          default:
            break
        }
      } catch (error) {
        throw error
      }
    }
  }

  async function OnEditComponentTitle(
    componentId: ElementId,
    title: string | undefined,
    complete: boolean
  ) {
    logger.info(`WorldOutline->OnEditComponentTitle`)

    if (treeData) {
      if (complete && title) {
        logger.info(
          `WorldOutline->OnEditComponentTitle->complete && title:'${title}'`
        )

        try {
          switch (treeData.items[componentId].data.type) {
            case ELEMENT_TYPE.FOLDER:
              await api().folders.saveFolderTitle(studioId, componentId, title)
              break
            case ELEMENT_TYPE.SCENE:
              await api().scenes.saveSceneTitle(studioId, componentId, title)
              break
            case ELEMENT_TYPE.EVENT:
              await api().events.saveEventTitle(studioId, componentId, title)
              break
            default:
              break
          }
        } catch (error) {
          throw error
        }

        // TODO: updating DB could fail; cache name if need revert on error
        editorDispatch({
          type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME,
          renamedElement: {
            id: componentId,
            newTitle: title || treeData.items[componentId].data.title
          }
        })

        if (
          componentId === editor.selectedWorldOutlineElement.id &&
          title !== editor.selectedWorldOutlineElement.title
        ) {
          editorDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              ...editor.selectedWorldOutlineElement,
              title: title || treeData.items[componentId].data.title
            }
          })
        }
      } else {
        logger.info(`WorldOutline->OnEditComponentTitle->else`)

        setTreeData(
          mutateTree(treeData, componentId, {
            data: { ...treeData.items[componentId].data, renaming: true }
          })
        )

        editorDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_RENAME,
          renamingWorldOutlineElement: { id: componentId, renaming: true }
        })
      }
    }
  }

  function selectComponent() {
    if (treeData) {
      const clonedTreeData = cloneDeep(treeData)

      Object.entries(clonedTreeData.items).map(([componentId, component]) => {
        if (editor.renamingWorldOutlineElement.id) {
          component.data.renaming = false

          editorDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_RENAME,
            renamingWorldOutlineElement: { id: undefined, renaming: false }
          })
        }

        component.isExpanded =
          componentId === editor.selectedWorldOutlineElement.id ||
          clonedTreeData.items[componentId].isExpanded

        if (
          componentId &&
          editor.selectedWorldOutlineElement.id &&
          componentId === editor.selectedWorldOutlineElement.id
        ) {
          component.data.title = editor.selectedWorldOutlineElement.title
          component.data.selected = true
        } else {
          component.data.selected = false
        }
      })

      setTreeData(clonedTreeData)
    }
  }

  const selectStoryworld = () => {
    editor.selectedSceneMapEvent &&
      editorDispatch({
        type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
        selectedSceneMapEvent: null
      })

    editor.selectedSceneMapJump &&
      editorDispatch({
        type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
        selectedSceneMapJump: null
      })

    editor.selectedWorldOutlineElement.id !== world.id &&
      editorDispatch({
        type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
        selectedWorldOutlineElement: {
          id: world.id,
          expanded: true,
          title: world.title,
          type: ELEMENT_TYPE.WORLD
        }
      })
  }

  useEffect(selectComponent, [editor.selectedWorldOutlineElement])

  useEffect(() => {
    async function updateTree() {
      logger.info('WorldOutline->editor.savedElement effect')

      // TODO: Can't we do this better? *hic*
      if (treeData && editor.savedElement.id) {
        const { id, type } = editor.savedElement

        switch (type) {
          case ELEMENT_TYPE.EVENT:
            const passage = await api().events.getEvent(studioId, id)

            if (passage.id) {
              // #414
              const newTreeData = addItemToTree(treeData, passage.sceneId, {
                id,
                children: [],
                isExpanded: false,
                hasChildren: false,
                isChildrenLoading: false,
                data: {
                  title: 'Untitled Event',
                  type: ELEMENT_TYPE.EVENT,
                  selected: false,
                  parentId: passage.sceneId,
                  renaming: true
                }
              })

              newTreeData.items[passage.sceneId].data.selected = true

              setTreeData(newTreeData)

              if (editor.selectedWorldOutlineElement.id !== passage.sceneId) {
                const parentScene = treeData.items[passage.sceneId]

                // TODO: sets tree data twice
                editorDispatch({
                  type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
                  selectedWorldOutlineElement: {
                    id: parentScene.id as ElementId,
                    expanded: true,
                    type: ELEMENT_TYPE.SCENE,
                    title: parentScene.data.title
                  }
                })
              }
            }
            break
          default:
            break
        }
      }
    }

    updateTree()
  }, [editor.savedElement])

  useEffect(() => {
    logger.info(
      `WorldOutline->editor.renamedElement->useEffect->
       id:${editor.renamedElement.id} newTitle:'${editor.renamedElement.newTitle}'`
    )

    if (
      treeData &&
      editor.renamedElement.id &&
      editor.renamedElement.newTitle
    ) {
      setTreeData(
        mutateTree(treeData, editor.renamedElement.id, {
          data: {
            ...treeData.items[editor.renamedElement.id].data,
            title:
              editor.renamedElement.newTitle ||
              treeData.items[editor.renamedElement.id].data.title,
            renaming: false
          }
        })
      )
    }
  }, [editor.renamedElement])

  useEffect(() => {
    logger.info(`WorldOutline->editor.removedComponent->useEffect`)

    if (treeData && editor.removedElement.id) {
      logger.info(
        `Removing component from outline with ID: ${editor.removedElement.id}`
      )

      setTreeData(removeItemFromTree(treeData, editor.removedElement.id))

      if (editor.removedElement.type !== ELEMENT_TYPE.EVENT)
        editorDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
          selectedWorldOutlineElement: {
            id: undefined,
            expanded: false,
            type: undefined,
            title: undefined
          }
        })
    }
  }, [editor.removedElement])

  useEffect(() => {
    if (treeData) {
      logger.info('WorldOutline->treeData->useEffect->tree data updated')
    }
  }, [treeData])

  useEffect(() => {
    async function getGameComponents() {
      if (world.id) {
        const folders = await api().folders.getFoldersByWorldRef(
            studioId,
            world.id
          ),
          scenes = await api().scenes.getScenesByWorldRef(studioId, world.id),
          events = await api().events.getEventsByWorldRef(studioId, world.id)

        if (folders && scenes && events) {
          setTreeData(createGameOutlineTreeData(world, folders, scenes, events))
        } else {
          throw new Error('Unable to build tree data.')
        }
      }
    }

    getGameComponents()
  }, [])

  return (
    <div className={styles.WorldOutline}>
      {world.id && treeData && (
        <>
          <TitleBar
            studioId={studioId}
            world={world}
            onAdd={(_, childType: ELEMENT_TYPE) =>
              editor.selectedWorldOutlineElement.id &&
              onAdd(editor.selectedWorldOutlineElement.id, childType)
            }
            onWorldSelect={selectStoryworld}
          />

          <div className={styles.tree}>
            {treeData.items[treeData.rootId].hasChildren && (
              <Tree
                tree={treeData}
                renderItem={(item: RenderItemParams) => (
                  <ElementItem
                    item={item}
                    onSelect={onSelect}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    OnEditElementTitle={OnEditComponentTitle}
                  />
                )}
                onExpand={onExpand}
                onCollapse={onCollapse}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                offsetPerLevel={19}
                isDragEnabled
                isNestingEnabled
              />
            )}

            {!treeData.items[treeData.rootId].hasChildren && (
              <Button
                type="link"
                onClick={() => {
                  if (world.id) onAdd(world.id, ELEMENT_TYPE.SCENE)
                }}
                className={styles.addSceneButton}
              >
                Add Scene...
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

WorldOutline.displayName = 'WorldOutline'

export default WorldOutline
