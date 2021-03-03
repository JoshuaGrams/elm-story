import React, { useEffect, useState, useContext, ReactText } from 'react'
import logger from '../../lib/logger'
import createGameMap, { GameMap } from '../../lib/createGameMap'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} from 'unique-names-generator'

import { useChapters, usePassages, useScenes } from '../../hooks'

import { NodeDragEventParams } from 'rc-tree/lib/contextTypes'
import { DataNode, EventDataNode } from 'antd/lib/tree'
import {
  ComponentId,
  COMPONENT_TYPE,
  Game,
  GameId,
  StudioId
} from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Button, Tree, Menu, Dropdown } from 'antd'
import { DownOutlined, PlusOutlined } from '@ant-design/icons'

import api from '../../api'

import styles from './styles.module.less'

const { DirectoryTree } = Tree

function createTreeData({
  gameId,
  gameMap,
  onAddChapter,
  onAddScene,
  onAddPassage
}: {
  gameId: GameId
  gameMap: GameMap
  onAddChapter?: (gameId: GameId) => void
  onAddScene: (gameId: GameId, chapterId: ComponentId) => void
  onAddPassage: (gameId: GameId, sceneId: ComponentId) => void
}): DataNode[] {
  // only 1 game open is supported in editor
  const treeData: DataNode[] = []
  let rootGameId: string = gameId

  treeData.push({
    title: (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item
              key="add-chapter"
              onClick={() => {
                if (onAddChapter) onAddChapter(rootGameId)
              }}
            >
              Add Chapter
            </Menu.Item>
            <Menu.Item>Edit...</Menu.Item>
          </Menu>
        }
        trigger={['contextMenu']}
      >
        <span className={styles.nodeRow}>
          {gameMap[rootGameId].title}{' '}
          <Button
            size="small"
            className={styles.addButton}
            onClick={(event) => {
              event.stopPropagation()
              if (onAddChapter) onAddChapter(rootGameId)
            }}
          >
            <PlusOutlined style={{ fontSize: '11px' }} />
          </Button>
        </span>
      </Dropdown>
    ),
    key: rootGameId,
    children: []
  })

  Object.entries(gameMap).map(([componentId, component]) => {
    switch (component.type) {
      case COMPONENT_TYPE.GAME:
        break
      case COMPONENT_TYPE.CHAPTER:
        treeData[0]?.children?.push({
          title: (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="add-scene"
                    onClick={() => {
                      if (onAddScene) onAddScene(rootGameId, componentId)
                    }}
                  >
                    Add Scene
                  </Menu.Item>
                </Menu>
              }
              trigger={['contextMenu']}
            >
              <span className={styles.nodeRow}>
                {component.title}{' '}
                <Button
                  size="small"
                  className={styles.addButton}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (onAddScene) onAddScene(rootGameId, componentId)
                  }}
                >
                  <PlusOutlined style={{ fontSize: '11px' }} />
                </Button>
              </span>
            </Dropdown>
          ),
          key: componentId,
          children: []
        })

        break
      case COMPONENT_TYPE.SCENE:
        treeData[0]?.children?.map((chapter) => {
          if (component.parentId === chapter.key) {
            chapter.children?.push({
              title: (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="add-passage"
                        onClick={() => {
                          if (onAddPassage)
                            onAddPassage(rootGameId, componentId)
                        }}
                      >
                        Add Passage
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['contextMenu']}
                >
                  <span className={styles.nodeRow}>
                    {component.title}{' '}
                    <Button
                      size="small"
                      className={styles.addButton}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (onAddPassage) onAddPassage(rootGameId, componentId)
                      }}
                    >
                      <PlusOutlined style={{ fontSize: '11px' }} />
                    </Button>
                  </span>
                </Dropdown>
              ),
              key: componentId,
              children: []
            })
          }
        })

        break
      case COMPONENT_TYPE.PASSAGE:
        treeData[0]?.children?.map((chapter) => {
          chapter.children?.map((scene) => {
            if (component.parentId === scene.key) {
              scene.children?.push({
                title: component.title,
                key: componentId,
                children: [],
                isLeaf: true
              })
            }
          })
        })

        break
      default:
        logger.info('Unknown component type.')
        break
    }
  })

  return treeData
}

