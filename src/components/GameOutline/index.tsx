import logger from '../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { cloneDeep } from 'lodash-es'

import createGameOutlineTreeData from '../../lib/createGameOutlineTreeData'

import { APP_LOCATION } from '../../contexts/AppContext'
import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

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

import { Badge, Button, Dropdown, Menu, Tooltip, Typography } from 'antd'
import {
  DownOutlined,
  AlignLeftOutlined,
  PartitionOutlined,
  BookOutlined,
  QuestionOutlined,
  RightOutlined,
  LeftOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons'

import { SaveGameModal } from '../Modal'

import styles from './styles.module.less'

import api from '../../api'

const { Text } = Typography

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

// Lock dragging along vertical axis
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
        ? () => <PartitionOutlined className={componentIconClassNames} />
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
        if (!item.data.renaming) onSelect(item.id as ComponentId)
      }}
      onContextMenu={(event) => event.stopPropagation()}
      // style={getStyle(provided.draggableProps.style)} locks axis; disable for now
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

// TODO: Reduce component bulk; decouple
const GameOutline: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  const history = useHistory()

  const { editor, editorDispatch } = useContext(EditorContext)

  const [editGameModalVisible, setEditGameModalVisible] = useState<boolean>(
      false
    ),
    [treeData, setTreeData] = useState<TreeData | undefined>(undefined),
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
            case COMPONENT_TYPE.CHAPTER:
              await api().games.saveChapterRefsToGame(
                studioId,
                game.id,
                newTreeData.items[destinationParent.id]
                  .children as ComponentId[]
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
                api().scenes.saveChapterRefToScene(
                  studioId,
                  destinationParent.id as ComponentId,
                  movingComponent.id as ComponentId
                ),
                api().chapters.saveSceneRefsToChapter(
                  studioId,
                  sourceParent.id as ComponentId,
                  newTreeData.items[sourceParent.id].children as ComponentId[]
                ),
                api().chapters.saveSceneRefsToChapter(
                  studioId,
                  destinationParent.id as ComponentId,
                  newTreeData.items[destinationParent.id]
                    .children as ComponentId[]
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
                api().scenes.savePassageRefsToScene(
                  studioId,
                  sourceParent.id as ComponentId,
                  newTreeData.items[sourceParent.id].children as ComponentId[]
                ),
                api().scenes.savePassageRefsToScene(
                  studioId,
                  destinationParent.id as ComponentId,
                  newTreeData.items[destinationParent.id]
                    .children as ComponentId[]
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
        // add chapter
        case COMPONENT_TYPE.GAME:
          let chapterId = undefined

          try {
            chapterId = await api().chapters.saveChapter(studioId, {
              gameId: game.id,
              title: 'Untitled Chapter',
              tags: [],
              scenes: []
            })
          } catch (error) {
            throw error
          }

          item.hasChildren = true

          newTreeData = addItemToTree(treeData, item.id as ComponentId, {
            id: chapterId,
            children: [],
            isExpanded: false,
            hasChildren: false,
            isChildrenLoading: false,
            data: {
              title: 'Untitled Chapter',
              type: COMPONENT_TYPE.CHAPTER,
              selected: false,
              parentId: item.id,
              renaming: true
            }
          })

          try {
            await api().games.saveChapterRefsToGame(
              studioId,
              game.id,
              newTreeData.items[item.id].children as ComponentId[]
            )
          } catch (error) {
            throw new Error(error)
          }

          setTreeData(newTreeData)

          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              id: chapterId,
              expanded: true,
              type: COMPONENT_TYPE.CHAPTER,
              title: 'Untitled Chapter'
            }
          })

          break
        // add scene
        case COMPONENT_TYPE.CHAPTER:
          let sceneId = undefined

          try {
            sceneId = await api().scenes.saveScene(studioId, {
              gameId: game.id,
              chapterId: item.id as ComponentId,
              title: 'Untitled Scene',
              tags: [],
              passages: [],
              jumps: []
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
            await api().chapters.saveSceneRefsToChapter(
              studioId,
              item.id as ComponentId,
              newTreeData.items[item.id].children as ComponentId[]
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
              gameId: game.id,
              sceneId: item.id as string,
              title: 'Untitled Passage',
              choices: [],
              content: '',
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
              await api().scenes.savePassageRefsToScene(
                studioId,
                item.id as ComponentId,
                newTreeData.items[item.id].children as ComponentId[]
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
          case COMPONENT_TYPE.CHAPTER:
            if (game.jump) {
              const jump = await api().jumps.getJump(studioId, game.jump)

              if (componentId === jump.route[0]) {
                await api().games.saveJumpRefToGame(studioId, game.id, null)
              }
            }

            await Promise.all([
              await api().games.saveChapterRefsToGame(
                studioId,
                game.id,
                newTreeData.items[item.data.parentId].children as ComponentId[]
              ),
              await api().chapters.removeChapter(studioId, componentId)
            ])
            break
          case COMPONENT_TYPE.SCENE:
            await Promise.all([
              api().chapters.saveSceneRefsToChapter(
                studioId,
                item.data.parentId,
                newTreeData.items[item.data.parentId].children as ComponentId[]
              ),
              api().scenes.removeScene(studioId, componentId)
            ])
            break
          case COMPONENT_TYPE.PASSAGE:
            await Promise.all([
              api().scenes.savePassageRefsToScene(
                studioId,
                item.data.parentId,
                newTreeData.items[item.data.parentId].children as ComponentId[]
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

      setTreeData(newTreeData)

      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedGameOutlineComponent: {
          id: undefined,
          expanded: false,
          type: undefined,
          title: undefined
        }
      })

      logger.info(`Removing component from outline with ID: ${componentId}`)
    }
  }

  async function onEditName(
    componentId: ComponentId,
    title: string | undefined,
    complete: boolean
  ) {
    logger.info(`GameOutline->onEditName`)

    if (treeData) {
      if (complete && title) {
        logger.info(`GameOutline->onEditName->complete && title:'${title}'`)

        try {
          switch (treeData.items[componentId].data.type) {
            case COMPONENT_TYPE.CHAPTER:
              await api().chapters.saveChapterTitle(
                studioId,
                componentId,
                title
              )
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

        if (componentId === editor.selectedGameOutlineComponent.id) {
          console.log('test')
          // TODO: results in unneeded call on selectComponent
          editorDispatch({
            type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
            selectedGameOutlineComponent: {
              ...editor.selectedGameOutlineComponent,
              title: title || treeData.items[componentId].data.title
            }
          })
        }
      } else {
        logger.info(`GameOutline->onEditName->else`)

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

  // TODO: Disable renaming from another component?

  useEffect(() => {
    if (treeData) {
      logger.info('Game outline tree data has been updated.')
      console.log(treeData)
    }
  }, [treeData])

  useEffect(() => {
    async function getGameComponents() {
      if (game.id) {
        const chapters = await api().chapters.getChaptersByGameRef(
            studioId,
            game.id
          ),
          scenes = await api().scenes.getScenesByGameId(studioId, game.id),
          passages = await api().passages.getPassagesByGameRef(
            studioId,
            game.id
          )

        if (chapters && scenes && passages) {
          setTreeData(
            createGameOutlineTreeData(game, chapters, scenes, passages)
          )
        } else {
          throw new Error('Unable to build tree data.')
        }
      }
    }

    getGameComponents()
  }, [])

  return (
    <>
      {game.id && treeData && (
        <>
          <SaveGameModal
            visible={editGameModalVisible}
            onSave={({ id, title }) => {
              if (id && title) {
                logger.info('EDITOR_ACTION_TYPE.COMPONENT_RENAME dispatch')

                editorDispatch({
                  type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                  renamedComponent: {
                    id,
                    newTitle: title,
                    type: COMPONENT_TYPE.GAME
                  }
                })
              }
            }}
            onCancel={() => setEditGameModalVisible(false)}
            afterClose={() => setEditGameModalVisible(false)}
            studioId={studioId}
            game={game}
            edit
          />

          <div className={styles.gameOutline}>
            {/* Outline Nav */}
            <div className={styles.outlineNav}>
              <Tooltip
                title="Back to Dashboard"
                placement="right"
                align={{ offset: [-10, 0] }}
                mouseEnterDelay={1}
              >
                <Button
                  onClick={() => history.push(APP_LOCATION.DASHBOARD)}
                  type="link"
                  className={styles.dashboardButton}
                >
                  <LeftOutlined />
                </Button>
              </Tooltip>

              <span>{game.title}</span>

              <div className={styles.gameButtons}>
                <Tooltip
                  title="Edit Game Details..."
                  placement="right"
                  align={{ offset: [-10, 0] }}
                  mouseEnterDelay={1}
                >
                  <Button
                    onClick={() => setEditGameModalVisible(true)}
                    type="link"
                  >
                    <EditOutlined />
                  </Button>
                </Tooltip>

                <Tooltip
                  title="Add Chapter"
                  placement="right"
                  align={{ offset: [-10, 0] }}
                  mouseEnterDelay={1}
                >
                  <Button
                    onClick={() => onAdd(game.id as ComponentId)}
                    type="link"
                  >
                    <PlusOutlined />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Game Outline */}
            <div className={styles.tree}>
              {treeData.items[treeData.rootId].hasChildren && (
                <Tree
                  tree={treeData}
                  renderItem={(item: RenderItemParams) =>
                    renderComponentItem({
                      item,
                      onSelect: (componentId) => {
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
                      },
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
                <Button
                  type="link"
                  onClick={() => {
                    if (game.id) onAdd(game.id)
                  }}
                  className={styles.addChapterButton}
                >
                  Add Chapter...
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default GameOutline
