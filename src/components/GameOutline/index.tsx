import logger from '../../lib/logger'
import { cloneDeep } from 'lodash-es'
import createGameOutlineTreeData from '../../lib/createGameOutlineTreeData'

import React, { useContext, useEffect, useState } from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  Game,
  GameId,
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

import TitleBar from './TitleBar'
import ComponentItem from './ComponentItem'

import styles from './styles.module.less'

import api from '../../api'

export type OnAddComponent = (gameId: GameId, type: COMPONENT_TYPE) => void

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
      sourceParent.data.type === destinationParent.data.type
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

      movingComponent.data.selected =
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
              await api().games.saveChildRefsToGame(
                studioId,
                game.id,
                newTreeData.items[
                  destinationParent.id
                ].children.map((childId) => [
                  COMPONENT_TYPE.FOLDER,
                  childId as ComponentId
                ])
              )
              break
            case COMPONENT_TYPE.SCENE:
              if (sourceParent.id !== destinationParent.id) {
                const jumps = await api().jumps.getJumpsBySceneRef(
                  studioId,
                  movingComponent.id as string
                )

                await Promise.all(
                  jumps.map(
                    async (jump) =>
                      jump.id &&
                      (await api().jumps.saveJumpRoute(studioId, jump.id, [
                        jump.route[0]
                      ]))
                  )
                )
              }

              await Promise.all([
                api().scenes.saveParentRefToScene(
                  studioId,
                  [COMPONENT_TYPE.FOLDER, destinationParent.id as ComponentId],
                  movingComponent.id as ComponentId
                ),
                api().folders.saveChildRefsToFolder(
                  studioId,
                  sourceParent.id as ComponentId,
                  newTreeData.items[sourceParent.id].children.map((childId) => [
                    COMPONENT_TYPE.SCENE,
                    childId as ComponentId
                  ])
                ),
                api().folders.saveChildRefsToFolder(
                  studioId,
                  destinationParent.id as ComponentId,
                  newTreeData.items[
                    destinationParent.id
                  ].children.map((childId) => [
                    COMPONENT_TYPE.SCENE,
                    childId as ComponentId
                  ])
                )
              ])
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
          throw new Error(error)
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
        data: { type, title }
      } = treeData.items[componentId]

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

  async function onAdd(componentId: ComponentId) {
    const item = treeData?.items[componentId]

    if (treeData && item && game.id) {
      const data = item.data
      let newTreeData = undefined

      if (editor.selectedGameOutlineComponent.id)
        treeData.items[
          editor.selectedGameOutlineComponent.id
        ].data.selected = false

      switch (data.type) {
        // add folder
        case COMPONENT_TYPE.GAME:
          let folderId = undefined

          try {
            folderId = await api().folders.saveFolder(studioId, {
              children: [],
              gameId: game.id,
              parent: [COMPONENT_TYPE.GAME, null],
              title: 'Untitled Folder',
              tags: []
            })
          } catch (error) {
            throw error
          }

          item.hasChildren = true

          newTreeData = addItemToTree(treeData, item.id as ComponentId, {
            id: folderId,
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: 'Untitled Folder',
              type: COMPONENT_TYPE.FOLDER,
              selected: false,
              parentId: item.id,
              renaming: true
            }
          })

          try {
            await api().games.saveChildRefsToGame(
              studioId,
              game.id,
              newTreeData.items[item.id].children.map((childId) => [
                COMPONENT_TYPE.FOLDER,
                childId as ComponentId
              ])
            )
          } catch (error) {
            throw new Error(error)
          }

          setTreeData(newTreeData)

          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: folderId,
              expanded: true,
              type: COMPONENT_TYPE.FOLDER,
              title: 'Untitled Folder'
            }
          })

          break
        // add scene
        case COMPONENT_TYPE.FOLDER:
          let sceneId = undefined

          try {
            sceneId = await api().scenes.saveScene(studioId, {
              children: [],
              gameId: game.id,
              jumps: [],
              title: 'Untitled Scene',
              parent: [COMPONENT_TYPE.FOLDER, item.id as ComponentId],
              tags: []
            })
          } catch (error) {
            throw new Error(error)
          }

          item.hasChildren = true

          newTreeData = addItemToTree(treeData, item.id as ComponentId, {
            id: sceneId,
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: 'Untitled Scene',
              type: COMPONENT_TYPE.SCENE,
              selected: false,
              parentId: item.id,
              renaming: true
            }
          })

          try {
            await api().folders.saveChildRefsToFolder(
              studioId,
              item.id as ComponentId,
              newTreeData.items[item.id].children.map((childId) => [
                COMPONENT_TYPE.SCENE,
                childId as ComponentId
              ])
            )
          } catch (error) {
            throw new Error(error)
          }

          setTreeData(newTreeData)

          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: sceneId,
              expanded: true,
              type: COMPONENT_TYPE.SCENE,
              title: 'Untitled Scene'
            }
          })

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
              gameId: game.id,
              sceneId: item.id as string,
              title: 'Untitled Passage',

              tags: []
            })
          } catch (error) {
            throw new Error(error)
          }

          item.hasChildren = true

          if (passage.id) {
            newTreeData = addItemToTree(treeData, item.id as ComponentId, {
              id: passage.id,
              children: [],
              isExpanded: false,
              hasChildren: false,
              isChildrenLoading: false,
              data: {
                title: 'Untitled Passage',
                type: COMPONENT_TYPE.PASSAGE,
                selected: false,
                parentId: item.id,
                renaming: true
              }
            })

            try {
              await api().scenes.saveChildRefsToScene(
                studioId,
                item.id as ComponentId,
                newTreeData.items[item.id].children.map((childId) => [
                  COMPONENT_TYPE.PASSAGE,
                  childId as ComponentId
                ])
              )
            } catch (error) {
              throw new Error(error)
            }

            setTreeData(newTreeData)

            editorDispatch({
              type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
              selectedGameOutlineComponent: {
                id: passage.id,
                expanded: true,
                type: COMPONENT_TYPE.PASSAGE,
                title: 'Untitled Passage'
              }
            })
          }

          break
        default:
          break
      }

      logger.info(`adding component to tree with id '${componentId}'`)
    }
  }

  async function onRemove(componentId: ComponentId) {
    logger.info(`GameOutline->onRemove->${componentId}`)

    const item = treeData?.items[componentId],
      data = item?.data

    if (game.id && item && treeData) {
      const newTreeData = removeItemFromTree(treeData, item.id as ComponentId)

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
                newTreeData.items[
                  item.data.parentId
                ].children.map((childId) => [
                  COMPONENT_TYPE.FOLDER,
                  childId as ComponentId
                ])
              ),
              await api().folders.removeFolder(studioId, componentId)
            ])
            break
          case COMPONENT_TYPE.SCENE:
            await Promise.all([
              api().folders.saveChildRefsToFolder(
                studioId,
                item.data.parentId,
                newTreeData.items[
                  item.data.parentId
                ].children.map((childId) => [
                  COMPONENT_TYPE.SCENE,
                  childId as ComponentId
                ])
              ),
              api().scenes.removeScene(studioId, componentId)
            ])
            break
          case COMPONENT_TYPE.PASSAGE:
            await Promise.all([
              api().scenes.saveChildRefsToScene(
                studioId,
                item.data.parentId,
                newTreeData.items[
                  item.data.parentId
                ].children.map((childId) => [
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
        throw new Error(error)
      }
    }
  }

  async function onEditTitle(
    componentId: ComponentId,
    title: string | undefined,
    complete: boolean
  ) {
    logger.info(`GameOutline->onEditTitle`)

    if (treeData) {
      if (complete && title) {
        logger.info(`GameOutline->onEditTitle->complete && title:'${title}'`)

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
          throw new Error(error)
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
        logger.info(`GameOutline->onEditTitle->else`)

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
              setTreeData(
                addItemToTree(treeData, passage.sceneId, {
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
              )
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
            onAdd={() =>
              editor.selectedGameOutlineComponent.id &&
              onAdd(editor.selectedGameOutlineComponent.id)
            }
          />

          {treeData.items[treeData.rootId].hasChildren && (
            <div className={styles.tree}>
              <Tree
                tree={treeData}
                renderItem={(item: RenderItemParams) => (
                  <ComponentItem
                    item={item}
                    onSelect={onSelect}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onEditTitle={onEditTitle}
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
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GameOutline
