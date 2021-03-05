import React, { useEffect, useState } from 'react'
import logger from '../../lib/logger'

import { ComponentId, COMPONENT_TYPE, Game, StudioId } from '../../data/types'
import Tree, {
  mutateTree,
  TreeData,
  RenderItemParams,
  TreeSourcePosition,
  TreeDestinationPosition,
  ItemId,
  TreeItem
} from '@atlaskit/tree'

import { Badge, Button, Divider, Dropdown, Menu } from 'antd'
import MenuItem from 'antd/lib/menu/MenuItem'

import {
  DownOutlined,
  PlusOutlined,
  AlignLeftOutlined,
  BranchesOutlined,
  BookOutlined,
  QuestionOutlined,
  RightOutlined
} from '@ant-design/icons'

import styles from './styles.module.less'

type OnSelectItem = (componentId: ComponentId) => void
type onAddItem = (componentId: ComponentId) => void
type OnRemoveItem = (componentId: ComponentId) => void
type OnEditItem = (componentId: ComponentId) => void

const defaultTreeData = (): TreeData => ({
  rootId: 'game-id',
  items: {
    'game-id': {
      id: 'game-id',
      children: ['chapter-1-id', 'chapter-2-id'],
      hasChildren: true,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: 'Pulp Fiction',
        type: COMPONENT_TYPE.GAME,
        selected: false
      }
    },
    'chapter-1-id': {
      id: 'chapter-1-id',
      children: ['scene-1-id', 'scene-2-id'],
      hasChildren: true,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: 'Chapter 1',
        type: COMPONENT_TYPE.CHAPTER,
        selected: false
      }
    },
    'chapter-2-id': {
      id: 'chapter-2-id',
      children: ['scene-3-id', 'scene-4-id'],
      hasChildren: true,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: 'Chapter 2',
        type: COMPONENT_TYPE.CHAPTER,
        selected: false
      }
    },
    'scene-1-id': {
      id: 'scene-1-id',
      children: [],
      hasChildren: false,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: 'Scene 1',
        type: COMPONENT_TYPE.SCENE,
        selected: false
      }
    },
    'scene-2-id': {
      id: 'scene-2-id',
      children: [],
      hasChildren: true,
      isExpanded: false,
      isChildrenLoading: false,
      data: {
        title: 'Scene 2',
        type: COMPONENT_TYPE.SCENE,
        selected: false
      }
    },
    'scene-3-id': {
      id: 'scene-3-id',
      children: [],
      hasChildren: true,
      isExpanded: false,
      isChildrenLoading: false,
      data: {
        title: 'Scene 3',
        type: COMPONENT_TYPE.SCENE,
        selected: false
      }
    },
    'scene-4-id': {
      id: 'scene-4-id',
      children: ['passage-1-id'],
      hasChildren: true,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: 'Scene 4',
        type: COMPONENT_TYPE.SCENE,
        selected: false
      }
    },
    'passage-1-id': {
      id: 'passage-1-id',
      children: [],
      hasChildren: false,
      isExpanded: false,
      data: {
        title: 'Passage 1',
        type: COMPONENT_TYPE.PASSAGE,
        selected: false
      }
    }
  }
})

const ContextMenu: React.FC<{
  component: {
    id: ComponentId
    type: COMPONENT_TYPE
    title: string
    onAdd: onAddItem
    onRemove: OnRemoveItem
    onEdit: OnEditItem
  }
}> = ({
  children,
  component: { id, type, title, onAdd, onRemove, onEdit }
}) => {
  const menuItems: React.ReactElement[] = []

  switch (type) {
    case COMPONENT_TYPE.CHAPTER:
      menuItems.push(
        <Menu.Item key={`${id}-add`} onClick={() => onAdd(id)}>
          Add New Scene to '{title}'
        </Menu.Item>
      )

      break
    case COMPONENT_TYPE.SCENE:
      menuItems.push(
        <Menu.Item key={`${id}-add`} onClick={() => onAdd(id)}>
          Add New Passage to '{title}'
        </Menu.Item>
      )

      break
    case COMPONENT_TYPE.PASSAGE:
      break
    default:
      break
  }

  menuItems.push(
    <Menu.Item key={`${id}-edit`} onClick={() => onEdit(id)}>
      Edit '{title}'
    </Menu.Item>
  )

  menuItems.push(
    <Menu.Item key={`${id}-remove`} onClick={() => onRemove(id)}>
      Remove '{title}'
    </Menu.Item>
  )

  return (
    <Dropdown
      overlay={
        <Menu onClick={(event) => event.domEvent.stopPropagation()}>
          {menuItems.map((item) => item)}
        </Menu>
      }
      trigger={['contextMenu']}
    >
      {children}
    </Dropdown>
  )
}

