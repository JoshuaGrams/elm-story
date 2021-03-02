import React, { useEffect, useState } from 'react'
import logger from '../../lib/logger'

import { NodeDragEventParams } from 'rc-tree/lib/contextTypes'
import { DataNode, EventDataNode } from 'antd/lib/tree'
import { ComponentId, COMPONENT_TYPE } from '../../data/types'

import { Button, Tree, Menu, Dropdown } from 'antd'
import { DownOutlined, PlusOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

const { DirectoryTree } = Tree

// keep track of nodes and their types

interface ComponentTreeProps {}

// denormalize game, chapter, scene and passage components to flat map
// position is editor specific data
interface GameMap {
  [componentId: string]: {
    type: COMPONENT_TYPE
    title: string
    position: number
    parent?: ComponentId
  }
}

function createGameMap(): GameMap {
  return {
    'game-id': {
      type: COMPONENT_TYPE.GAME,
      title: 'Pulp Fiction',
      position: 0
    },
    'chapter-1-id': {
      type: COMPONENT_TYPE.CHAPTER,
      title: 'Chapter 1',

      position: 0,
      parent: 'game-id'
    },
    'chapter-2-id': {
      type: COMPONENT_TYPE.CHAPTER,
      title: 'Chapter 2',
      position: 1,
      parent: 'game-id'
    },
    'scene-1-id': {
      type: COMPONENT_TYPE.SCENE,
      title: 'Scene 1',
      position: 0,
      parent: 'chapter-1-id'
    },
    'scene-2-id': {
      type: COMPONENT_TYPE.SCENE,
      title: 'Scene 2',
      position: 1,
      parent: 'chapter-1-id'
    },
    'scene-3-id': {
      type: COMPONENT_TYPE.SCENE,
      title: 'Scene 3',
      position: 1,
      parent: 'chapter-2-id'
    },
    'scene-4-id': {
      type: COMPONENT_TYPE.SCENE,
      title: 'Scene 4',
      position: 1,
      parent: 'chapter-2-id'
    },
    'passage-1-id': {
      type: COMPONENT_TYPE.PASSAGE,
      title: 'Passage 1',
      position: 0,
      parent: 'scene-1-id'
    },
    'passage-2-id': {
      type: COMPONENT_TYPE.PASSAGE,
      title: 'Passage 2',
      position: 1,
      parent: 'scene-1-id'
    },
    'passage-3-id': {
      type: COMPONENT_TYPE.PASSAGE,
      title: 'Passage 3',
      position: 2,
      parent: 'scene-1-id'
    },
    'passage-4-id': {
      type: COMPONENT_TYPE.PASSAGE,
      title: 'Passage 4',
      position: 0,
      parent: 'scene-2-id'
    },
    'passage-5-id': {
      type: COMPONENT_TYPE.PASSAGE,
      title: 'Passage 5',
      position: 0,
      parent: 'scene-4-id'
    }
  }
}

function createTreeData({
  gameMap,
  onAddChapter,
  onAddScene,
  onAddPassage
}: {
  gameMap: GameMap
  onAddChapter?: (gameId: ComponentId) => void
  onAddScene: (chapterId: ComponentId) => void
  onAddPassage: (sceneId: ComponentId) => void
}): DataNode[] {
  // only 1 game open is supported in editor
  const treeData: DataNode[] = []
  let rootGameId: string = 'game-id'

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
      case COMPONENT_TYPE.CHAPTER:
        treeData[0]?.children?.push({
          title: (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="add-scene"
                    onClick={() => {
                      if (onAddScene) onAddScene(componentId)
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
                    if (onAddScene) onAddScene(componentId)
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
          if (component.parent === chapter.key) {
            chapter.children?.push({
              title: (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="add-passage"
                        onClick={() => {
                          if (onAddPassage) onAddPassage(componentId)
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
                        if (onAddPassage) onAddPassage(componentId)
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
            if (component.parent === scene.key) {
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

const ComponentTree: React.FC<ComponentTreeProps> = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['game-id'])
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
    setGameMap(createGameMap())
  }, [])

  useEffect(() => {
    if (gameMap)
      setTreeData(
        createTreeData({
          gameMap,
          onAddChapter: (gameId) => {
            const updatedGameMap: GameMap = { ...gameMap }

            updatedGameMap['chapter-3-id'] = {
              title: 'Chapter 3',
              type: COMPONENT_TYPE.CHAPTER,
              parent: gameId,
              position: 0
            }

            setGameMap(updatedGameMap)
          },
          onAddScene: (chapterId) => {
            const updatedGameMap: GameMap = { ...gameMap }

            updatedGameMap['scene-5-id'] = {
              title: 'Scene 5',
              type: COMPONENT_TYPE.SCENE,
              parent: chapterId,
              position: 0
            }

            setGameMap(updatedGameMap)
            // if not, expand the chapter
          },
          onAddPassage: (sceneId) => {
            const udpatedGameMap: GameMap = { ...gameMap }

            udpatedGameMap['passage-6-id'] = {
              title: 'Passage 6',
              type: COMPONENT_TYPE.PASSAGE,
              parent: sceneId,
              position: 0
            }

            setGameMap(udpatedGameMap)
            // if not, expand the scene
          }
        })
      )
  }, [gameMap])

  return (
    <div className={styles.componentTree}>
      <Button onClick={() => setExpandedKeys(['game-id'])}>collapse all</Button>
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
    </div>
  )
}

export default ComponentTree
