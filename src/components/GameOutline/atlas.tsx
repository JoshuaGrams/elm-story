import React, { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import logger from '../../lib/logger'

// BUG: deleting is not working properly - check tree
//

// TODO: remove for production use case
import { v4 as uuid } from 'uuid'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} from 'unique-names-generator'

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
      children: [],
      hasChildren: false,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: `Chapter ${uniqueNamesGenerator({
          dictionaries: [adjectives, animals, colors],
          length: 1
        }).toUpperCase()}`,
        type: COMPONENT_TYPE.CHAPTER,
        selected: false,
        parentId: 'game-id'
      }
    },
    'chapter-2-id': {
      id: 'chapter-2-id',
      children: [],
      hasChildren: false,
      isExpanded: true,
      isChildrenLoading: false,
      data: {
        title: `Chapter ${uniqueNamesGenerator({
          dictionaries: [adjectives, animals, colors],
          length: 1
        }).toUpperCase()}`,
        type: COMPONENT_TYPE.CHAPTER,
        selected: false,
        parentId: 'game-id'
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

function getStyle(style: React.CSSProperties) {
  if (style?.transform) {
    const axisLockY = `translate(0px, ${style.transform.split(',').pop()}`
    return {
      ...style,
      transform: axisLockY
    }
  }
  return style
}

const renderComponentItem = ({
  item: { item, provided, onExpand, onCollapse, snapshot },
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
      } ${snapshot.isDragging ? styles.dragging : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(item.id as string)
      }}
      onContextMenu={(event) => event.stopPropagation()}
      style={getStyle(provided.draggableProps.style)}
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
    [selectedItem, setSelectedItem] = useState<{
      id: string | undefined
      expand: boolean
    }>({ id: undefined, expand: false }),
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

      movingComponent.data.selected = true

      setTreeData(moveItemOnTree(treeData, source, destination))
      setSelectedItem({
        id: movingComponent.id as string,
        expand: movingComponent.isExpanded || false
      })
    } else if (movingComponent) {
      logger.info(
        `Unable to move component type '${movingComponent.data.type}' to type '${destinationParent.data.type}'`
      )
      movingComponent.isExpanded = false
      setSelectedItem({
        id: movingComponent.id as string,
        expand: movingComponent.isExpanded
      })
    }
  }

  function onAdd(componentId: ComponentId) {
    const item = treeData?.items[componentId],
      data = item?.data

    if (treeData) {
      if (selectedItem.id) treeData.items[selectedItem.id].data.selected = false

      switch (data.type) {
        // add chapter
        case COMPONENT_TYPE.GAME:
          break
        // add scene
        case COMPONENT_TYPE.CHAPTER:
          const newScene: TreeItem = {
            id: uuid(),
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: `Scene ${uniqueNamesGenerator({
                dictionaries: [adjectives, animals, colors],
                length: 1
              }).toUpperCase()}`,
              type: COMPONENT_TYPE.SCENE,
              selected: false,
              parentId: item?.id
            }
          }

          setTreeData(addItemToTree(treeData, item?.id as string, newScene))
          setSelectedItem({ id: newScene.id as string, expand: true })
          break
        // add passage
        case COMPONENT_TYPE.SCENE:
          const newPassage: TreeItem = {
            id: uuid(),
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: `Passage ${uniqueNamesGenerator({
                dictionaries: [adjectives, animals, colors],
                length: 1
              }).toUpperCase()}`,
              type: COMPONENT_TYPE.PASSAGE,
              selected: false,
              parentId: item?.id
            }
          }

          setTreeData(addItemToTree(treeData, item?.id as string, newPassage))
          setSelectedItem({ id: newPassage.id as string, expand: true })
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
      setSelectedItem({ id: undefined, expand: false })
      setTreeData(removeItemFromTree(treeData, item?.id as string))

      logger.info(`removing component from tree id '${componentId}'`)
    }
  }

  function onEdit(componentId: ComponentId) {
    logger.info(`editing component in tree with id '${componentId}'`)
  }

  function onSelect(componentId: ComponentId | undefined) {
    if (componentId && componentId === selectedItem.id && treeData) {
      setTreeData(
        mutateTree(treeData, componentId, {
          isExpanded: !treeData.items[componentId].isExpanded
        })
      )
    } else if (selectedItem.id && selectedItem.id !== componentId && treeData) {
      setTreeData(
        mutateTree(treeData, selectedItem.id, {
          data: { ...treeData.items[selectedItem.id].data, selected: false }
        })
      )

      if (componentId)
        setSelectedItem({
          id: componentId,
          expand: !treeData.items[componentId].isExpanded
        })

      if (!componentId)
        logger.info(`deselecting item in tree with id '${selectedItem.id}'`)
    } else if (componentId && !selectedItem.id) {
      if (treeData)
        setSelectedItem({
          id: componentId,
          expand: !treeData.items[componentId].isExpanded
        })
    }
  }

  useEffect(() => {
    if (selectedItem.id && treeData) {
      setTreeData(
        mutateTree(treeData, selectedItem.id, {
          isExpanded: selectedItem.expand,
          data: { ...treeData.items[selectedItem.id].data, selected: true }
        })
      )

      logger.info(`selecting item in tree with id '${selectedItem.id}'`)
    }
  }, [selectedItem])

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
