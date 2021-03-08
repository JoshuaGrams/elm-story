import React, { useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import logger from '../../lib/logger'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

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

import { Badge, Button, Dropdown, Menu, Typography } from 'antd'

import {
  DownOutlined,
  AlignLeftOutlined,
  BranchesOutlined,
  BookOutlined,
  QuestionOutlined,
  RightOutlined
} from '@ant-design/icons'

import styles from './styles.module.less'

const { Text } = Typography

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
        parentId: undefined,
        renaming: false
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
        parentId: 'game-id',
        renaming: false
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
        parentId: 'game-id',
        renaming: false
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
    disabled: boolean
    onAdd: onAddItem
    onRemove: OnRemoveItem
    onEditName: OnEditName
  }
}> = ({
  children,
  component: { id, type, title, disabled, onAdd, onRemove, onEditName }
}) => {
  const menuItems: React.ReactElement[] = []

  switch (type) {
    case COMPONENT_TYPE.GAME:
      menuItems.push(
        <Menu.Item key={`${id}-add`} onClick={() => onAdd(id)}>
          Add Chapter to '{title}'
        </Menu.Item>
      )

      break
    case COMPONENT_TYPE.CHAPTER:
      menuItems.push(
        <Menu.Item key={`${id}-add`} onClick={() => onAdd(id)}>
          Add Scene to '{title}'
        </Menu.Item>
      )

      break
    case COMPONENT_TYPE.SCENE:
      menuItems.push(
        <Menu.Item key={`${id}-add`} onClick={() => onAdd(id)}>
          Add Passage to '{title}'
        </Menu.Item>
      )

      break
    case COMPONENT_TYPE.PASSAGE:
      break
    default:
      break
  }

  if (type !== COMPONENT_TYPE.GAME) {
    menuItems.push(
      <Menu.Item
        key={`${id}-rename`}
        onClick={() => onEditName(id, undefined, false)}
      >
        Rename '{title}'
      </Menu.Item>
    )

    menuItems.push(
      <Menu.Item key={`${id}-remove`} onClick={() => onRemove(id)}>
        Remove '{title}'
      </Menu.Item>
    )
  }

  return (
    <>
      {!disabled && (
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
      )}

      {disabled && <>{children}</>}
    </>
  )
}

// lock vertical axis
const getStyle = (style: React.CSSProperties) => {
  if (style?.transform) {
    const axisLockY = `translate(0px, ${style.transform.split(',').pop()}`

    return {
      ...style,
      transform: axisLockY
    }
  }

  return style
}

type OnSelectItem = (componentId: ComponentId) => void
type onAddItem = (componentId: ComponentId) => void
type OnRemoveItem = (componentId: ComponentId) => void
type OnEditName = (
  componentId: ComponentId,
  title: string | undefined,
  complete: boolean | false
) => void

