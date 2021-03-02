import React, { useEffect, useState } from 'react'
import logger from '../../lib/logger'

import { NodeDragEventParams } from 'rc-tree/lib/contextTypes'
import { DataNode, EventDataNode } from 'antd/lib/tree'
import {
  ComponentId,
  COMPONENT_TYPE,
  Game,
  GameId,
  StudioId,
  Chapter,
  Scene,
  Passage
} from '../../data/types'

import { Button, Tree, Menu, Dropdown } from 'antd'
import { DownOutlined, PlusOutlined } from '@ant-design/icons'

import styles from './styles.module.less'
import { useChapters, usePassages, useScenes } from '../../hooks'
import api from '../../api'

const { DirectoryTree } = Tree

// denormalize game, chapter, scene and passage components to flat map
// position is editor specific data
interface GameMap {
  [componentId: string]: {
    type: COMPONENT_TYPE
    title: string
    parentId?: ComponentId
  }
}

function createGameMap(
  game: Game,
  chapters: Chapter[],
  scenes: Scene[],
  passages: Passage[]
): GameMap {
  const gameMap: GameMap = {}

  if (game.id) {
    gameMap[game.id] = {
      type: COMPONENT_TYPE.GAME,
      title: game.title
    }
  }

  chapters.map((chapter) => {
    if (chapter.id) {
      gameMap[chapter.id] = {
        type: COMPONENT_TYPE.CHAPTER,
        title: chapter.title
      }
    }
  })

  scenes.map((scene) => {
    if (scene.id) {
      gameMap[scene.id] = {
        type: COMPONENT_TYPE.SCENE,
        title: scene.title,
        parentId: scene.chapterId
      }
    }
  })

  passages.map((passage) => {
    if (passage.id) {
      gameMap[passage.id] = {
        type: COMPONENT_TYPE.PASSAGE,
        title: passage.title,
        parentId: passage.sceneId
      }
    }
  })

  return gameMap
}

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
  const chapters = game.id ? useChapters(studioId, game.id) : undefined,
    scenes = game.id ? useScenes(studioId, game.id) : undefined,
    passages = game.id ? usePassages(studioId, game.id) : undefined

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['game-id'])
  const [gameMap, setGameMap] = useState<GameMap | undefined>(undefined)
  const [treeData, setTreeData] = useState<DataNode[] | undefined>(undefined)

  useEffect(() => {
    if (chapters && scenes && passages) {
      setGameMap(createGameMap(game, chapters, scenes, passages))
    }
  }, [chapters, scenes, passages])

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
    // multiple select is not yet supported
    console.log(selectedKeys[0])
    console.log(info)
  }

  function onExpand(
    keys: React.Key[],
    info: {
      node: EventDataNode
      expanded: boolean
      nativeEvent: MouseEvent
    }
  ) {
    if (info.expanded) {
      setExpandedKeys([
        ...expandedKeys,
        ...keys.filter((key) => !expandedKeys.includes(key))
      ])
    } else {
      setExpandedKeys([
        ...expandedKeys.filter((key) => keys.includes(key)),
        'game-id'
      ])
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

  useEffect(() => {
    if (game.id && gameMap)
      setTreeData(
        createTreeData({
          gameId: game.id,
          gameMap,
          // TODO: select key of new component
          onAddChapter: async (gameId) => {
            try {
              const chapterId = await api().chapters.saveChapter(studioId, {
                gameId,
                tags: [],
                title: 'New Chapter'
              })

              console.log(chapterId)
            } catch (error) {
              console.log(error)
            }
          },
          onAddScene: async (gameId, chapterId) => {
            try {
              const sceneId = await api().scenes.saveScene(studioId, {
                gameId,
                chapterId,
                tags: [],
                title: 'New Scene'
              })

              console.log(sceneId)
            } catch (error) {
              console.log(error)
            }
          },
          onAddPassage: async (gameId, sceneId) => {
            try {
              const passageId = await api().passages.savePassage(studioId, {
                gameId,
                sceneId,
                tags: [],
                title: 'New Passage',
                content: ''
              })

              console.log(passageId)
            } catch (error) {
              console.log(error)
            }
          }
        })
      )
  }, [gameMap])

  return (
    <div className={styles.componentTree}>
      {chapters && scenes && passages && (
        <>
          <Button onClick={() => setExpandedKeys(['game-id'])}>
            collapse all
          </Button>
          {treeData && (
            <DirectoryTree
              showLine
              switcherIcon={<DownOutlined />}
              treeData={treeData}
              onSelect={onSelect}
              expandedKeys={expandedKeys}
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
