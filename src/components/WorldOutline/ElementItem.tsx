import React, { useContext } from 'react'

import { ElementId, ELEMENT_TYPE } from '../../data/types'
import {
  OnAddElement,
  OnEditElementTitle,
  OnRemoveElement,
  OnSelectElement
} from '.'

import { AppContext } from '../../contexts/AppContext'
import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../contexts/ComposerContext'

import { RenderItemParams } from '@atlaskit/tree'

import { Badge, Button, Typography } from 'antd'
import {
  AlignLeftOutlined,
  ArrowRightOutlined,
  DownOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PartitionOutlined,
  QuestionOutlined,
  RightOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons'

import ContextMenu from './ContextMenu'

import styles from './styles.module.less'
import { useEvent, useJump } from '../../hooks'
import api from '../../api'

const { Text } = Typography

const ParentBadge: React.FC<{
  type: ELEMENT_TYPE
  elementId: ElementId
}> = React.memo(({ type, elementId }) => {})

const EventBadge: React.FC<{ eventId: ElementId }> = React.memo(
  ({ eventId }) => {
    const { app } = useContext(AppContext)

    if (!app.selectedStudioId) return null

    const event = useEvent(app.selectedStudioId, eventId, [eventId])

    return (
      <Badge
        children={
          <div className={styles.extraInfo}>
            <UserOutlined
              className={styles.persona}
              style={{ color: event?.persona ? '#999' : '#222' }}
            />
            <div
              className={`${styles.ending} ${
                event?.ending ? styles.isEnding : ''
              }`}
            >
              <div />
            </div>
          </div>
        }
        size="small"
        className={styles.badge}
      />
    )
  }
)

const JumpBadge: React.FC<{
  jumpId: ElementId
}> = React.memo(({ jumpId }) => {
  const { app } = useContext(AppContext)

  if (!app.selectedStudioId) return null

  const { composerDispatch } = useContext(ComposerContext)

  const jump = useJump(app.selectedStudioId, jumpId, [jumpId])

  const jumpTo = async (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    event.stopPropagation()

    if (!app.selectedStudioId || !jump?.path[0]) return

    const scene = await api().scenes.getScene(
      app.selectedStudioId,
      jump.path[0]
    )

    if (scene.id) {
      composerDispatch({
        type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
        selectedWorldOutlineElement: {
          expanded: true,
          id: jump.path[0],
          title: scene.title,
          type: ELEMENT_TYPE.SCENE
        }
      })

      setTimeout(
        () =>
          composerDispatch({
            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
            selectedSceneMapEvent: jump.path[1] || null
          }),
        1
      )
    }
  }

  return (
    <Badge
      children={
        <div className={styles.extraInfo}>
          <ArrowRightOutlined className={styles.jumpLink} onClick={jumpTo} />
        </div>
      }
      size="small"
      className={styles.badge}
    />
  )
})

const ElementItem = ({
  item: { item, provided, onExpand, onCollapse, snapshot },
  onSelect,
  onAdd,
  onRemove,
  OnEditElementTitle
}: {
  item: RenderItemParams
  onSelect: OnSelectElement
  onAdd: OnAddElement
  onRemove: OnRemoveElement
  OnEditElementTitle: OnEditElementTitle
}) => {
  const { composer } = useContext(ComposerContext)

  const elementType: ELEMENT_TYPE = item.data.type,
    elementTitle: string = item.data.title

  const elementIconClassNames = `${styles.itemIcon} ${styles.element}`

  let ExpandedIcon = () =>
      item.isExpanded ? (
        <DownOutlined className={`${styles.itemIcon}`} />
      ) : (
        <RightOutlined className={`${styles.itemIcon}`} />
      ),
    ElementIcon: () => JSX.Element

  switch (elementType) {
    case ELEMENT_TYPE.FOLDER:
      ElementIcon = () =>
        item.isExpanded ? (
          <FolderOpenOutlined className={elementIconClassNames} />
        ) : (
          <FolderOutlined className={elementIconClassNames} />
        )
      break
    case ELEMENT_TYPE.SCENE:
      ElementIcon = () => (
        <PartitionOutlined className={elementIconClassNames} />
      )
      break
    case ELEMENT_TYPE.EVENT:
      ElementIcon = () => (
        <AlignLeftOutlined
          className={`${elementIconClassNames} ${styles.event}`}
        />
      )
      break
    case ELEMENT_TYPE.JUMP:
      ElementIcon = () => (
        <SendOutlined className={`${elementIconClassNames} ${styles.event}`} />
      )
      break
    default:
      ElementIcon = () => <QuestionOutlined className={elementIconClassNames} />
      break
  }

  let compositeSelectionStyles: string[] = []

  if (item.data.selected && !snapshot.isDragging)
    compositeSelectionStyles.push(styles.selected)
  if (
    (item.id === composer.selectedSceneMapEvent &&
      elementType === ELEMENT_TYPE.EVENT) ||
    (item.id === composer.selectedSceneMapJump &&
      elementType === ELEMENT_TYPE.JUMP)
  )
    compositeSelectionStyles.push(styles.sceneElementSelected)

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`${styles.itemRow} ${compositeSelectionStyles.join(' ')}`}
      onClick={(event) => {
        event.stopPropagation()
        if (!item.data.renaming) onSelect(item.id as ElementId)
      }}
      onContextMenu={(event) => event.stopPropagation()}
    >
      {snapshot.isDragging && (
        <div className={styles.dragging}>
          <span className={styles.draggingTitle}>{elementTitle}</span>
        </div>
      )}

      {!snapshot.isDragging && (
        <ContextMenu
          component={{
            id: item.id as string,
            title: elementTitle,
            type: elementType,
            disabled: item.data.renaming || false,
            onAdd,
            onRemove,
            OnEditComponentTitle: () =>
              OnEditElementTitle(item.id as string, undefined, false)
          }}
        >
          <div>
            {elementType !== ELEMENT_TYPE.EVENT &&
              elementType !== ELEMENT_TYPE.JUMP && (
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
            <ElementIcon />
            {item.data.renaming && (
              <Text
                editable={{
                  editing: item.data.renaming,
                  onChange: (title) =>
                    OnEditElementTitle(item.id as string, title, true)
                }}
              >
                {elementTitle || `New ${elementType}`}
              </Text>
            )}
            {!item.data.renaming && (
              <Text ellipsis className={styles.title}>
                {elementTitle}
              </Text>
            )}{' '}
            {!item.data.renaming && (
              <>
                {elementType === ELEMENT_TYPE.EVENT && (
                  <EventBadge eventId={item.id as string} />
                )}
                {elementType === ELEMENT_TYPE.JUMP && (
                  <JumpBadge jumpId={item.id as string} />
                )}
                {/* folders and scenes */}
                {!item.isExpanded && (
                  <Badge
                    count={item.children.length}
                    size="small"
                    className={styles.badge}
                  />
                )}
              </>
            )}
          </div>
        </ContextMenu>
      )}
    </div>
  )
}

export default ElementItem
