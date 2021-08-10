import logger from '../../lib/logger'
import { cloneDeep } from 'lodash-es'
import createGameOutlineTreeData from '../../lib/createGameOutlineTreeData'

import React, { useContext, useEffect, useState } from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  Game,
  GameId,
  StudioId
} from '../../data/types'

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

const GameOutlineNext: React.FC<{ studioId: StudioId; game: Game }> = ({
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
            onAdd={(gameId: GameId, type: COMPONENT_TYPE) =>
              logger.info(`GameOutlineNext->onAdd:${gameId}|${type}`)
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
                    onAdd={() => console.log('onAdd')}
                    onRemove={() => console.log('onRemove')}
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

export default GameOutlineNext
