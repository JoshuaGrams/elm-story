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

  const [treeData, setTreeData] = useState<TreeData | undefined>(undefined)

  function onExpand(itemId: React.ReactText) {
    if (treeData)
      setTreeData(mutateTree(treeData, itemId, { isExpanded: true }))
  }

  function onCollapse(itemId: React.ReactText) {
    if (treeData)
      setTreeData(mutateTree(treeData, itemId, { isExpanded: false }))
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
                    onEditName={() => console.log('onEditName')}
                  />
                )}
                onExpand={onExpand}
                onCollapse={onCollapse}
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