const renderComponentItem = ({
  item: { item, provided, onExpand, onCollapse, snapshot },
  onSelect,
  onAdd,
  onRemove,
  onEditName
}: {
  item: RenderItemParams
  onSelect: OnSelectItem
  onAdd: onAddItem
  onRemove: OnRemoveItem
  onEditName: OnEditName
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
        if (!item.data.renaming) onSelect(item.id as string)
      }}
      onContextMenu={(event) => event.stopPropagation()}
      style={getStyle(provided.draggableProps.style)}
    >
      <ContextMenu
        component={{
          id: item.id as string,
          title: componentTitle,
          type: componentType,
          disabled: item.data.renaming || false,
          onAdd,
          onRemove,
          onEditName: () => onEditName(item.id as string, undefined, false)
        }}
      >
        <div>
          {componentType !== COMPONENT_TYPE.PASSAGE && (
            <Button
              type="text"
              size="small"
              onClick={(event) => {
                event.stopPropagation()
                if (!item.data.renaming)
                  item.isExpanded ? onCollapse(item.id) : onExpand(item.id)
              }}
            >
              <ExpandedIcon />
            </Button>
          )}
          <ComponentIcon />
          {item.data.renaming && (
            <Text
              editable={{
                editing: item.data.renaming,
                onChange: (title) => onEditName(item.id as string, title, true)
              }}
            >
              {componentTitle || `New ${componentType}`}
            </Text>
          )}
          {!item.data.renaming && <Text ellipsis>{componentTitle}</Text>}{' '}
          {!item.isExpanded && !item.data.renaming && (
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
  const { editor, editorDispatch } = useContext(EditorContext)

  const [treeData, setTreeData] = useState<TreeData | undefined>(
      defaultTreeData()
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
    if (treeData && editor.renamingGameOutlineComponent.id) {
      if (editor.selectedGameOutlineComponent.id) {
        treeData.items[
          editor.selectedGameOutlineComponent.id
        ].data.selected = false
      }

      setTreeData(
        mutateTree(treeData, editor.renamingGameOutlineComponent.id, {
          data: {
            ...treeData.items[editor.renamingGameOutlineComponent.id].data,
            selected: false,
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
      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedGameOutlineComponent: {
          id: movingComponent.id as string,
          expanded: movingComponent.isExpanded || false
        }
      })
    } else if (movingComponent) {
      logger.info(
        `Unable to move component type '${movingComponent.data.type}' to type '${destinationParent.data.type}'`
      )
      movingComponent.isExpanded = false

      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedGameOutlineComponent: {
          id: movingComponent.id as string,
          expanded: movingComponent.isExpanded
        }
      })
    }
  }

  function onAdd(componentId: ComponentId) {
    const item = treeData?.items[componentId],
      data = item?.data

    if (treeData && item) {
      if (editor.selectedGameOutlineComponent.id)
        treeData.items[
          editor.selectedGameOutlineComponent.id
        ].data.selected = false

      switch (data.type) {
        // add chapter
        case COMPONENT_TYPE.GAME:
          const newChapter: TreeItem = {
            id: uuid(),
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: `Chapter ${uniqueNamesGenerator({
                dictionaries: [adjectives, animals, colors],
                length: 1
              }).toUpperCase()}`,
              type: COMPONENT_TYPE.CHAPTER,
              selected: false,
              parentId: item?.id,
              renaming: true
            }
          }

          item.hasChildren = true

          setTreeData(addItemToTree(treeData, item?.id as string, newChapter))
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: newChapter.id as string,
              expanded: true
            }
          })

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
              parentId: item?.id,
              renaming: true
            }
          }

          item.hasChildren = true

          setTreeData(addItemToTree(treeData, item?.id as string, newScene))
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: newScene.id as string,
              expanded: true
            }
          })

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
              parentId: item?.id,
              renaming: true
            }
          }

          item.hasChildren = true

          setTreeData(addItemToTree(treeData, item?.id as string, newPassage))
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: newPassage.id as string,
              expanded: true
            }
          })

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
      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedGameOutlineComponent: {
          id: undefined,
          expanded: false
        }
      })

      setTreeData(removeItemFromTree(treeData, item?.id as string))

      logger.info(`removing component from tree id '${componentId}'`)
    }
  }

  function onEditName(
    componentId: ComponentId,
    title: string | undefined,
    complete: boolean
  ) {
    if (treeData) {
      if (complete) {
        setTreeData(
          complete
            ? mutateTree(treeData, componentId, {
                data: {
                  ...treeData.items[componentId].data,
                  title: title || treeData.items[componentId].data.title,
                  renaming: false
                }
              })
            : mutateTree(treeData, componentId, {
                data: { ...treeData.items[componentId].data, renaming: true }
              })
        )
      } else {
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

  function onSelect(componentId: ComponentId | undefined) {
    if (treeData && editor.renamingGameOutlineComponent.id) {
      treeData.items[
        editor.renamingGameOutlineComponent.id
      ].data.renaming = false

      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME,
        renamingGameOutlineComponent: { id: undefined, renaming: false }
      })
    }

    if (
      componentId &&
      componentId === editor.selectedGameOutlineComponent.id &&
      treeData
    ) {
      setTreeData(
        mutateTree(treeData, componentId, {
          isExpanded: !treeData.items[componentId].isExpanded
        })
      )
    } else if (
      editor.selectedGameOutlineComponent.id &&
      editor.selectedGameOutlineComponent.id !== componentId &&
      treeData
    ) {
      setTreeData(
        mutateTree(treeData, editor.selectedGameOutlineComponent.id, {
          data: {
            ...treeData.items[editor.selectedGameOutlineComponent.id].data,
            renaming: false,
            selected: false
          }
        })
      )

      if (componentId) {
        // TODO: remove dupe?
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {
            id: componentId,
            expanded: !treeData.items[componentId].isExpanded
          }
        })
      } else if (!componentId) {
        logger.info(
          `deselecting item in tree with id '${editor.selectedGameOutlineComponent.id}'`
        )

        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {
            id: undefined,
            expanded: false
          }
        })
      }
    } else if (componentId && !editor.selectedGameOutlineComponent.id) {
      if (treeData) {
        // TODO: remove dupe?
        editorDispatch({
          type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
          selectedGameOutlineComponent: {
            id: componentId,
            expanded: !treeData.items[componentId].isExpanded
          }
        })
      }
    }
  }

  useEffect(() => {
    if (editor.selectedGameOutlineComponent.id && treeData) {
      logger.info(
        `selecting item in tree with id '${editor.selectedGameOutlineComponent.id}'`
      )

      setTreeData(
        mutateTree(treeData, editor.selectedGameOutlineComponent.id, {
          isExpanded: editor.selectedGameOutlineComponent.expanded,
          data: {
            ...treeData.items[editor.selectedGameOutlineComponent.id].data,
            selected: true
          }
        })
      )
    }
  }, [editor.selectedGameOutlineComponent])

  // TODO: can we disable renaming from another component?

  useEffect(() => {
    console.log(treeData)
  }, [treeData])

  return (
    <>
      {game.id && treeData && (
        <div className={styles.gameOutline} onClick={() => onSelect(undefined)}>
          <ContextMenu
            component={{
              id: 'game-id', // game.id as string,
              title: game.title,
              type: COMPONENT_TYPE.GAME,
              disabled: false,
              onAdd,
              onRemove,
              onEditName
            }}
          >
            <div className={styles.gameTitle}>{game.title}</div>
          </ContextMenu>
          <div style={{ height: '500px', overflow: 'auto' }}>
            {treeData.items[treeData.rootId].hasChildren && (
              <Tree
                tree={treeData}
                renderItem={(item: RenderItemParams) =>
                  renderComponentItem({
                    item,
                    onSelect,
                    onAdd,
                    onRemove,
                    onEditName
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
            )}

            {!treeData.items[treeData.rootId].hasChildren && (
              <Button type="text" onClick={() => onAdd('game-id')}>
                Add Chapter...
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default GameOutline
