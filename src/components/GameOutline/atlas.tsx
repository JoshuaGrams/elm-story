import React, { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import logger from '../../lib/logger'

import { ComponentId, COMPONENT_TYPE, Game, StudioId } from '../../data/types'
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

import { Badge, Button, Dropdown, Menu } from 'antd'

import {
  DownOutlined,
  AlignLeftOutlined,
  BranchesOutlined,
  BookOutlined,
  QuestionOutlined,
  RightOutlined
} from '@ant-design/icons'

import styles from './styles.module.less'

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
        selected: false,
        parentId: undefined
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
        selected: false,
        parentId: 'game-id'
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
        selected: false,
        parentId: 'game-id'
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
        selected: false,
        parentId: 'chapter-1-id'
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
        selected: false,
        parentId: 'chapter-1-id'
      }
    },
    'scene-3-id': {
      id: 'scene-3-id',
      children: [],
      hasChildren: false,
      isExpanded: false,
      isChildrenLoading: false,
      data: {
        title: 'Scene 3',
        type: COMPONENT_TYPE.SCENE,
        selected: false,
        parentId: 'chapter-2-id'
      }
    },
    'scene-4-id': {
      id: 'scene-4-id',
      children: ['passage-1-id', 'passage-2-id', 'passage-3-id'],
      hasChildren: true,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: 'Scene 4',
        type: COMPONENT_TYPE.SCENE,
        selected: false,
        parentId: 'chapter-2-id'
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
        selected: false,
        parentId: 'scene-4-id'
      }
    },
    'passage-2-id': {
      id: 'passage-2-id',
      children: [],
      hasChildren: false,
      isExpanded: false,
      data: {
        title: 'Passage 2',
        type: COMPONENT_TYPE.PASSAGE,
        selected: false,
        parentId: 'scene-4-id'
      }
    },
    'passage-3-id': {
      id: 'passage-3-id',
      children: [],
      hasChildren: false,
      isExpanded: false,
      data: {
        title: 'Passage 3',
        type: COMPONENT_TYPE.PASSAGE,
        selected: false,
        parentId: 'scene-4-id'
      }
    }
  }
})

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
          <span>{componentTitle}</span>{' '}
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

type OnSelectItem = (componentId: ComponentId) => void
type onAddItem = (componentId: ComponentId) => void
type OnRemoveItem = (componentId: ComponentId) => void
type OnEditItem = (componentId: ComponentId) => void

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
    if (!destination || !treeData) return

    const sourceParent = treeData.items[source.parentId],
      destinationParent = treeData.items[destination.parentId],
      movingComponent = movingComponentId && treeData.items[movingComponentId]

    if (
      movingComponent &&
      sourceParent.data.type === destinationParent.data.type
    ) {
      logger.info(
        `
          moving: ${movingComponent.data.title}
          from: ${sourceParent.data.title} (index ${source.index}
          to: ${destinationParent.data.title} (index ${destination.index})
        `
      )

      if (!destinationParent.isExpanded) destinationParent.isExpanded = true

      movingComponent.isExpanded = false
      movingComponent.data.selected = true

      setTreeData(moveItemOnTree(treeData, source, destination))
      setSelectedItemId(movingComponent.id as string)
    } else if (movingComponent) {
      logger.info(
        `Unable to move component type '${movingComponent.data.type}' to type '${destinationParent.data.type}'`
      )
    }
  }

  function onAdd(componentId: ComponentId) {
    const item = treeData?.items[componentId],
      data = item?.data

    if (treeData) {
      if (selectedItemId) treeData.items[selectedItemId].data.selected = false

      switch (data.type) {
        // add chapter
        case COMPONENT_TYPE.GAME:
          break
        // add scene
        case COMPONENT_TYPE.CHAPTER:
          const newScene: TreeItem = {
            id: 'scene-5-id',
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: 'Scene 5',
              type: COMPONENT_TYPE.SCENE,
              selected: false,
              parentId: item?.id
            }
          }

          setTreeData(addItemToTree(treeData, item?.id as string, newScene))
          setSelectedItemId(newScene.id as string)
          break
        // add passage
        case COMPONENT_TYPE.SCENE:
          const newPassage: TreeItem = {
            id: 'passage-4-id',
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: 'Passage 4',
              type: COMPONENT_TYPE.PASSAGE,
              selected: false,
              parentId: item?.id
            }
          }

          setTreeData(addItemToTree(treeData, item?.id as string, newPassage))
          setSelectedItemId(newPassage.id as string)
          break
        default:
          break
      }

      logger.info(`adding component to tree with id '${componentId}'`)
    }
  }

  function onRemove(componentId: ComponentId) {
    const item = treeData?.items[componentId]

    if (treeData) {
      setSelectedItemId(undefined)
      setTreeData(removeItemFromTree(treeData, item?.id as string))

      logger.info(`removing component from tree id '${componentId}'`)
    }
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

  useEffect(() => {
    console.log(treeData)
  }, [treeData])

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
