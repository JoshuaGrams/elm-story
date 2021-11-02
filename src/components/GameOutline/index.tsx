import logger from '../../lib/logger'
import { cloneDeep } from 'lodash-es'
import createGameOutlineTreeData from '../../lib/createGameOutlineTreeData'

import React, { useContext, useEffect, useState } from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  Game,
  PASSAGE_TYPE,
  SceneChildRefs,
  StudioId
} from '../../data/types'
import { DEFAULT_NODE_SIZE } from '../ComponentEditor/SceneView'

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

export type OnSelectComponent = (componentId: ComponentId) => void
export type OnAddComponent = (
  parentComponentId: ComponentId,
  childType: COMPONENT_TYPE
) => void
export type OnRemoveComponent = (componentId: ComponentId) => void
export type OnEditComponentTitle = (
  componentId: ComponentId,
  title: string | undefined,
  complete: boolean | false
) => void

const addItemToTree = (
  treeData: TreeData,
  parentId: ComponentId,
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
  itemId: ComponentId
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

const GameOutline: React.FC<{ studioId: StudioId; game: Game }> = ({
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
    logger.info(`GameOutline->onDragStart->${itemId}`)

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
        (movingComponent.data.type === COMPONENT_TYPE.FOLDER &&
          destinationParent.data.type === COMPONENT_TYPE.GAME) ||
        (movingComponent.data.type === COMPONENT_TYPE.FOLDER &&
          destinationParent.data.type === COMPONENT_TYPE.FOLDER) ||
        // scene to game or folder
        (movingComponent.data.type === COMPONENT_TYPE.SCENE &&
          destinationParent.data.type === COMPONENT_TYPE.GAME) ||
        (movingComponent.data.type === COMPONENT_TYPE.SCENE &&
          destinationParent.data.type === COMPONENT_TYPE.FOLDER))
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
            case COMPONENT_TYPE.FOLDER:
              const folderPromises: Promise<void>[] = []

              if (
                sourceParent.data.type === COMPONENT_TYPE.GAME ||
                destinationParent.data.type === COMPONENT_TYPE.GAME
              ) {
                folderPromises.push(
                  api().games.saveChildRefsToGame(
                    studioId,
                    game.id,
                    newTreeData.items[game.id].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ComponentId
                    ])
                  )
                )
              }

              if (sourceParent.data.type === COMPONENT_TYPE.FOLDER) {
                folderPromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    sourceParent.id as ComponentId,
                    newTreeData.items[
                      sourceParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ComponentId
                    ])
                  )
                )
              }

              if (destinationParent.data.type === COMPONENT_TYPE.FOLDER) {
                folderPromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    destinationParent.id as ComponentId,
                    newTreeData.items[
                      destinationParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ComponentId
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
                    COMPONENT_TYPE.GAME
                      ? null
                      : (destinationParent.id as ComponentId)
                  ],
                  movingComponent.id as ComponentId
                )
              )

              await Promise.all(folderPromises)

              break
            case COMPONENT_TYPE.SCENE:
              const scenePromises: Promise<void>[] = []

              if (
                sourceParent.data.type === COMPONENT_TYPE.GAME ||
                destinationParent.data.type === COMPONENT_TYPE.GAME
              ) {
                scenePromises.push(
                  api().games.saveChildRefsToGame(
                    studioId,
                    game.id,
                    newTreeData.items[game.id].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ComponentId
                    ])
                  )
                )
              }

              if (sourceParent.data.type === COMPONENT_TYPE.FOLDER) {
                scenePromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    sourceParent.id as ComponentId,
                    newTreeData.items[
                      sourceParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ComponentId
                    ])
                  )
                )
              }

              if (destinationParent.data.type === COMPONENT_TYPE.FOLDER) {
                scenePromises.push(
                  api().folders.saveChildRefsToFolder(
                    studioId,
                    destinationParent.id as ComponentId,
                    newTreeData.items[
                      destinationParent.id
                    ].children.map((childId) => [
                      newTreeData.items[childId].data.type,
                      childId as ComponentId
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
                    COMPONENT_TYPE.GAME
                      ? null
                      : (destinationParent.id as ComponentId)
                  ],
                  movingComponent.id as ComponentId
                )
              )

              await Promise.all(scenePromises)

              break
            case COMPONENT_TYPE.PASSAGE:
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
                  movingComponent.id as ComponentId
                )
              }

              await Promise.all([
                api().passages.saveSceneRefToPassage(
                  studioId,
                  destinationParent.id as ComponentId,
                  movingComponent.id as ComponentId
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  sourceParent.id as ComponentId,
                  newTreeData.items[sourceParent.id].children.map((childId) => [
                    COMPONENT_TYPE.PASSAGE,
                    childId as ComponentId
                  ])
                ),
                api().scenes.saveChildRefsToScene(
                  studioId,
                  destinationParent.id as ComponentId,
                  newTreeData.items[
                    destinationParent.id
                  ].children.map((childId) => [
                    COMPONENT_TYPE.PASSAGE,
                    childId as ComponentId
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

  function onSelect(componentId: ComponentId) {
    if (treeData) {
      const {
        id,
        data: { type, title, parentId }
      } = treeData.items[componentId]

      if (type === COMPONENT_TYPE.PASSAGE) {
        const parentItem = treeData.items[parentId]

        if (editor.selectedGameOutlineComponent.id !== parentItem.id)
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: parentItem.id as ComponentId,
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
                selectedComponentEditorSceneViewPassage: id as ComponentId
              }),
            1
          )
      }

      if (type !== COMPONENT_TYPE.PASSAGE) {
        if (COMPONENT_TYPE.GAME || COMPONENT_TYPE.FOLDER) {
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
            id: id as ComponentId,
            type,
            expanded: true,
            title
          }
        })
      }
    }
  }

  async function onAdd(
    parentComponentId: ComponentId,
    childType: COMPONENT_TYPE
  ) {
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
        case COMPONENT_TYPE.GAME:
          if (
            childType === COMPONENT_TYPE.SCENE ||
            childType === COMPONENT_TYPE.FOLDER
          ) {
            let childId: ComponentId,
              childTitle: string =
                childType === COMPONENT_TYPE.SCENE
                  ? 'Untitled Scene'
                  : 'Untitled Folder'

            try {
              childId =
                childType === COMPONENT_TYPE.SCENE
                  ? await api().scenes.saveScene(studioId, {
                      children: [],
                      gameId: game.id,
                      jumps: [],
                      parent: [COMPONENT_TYPE.GAME, null],
                      tags: [],
                      title: childTitle,
                      editor: {}
                    })
                  : await api().folders.saveFolder(studioId, {
                      children: [],
                      gameId: game.id,
                      parent: [COMPONENT_TYPE.GAME, null],
                      tags: [],
                      title: childTitle
                    })
            } catch (error) {
              throw error
            }

            parentItem.hasChildren = true

            newTreeData = addItemToTree(
              treeData,
              parentItem.id as ComponentId,
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
                  parentId: parentItem.id,
                  renaming: true
                }
              }
            )

            try {
              await api().games.saveChildRefsToGame(
                studioId,
                game.id,
                newTreeData.items[parentItem.id].children.map((childId) => [
                  newTreeData.items[childId].data.type,
                  childId as ComponentId
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
        case COMPONENT_TYPE.FOLDER:
          let childId: ComponentId | undefined = undefined,
            childTitle: string | undefined = undefined

          try {
            if (childType === COMPONENT_TYPE.FOLDER) {
              childTitle = 'Untitled Folder'

              childId = await api().folders.saveFolder(studioId, {
                children: [],
                gameId: game.id,
                parent: [parentItem.data.type, parentItem.id as ComponentId],
                tags: [],
                title: childTitle
              })
            }

            if (childType === COMPONENT_TYPE.SCENE) {
              childTitle = 'Untitled Scene'

              childId = await api().scenes.saveScene(studioId, {
                children: [],
                gameId: game.id,
                jumps: [],
                title: childTitle,
                parent: [parentItem.data.type, parentItem.id as ComponentId],
                tags: []
              })
            }
          } catch (error) {
            throw error
          }

          parentItem.hasChildren = true

          if (childId && childTitle) {
            newTreeData = addItemToTree(
              treeData,
              parentItem.id as ComponentId,
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
                  parentId: parentItem.id,
                  renaming: true
                }
              }
            )

            try {
              await api().folders.saveChildRefsToFolder(
                studioId,
                parentItem.id as ComponentId,
                newTreeData.items[parentItem.id].children.map((childId) => [
                  newTreeData.items[childId].data.type,
                  childId as ComponentId
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
        case COMPONENT_TYPE.SCENE:
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
              title: 'Untitled Passage',
              type: PASSAGE_TYPE.CHOICE,
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
                COMPONENT_TYPE.PASSAGE,
                childId as ComponentId
              ])

              await api().scenes.saveChildRefsToScene(
                studioId,
                parentItem.id as ComponentId,
                [...sceneChildren, [COMPONENT_TYPE.PASSAGE, passage.id]]
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
                type: COMPONENT_TYPE.PASSAGE
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

  async function onRemove(componentId: ComponentId) {
    logger.info(`GameOutline->onRemove->${componentId}`)

    const item = treeData?.items[componentId],
      data = item?.data

    if (game.id && item && treeData) {
      const newTreeData = removeItemFromTree(treeData, item.id as ComponentId),
        parent = newTreeData.items[item.data.parentId]

      if (
        data.type === COMPONENT_TYPE.PASSAGE ||
        (data.type === COMPONENT_TYPE.SCENE &&
          editor.selectedComponentEditorSceneViewPassage &&
          item.children.includes(
            editor.selectedComponentEditorSceneViewPassage
          ))
      )
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
          selectedComponentEditorSceneViewPassage: null
        })

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE,
        removedComponent: { id: componentId, type: data.type }
      })

      try {
        switch (data.type) {
          case COMPONENT_TYPE.FOLDER:
            await Promise.all([
              await api().games.saveChildRefsToGame(
                studioId,
                game.id,
                parent.children.map((childId) => [
                  newTreeData.items[childId].data.type,
                  childId as ComponentId
                ])
              ),
              await api().folders.removeFolder(studioId, componentId)
            ])
            break
          case COMPONENT_TYPE.SCENE:
            const sceneRemovePromises: Promise<void>[] = []

            if (parent.data.type === COMPONENT_TYPE.GAME) {
              sceneRemovePromises.push(
                api().games.saveChildRefsToGame(
                  studioId,
                  game.id,
                  parent.children.map((childId) => [
                    newTreeData.items[childId].data.type,
                    childId as ComponentId
                  ])
                )
              )
            }

            if (parent.data.type === COMPONENT_TYPE.FOLDER) {
              sceneRemovePromises.push(
                api().folders.saveChildRefsToFolder(
                  studioId,
                  item.data.parentId,
                  parent.children.map((childId) => [
                    newTreeData.items[childId].data.type,
                    childId as ComponentId
                  ])
                )
              )
            }

            sceneRemovePromises.push(
              api().scenes.removeScene(studioId, componentId)
            )

            await Promise.all(sceneRemovePromises)

            break
          case COMPONENT_TYPE.PASSAGE:
            await Promise.all([
              api().scenes.saveChildRefsToScene(
                studioId,
                item.data.parentId,
                parent.children.map((childId) => [
                  COMPONENT_TYPE.PASSAGE,
                  childId as ComponentId
                ])
              ),
              api().passages.removePassage(studioId, item?.id as ComponentId)
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
    componentId: ComponentId,
    title: string | undefined,
    complete: boolean
  ) {
    logger.info(`GameOutline->OnEditComponentTitle`)

    if (treeData) {
      if (complete && title) {
        logger.info(
          `GameOutline->OnEditComponentTitle->complete && title:'${title}'`
        )

        try {
          switch (treeData.items[componentId].data.type) {
            case COMPONENT_TYPE.FOLDER:
              await api().folders.saveFolderTitle(studioId, componentId, title)
              break
            case COMPONENT_TYPE.SCENE:
              await api().scenes.saveSceneTitle(studioId, componentId, title)
              break
            case COMPONENT_TYPE.PASSAGE:
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
        logger.info(`GameOutline->OnEditComponentTitle->else`)

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

  useEffect(selectComponent, [editor.selectedGameOutlineComponent])

  useEffect(() => {
    async function updateTree() {
      logger.info('GameOutline->editor.savedComponent effect')

      // TODO: Can't we do this better? *hic*
      if (treeData && editor.savedComponent.id) {
        const { id, type } = editor.savedComponent

        switch (type) {
          case COMPONENT_TYPE.PASSAGE:
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
                  title: 'Untitled Passage',
                  type: COMPONENT_TYPE.PASSAGE,
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
                    id: parentScene.id as ComponentId,
                    expanded: true,
                    type: COMPONENT_TYPE.SCENE,
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
      `GameOutline->editor.renamedComponent->useEffect->
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
    logger.info(`GameOutline->editor.removedComponent->useEffect`)

    if (treeData && editor.removedComponent.id) {
      logger.info(
        `Removing component from outline with ID: ${editor.removedComponent.id}`
      )

      setTreeData(removeItemFromTree(treeData, editor.removedComponent.id))

      if (editor.removedComponent.type !== COMPONENT_TYPE.PASSAGE)
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
      logger.info('GameOutline->treeData->useEffect->tree data updated')
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
    <div className={styles.GameOutline}>
      {game.id && treeData && (
        <>
          <TitleBar
            studioId={studioId}
            game={game}
            onAdd={(_, childType: COMPONENT_TYPE) =>
              editor.selectedGameOutlineComponent.id &&
              onAdd(editor.selectedGameOutlineComponent.id, childType)
            }
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
                  if (game.id) onAdd(game.id, COMPONENT_TYPE.SCENE)
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

export default GameOutline
