import logger from '../../lib/logger'
import { cloneDeep } from 'lodash-es'
import createGameOutlineTreeData from '../../lib/createGameOutlineTreeData'

import React, { useContext, useEffect, useState } from 'react'

import {
  ElementId,
  ELEMENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  World,
  EVENT_TYPE,
  SceneChildRefs,
  StudioId
} from '../../data/types'
import { DEFAULT_NODE_SIZE } from '../ElementComposer/SceneMap'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

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
import ComponentItem from './ComponentItem'

import styles from './styles.module.less'

import api from '../../api'

// TODO: build type for item.data
// { title, type, selected, parentId, renaming }

export type OnSelectComponent = (componentId: ElementId) => void
export type OnAddComponent = (
  parentComponentId: ElementId,
  childType: ELEMENT_TYPE
) => void
export type OnRemoveComponent = (componentId: ElementId) => void
export type OnEditComponentTitle = (
  componentId: ElementId,
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
        clonedTree.items[sceneId].children.map((passageId) =>
          nestedChildrenToRemove.push(passageId)
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

const StoryworldOutline: React.FC<{ studioId: StudioId; game: World }> = ({
  studioId,
  game
}) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  const [treeData, setTreeData] = useState<TreeData | undefined>(undefined),
    [movingComponentId, setMovingComponentId] = useState<string | undefined>(
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
    logger.info(`StoryworldOutline->onDragStart->${itemId}`)

    if (treeData && editor.renamingGameOutlineComponent.id) {
      setTreeData(
        mutateTree(treeData, editor.renamingGameOutlineComponent.id, {
          data: {
            ...treeData.items[editor.renamingGameOutlineComponent.id].data,
            renaming: false
          }
        })
      )

      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME,
        renamingGameOutlineComponent: { id: undefined, renaming: false }
      })
    }

    setMovingComponentId(itemId as string)
  }

  // TODO: this is a fucking nightmare lol
  async function onDragEnd(
    source: TreeSourcePosition,
    destination?: TreeDestinationPosition
  ) {
    if (!destination || !treeData) return

    const sourceParent = treeData.items[source.parentId],
      destinationParent = treeData.items[destination.parentId],
      movingComponent = movingComponentId && treeData.items[movingComponentId]

    if (
      sourceParent.id === destinationParent.id &&
      source.index === destination.index
    )
      return

    if (
      movingComponent &&
      (sourceParent.data.type === destinationParent.data.type ||
        // folder to game or folder
        (movingComponent.data.type === ELEMENT_TYPE.FOLDER &&
          destinationParent.data.type === ELEMENT_TYPE.GAME) ||
        (movingComponent.data.type === ELEMENT_TYPE.FOLDER &&
          destinationParent.data.type === ELEMENT_TYPE.FOLDER) ||
        // scene to game or folder
        (movingComponent.data.type === ELEMENT_TYPE.SCENE &&
          destinationParent.data.type === ELEMENT_TYPE.GAME) ||
        (movingComponent.data.type === ELEMENT_TYPE.SCENE &&
          destinationParent.data.type === ELEMENT_TYPE.FOLDER))
    ) {
      logger.info(
        `
          moving: ${movingComponent.data.title}
          from: ${sourceParent.data.title} (index ${source.index})
          to: ${destinationParent.data.title} (index ${destination.index})
        `
      )

      const newTreeData = moveItemOnTree(treeData, source, destination)

      if (!destinationParent.isExpanded) destinationParent.isExpanded = true

      newTreeData.items[movingComponent.id].data.parentId = destinationParent.id
      newTreeData.items[movingComponent.id].data.selected =
        editor.selectedGameOutlineComponent.id === movingComponent.id

      setTreeData(newTreeData)

      editor.selectedGameOutlineComponent.id === movingComponent.id &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {
            id: movingComponent.id as string,
            expanded: movingComponent.isExpanded || false,
            type: movingComponent.data.type,
            title: movingComponent.data.title
          }
        })

      if (game.id) {
        try {
          switch (movingComponent.data.type) {
            case ELEMENT_TYPE.FOLDER:
              const folderPromises: Promise<void>[] = []

              if (
                sourceParent.data.type === ELEMENT_TYPE.GAME ||
                destinationParent.data.type === ELEMENT_TYPE.GAME
              ) {
                folderPromises.push(
                  api().worlds.saveChildRefsToGame(
                    studioId,
                    game.id,
                    newTreeData.items[game.id].children.map((childId) => [
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
                    ELEMENT_TYPE.GAME
                      ? null
                      : (destinationParent.id as ElementId)
                  ],
                  movingComponent.id as ElementId
                )
              )

              await Promise.all(folderPromises)

              break
            case ELEMENT_TYPE.SCENE:
              const scenePromises: Promise<void>[] = []

              if (
                sourceParent.data.type === ELEMENT_TYPE.GAME ||
                destinationParent.data.type === ELEMENT_TYPE.GAME
              ) {
                scenePromises.push(
                  api().worlds.saveChildRefsToGame(
                    studioId,
                    game.id,
                    newTreeData.items[game.id].children.map((childId) => [
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
                    ELEMENT_TYPE.GAME
                      ? null
                      : (destinationParent.id as ElementId)
                  ],
                  movingComponent.id as ElementId
                )
              )

              await Promise.all(scenePromises)

              break
            case ELEMENT_TYPE.PASSAGE:
              if (sourceParent.id !== destinationParent.id) {
                const jumps = await api().jumps.getJumpsByPassageRef(
                  studioId,
                  movingComponent.id as string
                )

                await Promise.all(
                  jumps.map(
                    async (jump) =>
                      jump.id &&
                      (await api().jumps.saveJumpRoute(studioId, jump.id, [
                        jump.route[0],
                        jump.route[1]
                      ]))
                  )
                )

                await api().routes.removeRoutesByPassageRef(
                  studioId,
                  movingComponent.id as ElementId
                )
              }

              await Promise.all([
                api().passages.saveSceneRefToPassage(
                  studioId,
                  destinationParent.id as ElementId,
                  movingComponent.id as ElementId
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  sourceParent.id as ElementId,
                  newTreeData.items[sourceParent.id].children.map((childId) => [
                    ELEMENT_TYPE.PASSAGE,
                    childId as ElementId
                  ])
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  destinationParent.id as ElementId,
                  newTreeData.items[
                    destinationParent.id
                  ].children.map((childId) => [
                    ELEMENT_TYPE.PASSAGE,
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
    } else if (movingComponent) {
      logger.info(
        `Unable to move component type '${movingComponent.data.type}' to type '${destinationParent.data.type}'`
      )
    }
  }

  function onSelect(componentId: ElementId) {
    if (treeData) {
      const {
        id,
        data: { type, title, parentId }
      } = treeData.items[componentId]

      if (type === ELEMENT_TYPE.PASSAGE) {
        const parentItem = treeData.items[parentId]

        if (editor.selectedGameOutlineComponent.id !== parentItem.id)
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: parentItem.id as ElementId,
              type: parentItem.data.type,
              expanded: true,
              title: parentItem.data.title
            }
          })

        if (editor.selectedComponentEditorSceneViewPassage !== id)
          // TODO: prevent infinite loop when selecting an unselected in an unselected scene
          // from a selected scene by hacking event stackO__O
          setTimeout(
            () =>
              editorDispatch({
                type:
                  EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                selectedComponentEditorSceneViewPassage: id as ElementId
              }),
            1
          )
      }

      if (type !== ELEMENT_TYPE.PASSAGE) {
        if (ELEMENT_TYPE.GAME || ELEMENT_TYPE.FOLDER) {
          editor.selectedComponentEditorSceneViewPassage &&
            editorDispatch({
              type:
                EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
              selectedComponentEditorSceneViewPassage: null
            })

          editor.selectedComponentEditorSceneViewJump &&
            editorDispatch({
              type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
              selectedComponentEditorSceneViewJump: null
            })
        }

        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {
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

    if (treeData && parentItem && game.id) {
      const data = parentItem.data
      let newTreeData: TreeData

      if (editor.selectedGameOutlineComponent.id)
        treeData.items[
          editor.selectedGameOutlineComponent.id
        ].data.selected = false

      switch (data.type) {
        // add folder or scene
        case ELEMENT_TYPE.GAME:
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
                      gameId: game.id,
                      jumps: [],
                      parent: [ELEMENT_TYPE.GAME, null],
                      tags: [],
                      title: childTitle,
                      editor: {}
                    })
                  : await api().folders.saveFolder(studioId, {
                      children: [],
                      gameId: game.id,
                      parent: [ELEMENT_TYPE.GAME, null],
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
              await api().worlds.saveChildRefsToGame(
                studioId,
                game.id,
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
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
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
                gameId: game.id,
                parent: [parentItem.data.type, parentItem.id as ElementId],
                tags: [],
                title: childTitle
              })
            }

            if (childType === ELEMENT_TYPE.SCENE) {
              childTitle = 'Untitled Scene'

              childId = await api().scenes.saveScene(studioId, {
                children: [],
                gameId: game.id,
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
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
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
            passage = await api().passages.savePassage(studioId, {
              choices: [],
              content: JSON.stringify([...DEFAULT_PASSAGE_CONTENT]),
              editor: {
                componentEditorPosX:
                  editor.selectedComponentEditorSceneViewCenter.x -
                  DEFAULT_NODE_SIZE.PASSAGE_WIDTH / 2,
                componentEditorPosY:
                  editor.selectedComponentEditorSceneViewCenter.y -
                  DEFAULT_NODE_SIZE.PASSAGE_HEIGHT / 2
              },
              gameOver: false,
              gameId: game.id,
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
                ELEMENT_TYPE.PASSAGE,
                childId as ElementId
              ])

              await api().scenes.saveChildRefsToScene(
                studioId,
                parentItem.id as ElementId,
                [...sceneChildren, [ELEMENT_TYPE.PASSAGE, passage.id]]
              )
            } catch (error) {
              throw error
            }

            editorDispatch({
              type:
                EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
              selectedComponentEditorSceneViewPassage: passage.id
            })

            editorDispatch({
              type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
              savedComponent: {
                id: passage.id,
                type: ELEMENT_TYPE.PASSAGE
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
    logger.info(`StoryworldOutline->onRemove->${componentId}`)

    const item = treeData?.items[componentId],
      data = item?.data

    if (game.id && item && treeData) {
      const newTreeData = removeItemFromTree(treeData, item.id as ElementId),
        parent = newTreeData.items[item.data.parentId]

      if (
        (data.type === ELEMENT_TYPE.PASSAGE &&
          item.id === editor.selectedComponentEditorSceneViewPassage) ||
        (data.type === ELEMENT_TYPE.SCENE &&
          editor.selectedComponentEditorSceneViewPassage &&
          item.children.includes(
            editor.selectedComponentEditorSceneViewPassage
          ))
      ) {
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
          selectedComponentEditorSceneViewPassage: null
        })

        editorDispatch({
          type:
            EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES,
          totalComponentEditorSceneViewSelectedPassages: 0
        })
      }

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE,
        removedComponent: { id: componentId, type: data.type }
      })

      try {
        switch (data.type) {
          case ELEMENT_TYPE.FOLDER:
            await Promise.all([
              await api().worlds.saveChildRefsToGame(
                studioId,
                game.id,
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

            if (parent.data.type === ELEMENT_TYPE.GAME) {
              sceneRemovePromises.push(
                api().worlds.saveChildRefsToGame(
                  studioId,
                  game.id,
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
          case ELEMENT_TYPE.PASSAGE:
            await Promise.all([
              api().scenes.saveChildRefsToScene(
                studioId,
                item.data.parentId,
                parent.children.map((childId) => [
                  ELEMENT_TYPE.PASSAGE,
                  childId as ElementId
                ])
              ),
              api().passages.removePassage(studioId, item?.id as ElementId)
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
    logger.info(`StoryworldOutline->OnEditComponentTitle`)

    if (treeData) {
      if (complete && title) {
        logger.info(
          `StoryworldOutline->OnEditComponentTitle->complete && title:'${title}'`
        )

        try {
          switch (treeData.items[componentId].data.type) {
            case ELEMENT_TYPE.FOLDER:
              await api().folders.saveFolderTitle(studioId, componentId, title)
              break
            case ELEMENT_TYPE.SCENE:
              await api().scenes.saveSceneTitle(studioId, componentId, title)
              break
            case ELEMENT_TYPE.PASSAGE:
              await api().passages.savePassageTitle(
                studioId,
                componentId,
                title
              )
              break
            default:
              break
          }
        } catch (error) {
          throw error
        }

        // TODO: updating DB could fail; cache name if need revert on error
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
          renamedComponent: {
            id: componentId,
            newTitle: title || treeData.items[componentId].data.title
          }
        })

        if (
          componentId === editor.selectedGameOutlineComponent.id &&
          title !== editor.selectedGameOutlineComponent.title
        ) {
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              ...editor.selectedGameOutlineComponent,
              title: title || treeData.items[componentId].data.title
            }
          })
        }
      } else {
        logger.info(`StoryworldOutline->OnEditComponentTitle->else`)

        setTreeData(
          mutateTree(treeData, componentId, {
            data: { ...treeData.items[componentId].data, renaming: true }
          })
        )

        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME,
          renamingGameOutlineComponent: { id: componentId, renaming: true }
        })
      }
    }
  }

  function selectComponent() {
    if (treeData) {
      const clonedTreeData = cloneDeep(treeData)

      Object.entries(clonedTreeData.items).map(([componentId, component]) => {
        if (editor.renamingGameOutlineComponent.id) {
          component.data.renaming = false

          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME,
            renamingGameOutlineComponent: { id: undefined, renaming: false }
          })
        }

        component.isExpanded =
          componentId === editor.selectedGameOutlineComponent.id ||
          clonedTreeData.items[componentId].isExpanded

        if (
          componentId &&
          editor.selectedGameOutlineComponent.id &&
          componentId === editor.selectedGameOutlineComponent.id
        ) {
          component.data.title = editor.selectedGameOutlineComponent.title
          component.data.selected = true
        } else {
          component.data.selected = false
        }
      })

      setTreeData(clonedTreeData)
    }
  }

  const selectStoryworld = () => {
    editor.selectedComponentEditorSceneViewPassage &&
      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
        selectedComponentEditorSceneViewPassage: null
      })

    editor.selectedComponentEditorSceneViewJump &&
      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
        selectedComponentEditorSceneViewJump: null
      })

    editor.selectedGameOutlineComponent.id !== game.id &&
      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedGameOutlineComponent: {
          id: game.id,
          expanded: true,
          title: game.title,
          type: ELEMENT_TYPE.GAME
        }
      })
  }

  useEffect(selectComponent, [editor.selectedGameOutlineComponent])

  useEffect(() => {
    async function updateTree() {
      logger.info('StoryworldOutline->editor.savedComponent effect')

      // TODO: Can't we do this better? *hic*
      if (treeData && editor.savedComponent.id) {
        const { id, type } = editor.savedComponent

        switch (type) {
          case ELEMENT_TYPE.PASSAGE:
            const passage = await api().passages.getPassage(studioId, id)

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
                  type: ELEMENT_TYPE.PASSAGE,
                  selected: false,
                  parentId: passage.sceneId,
                  renaming: true
                }
              })

              newTreeData.items[passage.sceneId].data.selected = true

              setTreeData(newTreeData)

              if (editor.selectedGameOutlineComponent.id !== passage.sceneId) {
                const parentScene = treeData.items[passage.sceneId]

                // TODO: sets tree data twice
                editorDispatch({
                  type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
                  selectedGameOutlineComponent: {
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
  }, [editor.savedComponent])

  useEffect(() => {
    logger.info(
      `StoryworldOutline->editor.renamedComponent->useEffect->
       id:${editor.renamedComponent.id} newTitle:'${editor.renamedComponent.newTitle}'`
    )

    if (
      treeData &&
      editor.renamedComponent.id &&
      editor.renamedComponent.newTitle
    ) {
      setTreeData(
        mutateTree(treeData, editor.renamedComponent.id, {
          data: {
            ...treeData.items[editor.renamedComponent.id].data,
            title:
              editor.renamedComponent.newTitle ||
              treeData.items[editor.renamedComponent.id].data.title,
            renaming: false
          }
        })
      )
    }
  }, [editor.renamedComponent])

  useEffect(() => {
    logger.info(`StoryworldOutline->editor.removedComponent->useEffect`)

    if (treeData && editor.removedComponent.id) {
      logger.info(
        `Removing component from outline with ID: ${editor.removedComponent.id}`
      )

      setTreeData(removeItemFromTree(treeData, editor.removedComponent.id))

      if (editor.removedComponent.type !== ELEMENT_TYPE.PASSAGE)
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {
            id: undefined,
            expanded: false,
            type: undefined,
            title: undefined
          }
        })
    }
  }, [editor.removedComponent])

  useEffect(() => {
    if (treeData) {
      logger.info('StoryworldOutline->treeData->useEffect->tree data updated')
    }
  }, [treeData])

  useEffect(() => {
    async function getGameComponents() {
      if (game.id) {
        const folders = await api().folders.getFoldersByGameRef(
            studioId,
            game.id
          ),
          scenes = await api().scenes.getScenesByGameRef(studioId, game.id),
          passages = await api().passages.getPassagesByGameRef(
            studioId,
            game.id
          )

        if (folders && scenes && passages) {
          setTreeData(
            createGameOutlineTreeData(game, folders, scenes, passages)
          )
        } else {
          throw new Error('Unable to build tree data.')
        }
      }
    }

    getGameComponents()
  }, [])

  return (
    <div className={styles.StoryworldOutline}>
      {game.id && treeData && (
        <>
          <TitleBar
            studioId={studioId}
            game={game}
            onAdd={(_, childType: ELEMENT_TYPE) =>
              editor.selectedGameOutlineComponent.id &&
              onAdd(editor.selectedGameOutlineComponent.id, childType)
            }
            onStoryworldSelect={selectStoryworld}
          />

          <div className={styles.tree}>
            {treeData.items[treeData.rootId].hasChildren && (
              <Tree
                tree={treeData}
                renderItem={(item: RenderItemParams) => (
                  <ComponentItem
                    item={item}
                    onSelect={onSelect}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    OnEditComponentTitle={OnEditComponentTitle}
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
                  if (game.id) onAdd(game.id, ELEMENT_TYPE.SCENE)
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

export default StoryworldOutline