const renderComponentItem = ({
  item: { item, provided, onExpand, onCollapse },
  onSelect,
  onAdd,
  onRemove,
  onEdit
}: {
  item: RenderItemParams
  onSelect: OnSelectItem
  onAdd: onAddItem
  onRemove: OnRemoveItem
  onEdit: OnEditItem
}): React.ReactNode | undefined => {
  const componentType: COMPONENT_TYPE = item.data.type,
    componentTitle: string = item.data.title

  const componentIconClassNames = `${styles.itemIcon} ${styles.component}`

  let ExpandedIcon = () =>
      item.isExpanded ? (
        <DownOutlined className={`${styles.itemIcon}`} />
      ) : (
        <RightOutlined className={`${styles.itemIcon}`} />
      ),
    ComponentIcon =
      componentType === COMPONENT_TYPE.CHAPTER
        ? () => <BookOutlined className={componentIconClassNames} />
        : componentType === COMPONENT_TYPE.SCENE
        ? () => <BranchesOutlined className={componentIconClassNames} />
        : componentType === COMPONENT_TYPE.PASSAGE
        ? () => (
            <AlignLeftOutlined
              className={`${componentIconClassNames} ${styles.passage}`}
            />
          )
        : () => <QuestionOutlined className={componentIconClassNames} />

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`${styles.itemRow} ${
        item.data.selected ? styles.selected : ''
      }`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(item.id as string)
      }}
      onContextMenu={(event) => event.stopPropagation()}
    >
      <ContextMenu
        component={{
          id: item.id as string,
          title: componentTitle,
          type: componentType,
          onAdd,
          onRemove,
          onEdit
        }}
      >
        <div>
          {componentType !== COMPONENT_TYPE.PASSAGE && (
            <Button
              type="text"
              size="small"
              onClick={(event) => {
                event.stopPropagation()
                item.isExpanded ? onCollapse(item.id) : onExpand(item.id)
              }}
            >
              <ExpandedIcon />
            </Button>
          )}
          <ComponentIcon />
          {componentTitle}{' '}
          {!item.isExpanded && (
            <Badge
              count={item.children.length}
              size="small"
              className={styles.badge}
            />
          )}
        </div>
      </ContextMenu>
    </div>
  )
}

const GameOutline: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  const [treeData, setTreeData] = useState<TreeData | undefined>(
      defaultTreeData()
    ),
    [selectedItemId, setSelectedItemId] = useState<string | undefined>(
      undefined
    ),
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
    setMovingComponentId(itemId as string)
  }

  function onDragEnd(
    source: TreeSourcePosition,
    destination?: TreeDestinationPosition
  ) {
    if (!destination) return

    if (movingComponentId && source && destination) {
      const movingComponent = treeData?.items[movingComponentId],
        fromComponent = treeData?.items[source.parentId],
        toComponent = treeData?.items[destination.parentId]

      // is it possible to move here?
      logger.info(
        `moving: ${movingComponent?.data.title} | from: ${fromComponent?.data.title} | to: ${toComponent?.data.title}`
      )

      setMovingComponentId(undefined)
    }
  }

  function onAdd(componentId: ComponentId) {
    const item = treeData?.items[componentId],
      data = item?.data

    switch (data.type) {
      case COMPONENT_TYPE.CHAPTER:
        if (!item?.children.includes('scene-5-id')) {
          item?.children.push('scene-5-id')

          if (item) item.isExpanded = true

          if (treeData) {
            if (selectedItemId)
              treeData.items[selectedItemId].data.selected = false

            setTreeData({
              rootId: treeData.rootId,
              items: {
                ...treeData.items,
                'scene-5-id': {
                  id: 'scene-5-id',
                  children: [],
                  isExpanded: false,
                  hasChildren: false,
                  isChildrenLoading: false,
                  data: {
                    title: 'Scene 5',
                    type: COMPONENT_TYPE.SCENE,
                    selected: false
                  }
                }
              }
            })
          }

          setSelectedItemId('scene-5-id')
        }

        break
      case COMPONENT_TYPE.SCENE:
        break
      case COMPONENT_TYPE.PASSAGE:
        break
      default:
        break
    }

    logger.info(`adding component to tree with id '${componentId}'`)
  }

  function onRemove(componentId: ComponentId) {
    logger.info(`removing component from tree id '${componentId}'`)
  }

  function onEdit(componentId: ComponentId) {
    logger.info(`editing component in tree with id '${componentId}'`)
  }

  function onSelect(componentId: ComponentId | undefined) {
    if (componentId && componentId === selectedItemId && treeData) {
      setTreeData(
        mutateTree(treeData, componentId, {
          isExpanded: !treeData.items[componentId].isExpanded
        })
      )
    } else if (selectedItemId && selectedItemId !== componentId && treeData) {
      setTreeData(
        mutateTree(treeData, selectedItemId, {
          data: { ...treeData.items[selectedItemId].data, selected: false }
        })
      )

      setSelectedItemId(componentId)

      if (!componentId)
        logger.info(`deselecting item in tree with id '${selectedItemId}'`)
    } else if (componentId && !selectedItemId) {
      setSelectedItemId(componentId)
    }
  }

  useEffect(() => {
    if (selectedItemId && treeData) {
      setTreeData(
        mutateTree(treeData, selectedItemId, {
          isExpanded: !treeData.items[selectedItemId].isExpanded,
          data: { ...treeData.items[selectedItemId].data, selected: true }
        })
      )

      logger.info(`selecting item in tree with id '${selectedItemId}'`)
    }
  }, [selectedItemId])

  return (
    <>
      {game.id && treeData && (
        <div className={styles.gameOutline} onClick={() => onSelect(undefined)}>
          <div>{game.title}</div>
          <div style={{ height: '500px', overflow: 'auto' }}>
            <Tree
              tree={treeData}
              renderItem={(item: RenderItemParams) =>
                renderComponentItem({
                  item,
                  onSelect,
                  onAdd,
                  onRemove,
                  onEdit
                })
              }
              onExpand={onExpand}
              onCollapse={onCollapse}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              offsetPerLevel={19}
              isDragEnabled
              isNestingEnabled
            />
          </div>
        </div>
      )}
    </>
  )
}

export default GameOutline