// TODO: persist expanded keys with editor context
const GameOutline: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  const chapters = game.id ? useChapters(studioId, game.id) : undefined,
    scenes = game.id ? useScenes(studioId, game.id) : undefined,
    passages = game.id ? usePassages(studioId, game.id) : undefined

  const [gameMap, setGameMap] = useState<GameMap | undefined>(undefined)
  const [treeData, setTreeData] = useState<DataNode[] | undefined>(undefined)

  function onSelect(
    selectedKeys: React.Key[],
    info: {
      event: 'select'
      selected: boolean
      node: EventDataNode
      selectedNodes: DataNode[]
      nativeEvent: MouseEvent
    }
  ) {
    editorDispatch({
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
      selectedComponentId: selectedKeys[0].toString()
    })
  }

  function onExpand(
    keys: React.Key[],
    info: {
      expanded: boolean
    }
  ) {
    const _ids = keys.map((key) => key.toString())

    if (info?.expanded) {
      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND,
        expandedComponentIds: [
          ...editor.expandedGameOutlineComponentIds,
          ..._ids.filter(
            (id) => !editor.expandedGameOutlineComponentIds.includes(id)
          )
        ]
      })
    } else {
      if (game.id) {
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND,
          expandedComponentIds: [
            ...editor.expandedGameOutlineComponentIds.filter((id) =>
              _ids.includes(id)
            ),
            ...(!_ids.includes(game.id) ? [game.id] : [])
          ]
        })
      }
    }
  }

  function onDragStart(info: NodeDragEventParams<HTMLDivElement>) {
    console.log('Dragging: ' + info.node.key)
  }

  function onDragEnter(
    info: NodeDragEventParams<HTMLDivElement> & {
      expandedKeys: React.Key[]
    }
  ) {
    console.log('Dragging over: ' + info.node.key)
  }

  function onDrop(
    info: NodeDragEventParams<HTMLDivElement> & {
      dragNode: EventDataNode
      dragNodesKeys: React.Key[]
      dropPosition: number
      dropToGap: boolean
    }
  ) {
    console.log(info)
    console.log('Dragged node: ' + info.dragNode.key)
    console.log('to: ' + info.node.key)
    console.log('at position: ' + info.dropPosition)
    // dropPosition 0 is top of children and length is last
    // dropToGap true if not nested?
  }

  // TODO: select key of new component
  async function onAddChapter(gameId: GameId) {
    try {
      const chapterId = await api().chapters.saveChapter(studioId, {
        gameId,
        tags: [],
        title: `Chapter ${uniqueNamesGenerator({
          dictionaries: [adjectives, animals, colors],
          length: 1
        }).toUpperCase()}`
      })

      setTimeout(() => {
        onExpand([chapterId], { expanded: true })

        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedComponentId: chapterId
        })
      }, 50)
    } catch (error) {
      throw new Error(error)
    }
  }

  async function onAddScene(gameId: GameId, chapterId: ComponentId) {
    try {
      const sceneId = await api().scenes.saveScene(studioId, {
        gameId,
        chapterId,
        tags: [],
        title: `Scene ${uniqueNamesGenerator({
          dictionaries: [adjectives, animals, colors],
          length: 1
        }).toUpperCase()}`
      })

      setTimeout(() => {
        onExpand([chapterId, sceneId], { expanded: true })

        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedComponentId: sceneId
        })
      }, 50)
    } catch (error) {
      throw new Error(error)
    }
  }

  async function onAddPassage(gameId: GameId, sceneId: ComponentId) {
    try {
      const passageId = await api().passages.savePassage(studioId, {
        gameId,
        sceneId,
        tags: [],
        title: `Passage ${uniqueNamesGenerator({
          dictionaries: [adjectives, animals, colors],
          length: 1
        }).toUpperCase()}`,
        content: ''
      })

      setTimeout(() => {
        onExpand([sceneId, passageId], { expanded: true })

        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedComponentId: passageId
        })
      }, 50)
    } catch (error) {
      throw new Error(error)
    }
  }

  useEffect(() => {
    if (game.id) {
      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedComponentId: game.id
      })

      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND,
        expandedComponentIds: [game.id]
      })
    }
  }, [game.id])

  useEffect(() => {
    if (chapters && scenes && passages) {
      setGameMap(createGameMap(game, chapters, scenes, passages))
    }
  }, [chapters, scenes, passages])

  useEffect(() => {
    if (game.id && gameMap)
      setTreeData(
        createTreeData({
          gameId: game.id,
          gameMap,
          onAddChapter,
          onAddScene,
          onAddPassage
        })
      )
  }, [gameMap])

  return (
    <div className={styles.componentTree}>
      {chapters && scenes && passages && (
        <>
          <Button
            onClick={() => {
              if (game.id) {
                editorDispatch({
                  type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
                  selectedComponentId: game.id
                })

                editorDispatch({
                  type: EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND,
                  expandedComponentIds: [game.id]
                })
              }
            }}
          >
            collapse all
          </Button>
          {treeData && (
            <DirectoryTree
              showLine
              switcherIcon={<DownOutlined />}
              treeData={treeData}
              onSelect={onSelect}
              selectedKeys={[
                editor.selectedGameOutlineComponentId as ReactText
              ]}
              expandedKeys={editor.expandedGameOutlineComponentIds}
              draggable
              expandAction="doubleClick"
              onExpand={onExpand}
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
              onDrop={onDrop}
            />
          )}
        </>
      )}
    </div>
  )
}

export default GameOutline
