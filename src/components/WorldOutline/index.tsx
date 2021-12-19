import logger from '../../lib/logger'
import { cloneDeep } from 'lodash-es'
import createWorldOutlineTreeData from '../../lib/createWorldOutlineTreeData'

import React, { useCallback, useContext, useEffect, useState } from 'react'

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

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../contexts/ComposerContext'

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
  parentElementId: ElementId,
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
  const { composer, composerDispatch } = useContext(ComposerContext)

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

    if (treeData && composer.renamingWorldOutlineElement.id) {
      setTreeData(
        mutateTree(treeData, composer.renamingWorldOutlineElement.id, {
          data: {
            ...treeData.items[composer.renamingWorldOutlineElement.id].data,
            renaming: false
          }
        })
      )

      composerDispatch({
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
        composer.selectedWorldOutlineElement.id === movingElement.id

      setTreeData(newTreeData)

      composer.selectedWorldOutlineElement.id === movingElement.id &&
        composerDispatch({
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
                      (await api().jumps.saveJumpPath(studioId, jump.id, [
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
                    newTreeData.items[childId].data.type,
                    childId as ElementId
                  ])
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  destinationParent.id as ElementId,
                  newTreeData.items[
                    destinationParent.id
                  ].children.map((childId) => [
                    newTreeData.items[childId].data.type,
                    childId as ElementId
                  ])
                )
              ])

              break
            case ELEMENT_TYPE.JUMP:
              if (sourceParent.id !== destinationParent.id) {
                await api().paths.removePathsByJumpRef(
                  studioId,
                  movingElement.id as ElementId
                )
              }

              await Promise.all([
                api().jumps.saveSceneRefToJump(
                  studioId,
                  destinationParent.id as ElementId,
                  movingElement.id as ElementId
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  sourceParent.id as ElementId,
                  newTreeData.items[sourceParent.id].children.map((childId) => [
                    newTreeData.items[childId].data.type,
                    childId as ElementId
                  ])
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  destinationParent.id as ElementId,
                  newTreeData.items[
                    destinationParent.id
                  ].children.map((childId) => [
                    newTreeData.items[childId].data.type,
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
        `Unable to move element type '${movingElement.data.type}' to type '${destinationParent.data.type}'`
      )
    }
  }

  function onSelect(elementId: ElementId) {
    if (treeData) {
      const {
        id,
        data: { type, title, parentId }
      } = treeData.items[elementId]

      if (type === ELEMENT_TYPE.EVENT || type === ELEMENT_TYPE.JUMP) {
        const parentItem = treeData.items[parentId]

        if (composer.selectedWorldOutlineElement.id !== parentItem.id) {
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              id: parentItem.id as ElementId,
              type: parentItem.data.type,
              expanded: true,
              title: parentItem.data.title
            }
          })
        } else {
          // elmstorygames/feedback#129
          const newTreeData = cloneDeep(treeData)

          Object.keys(treeData.items).map((itemId) => {
            newTreeData.items[itemId].data.renaming = false
          })

          setTreeData(newTreeData)
        }

        // TODO: stack hack
        // elmstorygames/feedback#132
        setTimeout(() => {
          if (
            type === ELEMENT_TYPE.EVENT ||
            composer.selectedSceneMapJump !== id
          )
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
              selectedSceneMapJump: null
            })

          if (
            type === ELEMENT_TYPE.JUMP ||
            composer.selectedSceneMapEvent !== id
          )
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: null
            })
        }, 1)

        if (
          type === ELEMENT_TYPE.EVENT &&
          composer.selectedSceneMapEvent !== id
        ) {
          // TODO: prevent infinite loop when selecting an unselected in an unselected scene
          // from a selected scene by hacking event stackO__O
          setTimeout(() => {
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: id as ElementId
            })
          }, 2)
        }

        if (
          type === ELEMENT_TYPE.JUMP &&
          composer.selectedSceneMapJump !== id
        ) {
          setTimeout(() => {
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
              selectedSceneMapJump: id as ElementId
            })
          }, 2)
        }
      }

      if (type !== ELEMENT_TYPE.EVENT && type !== ELEMENT_TYPE.JUMP) {
        if (ELEMENT_TYPE.WORLD || ELEMENT_TYPE.FOLDER) {
          composer.selectedSceneMapEvent &&
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: null
            })

          composer.selectedSceneMapJump &&
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
              selectedSceneMapJump: null
            })
        }

        composerDispatch({
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

  async function onAdd(parentElementId: ElementId, childType: ELEMENT_TYPE) {
    const parentItem = treeData?.items[parentElementId]

    if (treeData && parentItem && world.id) {
      const data = parentItem.data
      let newTreeData: TreeData

      if (composer.selectedWorldOutlineElement.id)
        treeData.items[
          composer.selectedWorldOutlineElement.id
        ].data.selected = false

      const addElementToWorld = async () => {
        if (!world.id) return

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
                    parent: [ELEMENT_TYPE.WORLD, null],
                    tags: [],
                    title: childTitle,
                    composer: {}
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

          treeData.items[world.id].hasChildren = true

          newTreeData = addItemToTree(treeData, world.id, {
            id: childId,
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: childTitle,
              type: childType,
              selected: false,
              parentId: world.id,
              renaming: true
            }
          })

          try {
            await api().worlds.saveChildRefsToWorld(
              studioId,
              world.id,
              newTreeData.items[world.id].children.map((childId) => [
                newTreeData.items[childId].data.type,
                childId as ElementId
              ])
            )
          } catch (error) {
            throw error
          }

          setTreeData(newTreeData)

          // elmstorygames/feedback#135
          composer.selectedSceneMapEvent &&
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: null
            })

          // elmstorygames/feedback#135
          composer.selectedSceneMapJump &&
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
              selectedSceneMapJump: null
            })

          composerDispatch({
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
      }

      const addFolderOrSceneToFolder = async (
        overrideParent: boolean = false
      ) => {
        if (!world.id) return

        let childId: ElementId | undefined = undefined,
          childTitle: string | undefined = undefined

        const overrideParentItem = overrideParent
          ? treeData.items[parentItem.data.parentId]
          : undefined

        try {
          if (childType === ELEMENT_TYPE.FOLDER) {
            childTitle = 'Untitled Folder'

            childId = await api().folders.saveFolder(studioId, {
              children: [],
              worldId: world.id,
              parent: [
                overrideParentItem?.data.type || parentItem.data.type,
                (overrideParentItem?.id as ElementId) ||
                  (parentItem.id as ElementId)
              ],
              tags: [],
              title: childTitle
            })
          }

          if (childType === ELEMENT_TYPE.SCENE) {
            childTitle = 'Untitled Scene'

            childId = await api().scenes.saveScene(studioId, {
              children: [],
              worldId: world.id,
              title: childTitle,
              parent: [
                overrideParentItem?.data.type || parentItem.data.type,
                (overrideParentItem?.id as ElementId) ||
                  (parentItem.id as ElementId)
              ],
              tags: []
            })
          }
        } catch (error) {
          throw error
        }

        if (overrideParentItem) {
          overrideParentItem.hasChildren = true
        } else {
          parentItem.hasChildren = true
        }

        if (childId && childTitle) {
          newTreeData = addItemToTree(
            treeData,
            (overrideParentItem?.id as ElementId) ||
              (parentItem.id as ElementId),
            {
              id: childId,
              children: [],
              isExpanded: false,
              hasChildren: false,
              isChildrenLoading: false,
              data: {
                title: childTitle,
                type: childType,
                selected: false,
                parentId: overrideParentItem?.id || parentItem.id,
                renaming: true
              }
            }
          )

          try {
            await api().folders.saveChildRefsToFolder(
              studioId,
              (overrideParentItem?.id as ElementId) ||
                (parentItem.id as ElementId),
              newTreeData.items[
                overrideParentItem?.id || parentItem.id
              ].children.map((childId) => [
                newTreeData.items[childId].data.type,
                childId as ElementId
              ])
            )
          } catch (error) {
            throw error
          }

          setTreeData(newTreeData)

          composerDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              id: childId,
              expanded: true,
              type: childType,
              title: childTitle
            }
          })
        }
      }

      switch (data.type) {
        // add folder or scene
        case ELEMENT_TYPE.WORLD:
          await addElementToWorld()

          break
        // add scene
        case ELEMENT_TYPE.FOLDER:
          await addFolderOrSceneToFolder()

          break
        // add event
        case ELEMENT_TYPE.SCENE:
          if (childType === ELEMENT_TYPE.EVENT) {
            let event = undefined

            try {
              event = await api().events.saveEvent(studioId, {
                choices: [],
                content: JSON.stringify([...DEFAULT_EVENT_CONTENT]),
                composer: {
                  sceneMapPosX:
                    composer.selectedSceneMapCenter.x -
                    DEFAULT_NODE_SIZE.EVENT_WIDTH / 2,
                  sceneMapPosY:
                    composer.selectedSceneMapCenter.y -
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

            if (event.id) {
              try {
                // #414
                const sceneChildren: SceneChildRefs = treeData.items[
                  parentItem.id
                ].children.map((childId) => [
                  treeData.items[childId].data.type,
                  childId as ElementId
                ])

                await api().scenes.saveChildRefsToScene(
                  studioId,
                  parentItem.id as ElementId,
                  [...sceneChildren, [ELEMENT_TYPE.EVENT, event.id]]
                )
              } catch (error) {
                throw error
              }

              composerDispatch({
                type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                selectedSceneMapEvent: event.id
              })

              composerDispatch({
                type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                savedElement: {
                  id: event.id,
                  type: ELEMENT_TYPE.EVENT
                }
              })
            }
          }

          if (childType === ELEMENT_TYPE.JUMP) {
            let jump = undefined

            try {
              jump = await api().jumps.saveJump(studioId, {
                composer: {
                  sceneMapPosX:
                    composer.selectedSceneMapCenter.x -
                    DEFAULT_NODE_SIZE.JUMP_WIDTH / 2,
                  sceneMapPosY:
                    composer.selectedSceneMapCenter.y -
                    DEFAULT_NODE_SIZE.JUMP_HEIGHT / 2
                },
                path: [parentItem.id as string],
                sceneId: parentItem.id as string,
                tags: [],
                title: 'Untitled Jump',
                worldId: world.id
              })
            } catch (error) {
              throw error
            }

            parentItem.hasChildren = true

            if (jump.id) {
              try {
                const sceneChildren: SceneChildRefs = treeData.items[
                  parentItem.id
                ].children.map((childId) => [
                  treeData.items[childId].data.type,
                  childId as ElementId
                ])

                await api().scenes.saveChildRefsToScene(
                  studioId,
                  parentItem.id as ElementId,
                  [...sceneChildren, [ELEMENT_TYPE.JUMP, jump.id]]
                )
              } catch (error) {
                throw error
              }

              composerDispatch({
                type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
                selectedSceneMapJump: jump.id
              })

              composerDispatch({
                type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                savedElement: {
                  id: jump.id,
                  type: ELEMENT_TYPE.JUMP
                }
              })
            }
          }

          // elmstorygames/feedback#130
          if (
            childType === ELEMENT_TYPE.FOLDER ||
            childType === ELEMENT_TYPE.SCENE
          ) {
            const overrideParentItem =
              treeData.items[treeData.items[parentElementId].data.parentId]

            if (
              (childType === ELEMENT_TYPE.FOLDER ||
                childType === ELEMENT_TYPE.SCENE) &&
              overrideParentItem.data.type === ELEMENT_TYPE.FOLDER
            ) {
              await addFolderOrSceneToFolder(true)
            } else {
              await addElementToWorld()
            }
          }

          break
        default:
          break
      }

      logger.info(`adding element to tree with id '${parentElementId}'`)
    }
  }

  async function onRemove(elementId: ElementId) {
    logger.info(`WorldOutline->onRemove->${elementId}`)

    const item = treeData?.items[elementId],
      data = item?.data

    if (world.id && item && treeData) {
      const newTreeData = removeItemFromTree(treeData, item.id as ElementId),
        parent = newTreeData.items[item.data.parentId]

      if (
        (data.type === ELEMENT_TYPE.EVENT &&
          item.id === composer.selectedSceneMapEvent) ||
        (data.type === ELEMENT_TYPE.SCENE &&
          composer.selectedSceneMapEvent &&
          item.children.includes(composer.selectedSceneMapEvent))
      ) {
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
          selectedSceneMapEvent: null
        })

        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_EVENTS,
          totalSceneMapSelectedEvents: 0
        })
      }

      if (
        (data.type === ELEMENT_TYPE.JUMP &&
          item.id === composer.selectedSceneMapJump) ||
        (data.type === ELEMENT_TYPE.SCENE &&
          composer.selectedSceneMapJump &&
          item.children.includes(composer.selectedSceneMapJump))
      ) {
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
          selectedSceneMapJump: null
        })

        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_JUMPS,
          totalSceneMapSelectedJumps: 0
        })
      }

      composerDispatch({
        type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
        removedElement: { id: elementId, type: data.type }
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
              await api().folders.removeFolder(studioId, elementId)
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
              api().scenes.removeScene(studioId, elementId)
            )

            await Promise.all(sceneRemovePromises)

            break
          case ELEMENT_TYPE.EVENT:
            await api().events.removeEvent(studioId, item?.id as ElementId)

            break
          case ELEMENT_TYPE.JUMP:
            await api().jumps.removeJump(studioId, item?.id as ElementId)

            break
          default:
            break
        }
      } catch (error) {
        throw error
      }
    }
  }

  async function OnEditElementTitle(
    elementId: ElementId,
    title: string | undefined,
    complete: boolean
  ) {
    logger.info(`WorldOutline->OnEditElementTitle`)

    if (treeData) {
      if (!complete && !title) {
        logger.info(`WorldOutline->OnEditElementTitle->not complete, no title`)

        setTreeData(
          mutateTree(treeData, elementId, {
            data: { ...treeData.items[elementId].data, renaming: true }
          })
        )

        composerDispatch({
          type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_RENAME,
          renamingWorldOutlineElement: { id: elementId, renaming: true }
        })
      }

      // elmstorygames/feedback#151
      if (complete && !title) {
        logger.info(
          `WorldOutline->OnEditElementTitle->complete, no title->reset`
        )

        setTreeData(
          mutateTree(treeData, elementId, {
            data: { ...treeData.items[elementId].data, renaming: false }
          })
        )
      }

      if (complete && title) {
        logger.info(
          `WorldOutline->OnEditElementTitle->complete && title:'${title}'`
        )

        try {
          switch (treeData.items[elementId].data.type) {
            case ELEMENT_TYPE.FOLDER:
              await api().folders.saveFolderTitle(studioId, elementId, title)
              break
            case ELEMENT_TYPE.SCENE:
              await api().scenes.saveSceneTitle(studioId, elementId, title)
              break
            case ELEMENT_TYPE.EVENT:
              await api().events.saveEventTitle(studioId, elementId, title)
              break
            case ELEMENT_TYPE.JUMP:
              await api().jumps.saveJumpTitle(studioId, elementId, title)
              break
            default:
              break
          }
        } catch (error) {
          throw error
        }

        // TODO: updating DB could fail; cache name if need revert on error
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME,
          renamedElement: {
            id: elementId,
            newTitle: title || treeData.items[elementId].data.title
          }
        })

        if (
          elementId === composer.selectedWorldOutlineElement.id &&
          title !== composer.selectedWorldOutlineElement.title
        ) {
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              ...composer.selectedWorldOutlineElement,
              title: title || treeData.items[elementId].data.title
            }
          })
        }
      }
    }
  }

  function selectElement() {
    if (treeData) {
      const clonedTreeData = cloneDeep(treeData)

      Object.entries(clonedTreeData.items).map(([elementId, element]) => {
        if (composer.renamingWorldOutlineElement.id) {
          element.data.renaming = false

          composerDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_RENAME,
            renamingWorldOutlineElement: { id: undefined, renaming: false }
          })
        }

        element.isExpanded =
          elementId === composer.selectedWorldOutlineElement.id ||
          clonedTreeData.items[elementId].isExpanded

        if (
          elementId &&
          composer.selectedWorldOutlineElement.id &&
          elementId === composer.selectedWorldOutlineElement.id
        ) {
          element.data.title = composer.selectedWorldOutlineElement.title
          element.data.selected = true
        } else {
          element.data.selected = false
        }
      })

      setTreeData(clonedTreeData)
    }
  }

  const selectStoryworld = useCallback(() => {
    composer.selectedSceneMapEvent &&
      composerDispatch({
        type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
        selectedSceneMapEvent: null
      })

    composer.selectedSceneMapJump &&
      composerDispatch({
        type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
        selectedSceneMapJump: null
      })

    composer.selectedWorldOutlineElement.id !== world.id &&
      composerDispatch({
        type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
        selectedWorldOutlineElement: {
          id: world.id,
          expanded: true,
          title: world.title,
          type: ELEMENT_TYPE.WORLD
        }
      })
  }, [composer.selectedSceneMapEvent, composer.selectedSceneMapJump])

  useEffect(selectElement, [composer.selectedWorldOutlineElement])

  useEffect(() => {
    async function updateTree() {
      logger.info('WorldOutline->composer.savedElement effect')

      // TODO: Can't we do this better? *hic*
      if (treeData && composer.savedElement.id) {
        const { id, type } = composer.savedElement

        switch (type) {
          case ELEMENT_TYPE.EVENT:
            const event = await api().events.getEvent(studioId, id)

            if (event.id) {
              // #414
              const newTreeData = addItemToTree(treeData, event.sceneId, {
                id,
                children: [],
                isExpanded: false,
                hasChildren: false,
                isChildrenLoading: false,
                data: {
                  title: 'Untitled Event',
                  type: ELEMENT_TYPE.EVENT,
                  selected: false,
                  parentId: event.sceneId,
                  renaming: true
                }
              })

              newTreeData.items[event.sceneId].data.selected = true

              setTreeData(newTreeData)

              if (composer.selectedWorldOutlineElement.id !== event.sceneId) {
                const parentScene = treeData.items[event.sceneId]

                // TODO: sets tree data twice
                composerDispatch({
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
          case ELEMENT_TYPE.JUMP:
            const jump = await api().jumps.getJump(studioId, id)

            if (jump.id && jump.sceneId) {
              const sceneChildRefs = await api().scenes.getChildRefsBySceneRef(
                studioId,
                jump.sceneId
              )

              const newTreeData = addItemToTree(treeData, jump.sceneId, {
                id,
                children: [],
                isExpanded: false,
                hasChildren: false,
                isChildrenLoading: false,
                data: {
                  title: 'Untitled Jump',
                  type: ELEMENT_TYPE.JUMP,
                  selected: false,
                  parentId: jump.sceneId,
                  renaming: true
                }
              })

              newTreeData.items[jump.sceneId].data.selected = true

              newTreeData.items[jump.sceneId].children = sceneChildRefs.map(
                (child) => child[1]
              )

              setTreeData(newTreeData)

              if (composer.selectedWorldOutlineElement.id !== jump.sceneId) {
                const parentScene = treeData.items[jump.sceneId]

                // TODO: sets tree data twice
                composerDispatch({
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
  }, [composer.savedElement])

  useEffect(() => {
    logger.info(
      `WorldOutline->composer.renamedElement->useEffect->
       id:${composer.renamedElement.id} newTitle:'${composer.renamedElement.newTitle}'`
    )

    if (
      treeData &&
      composer.renamedElement.id &&
      composer.renamedElement.newTitle
    ) {
      setTreeData(
        mutateTree(treeData, composer.renamedElement.id, {
          data: {
            ...treeData.items[composer.renamedElement.id].data,
            title:
              composer.renamedElement.newTitle ||
              treeData.items[composer.renamedElement.id].data.title,
            renaming: false
          }
        })
      )
    }
  }, [composer.renamedElement])

  useEffect(() => {
    logger.info(`WorldOutline->composer.removedComponent->useEffect`)

    async function updateTree() {
      if (treeData && composer.removedElement.id) {
        logger.info(
          `Removing element from outline with ID: ${composer.removedElement.id}`
        )

        let newTreeData: TreeData = removeItemFromTree(
          treeData,
          composer.removedElement.id
        )

        // check jumps to see if they should still exist in outline
        if (composer.removedElement.type === ELEMENT_TYPE.SCENE) {
          const jumpIds = Object.keys(treeData.items).filter(
            (id) => treeData.items[id].data.type === ELEMENT_TYPE.JUMP
          )

          await Promise.all(
            jumpIds.map(async (jumpId) => {
              // elmstorygames/feedback#134
              if (!newTreeData.items[jumpId]) return

              const jump = await api().jumps.getJump(studioId, jumpId)

              if (!jump || jump.path[0] === composer.removedElement.id) {
                newTreeData = removeItemFromTree(newTreeData, jumpId)
              }
            })
          )
        }

        setTreeData(newTreeData)

        if (
          composer.removedElement.type !== ELEMENT_TYPE.EVENT &&
          composer.removedElement.type !== ELEMENT_TYPE.JUMP
        )
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
            selectedWorldOutlineElement: {
              id: undefined,
              expanded: false,
              type: undefined,
              title: undefined
            }
          })
      }
    }

    updateTree()
  }, [composer.removedElement])

  useEffect(() => {
    if (treeData) {
      logger.info('WorldOutline->treeData->useEffect->tree data updated')
    }
  }, [treeData])

  useEffect(() => {
    async function getWorldComponents() {
      if (world.id) {
        const [folders, scenes, events, jumps] = await Promise.all([
          api().folders.getFoldersByWorldRef(studioId, world.id),
          api().scenes.getScenesByWorldRef(studioId, world.id),
          api().events.getEventsByWorldRef(studioId, world.id),
          api().jumps.getJumpsByWorldRef(studioId, world.id)
        ])

        if (folders && scenes && events) {
          setTreeData(
            createWorldOutlineTreeData(world, folders, scenes, events, jumps)
          )
        } else {
          throw new Error('Unable to build tree data.')
        }
      }
    }

    getWorldComponents()
  }, [])

  return (
    <div className={styles.WorldOutline}>
      <TitleBar
        studioId={studioId}
        world={world}
        onAdd={(_, childType: ELEMENT_TYPE) =>
          composer.selectedWorldOutlineElement.id &&
          onAdd(composer.selectedWorldOutlineElement.id, childType)
        }
        onWorldSelect={selectStoryworld}
      />

      {world.id && treeData && (
        <>
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
                    OnEditElementTitle={OnEditElementTitle}
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
