import React, { useContext } from 'react'

import { ElementId, ELEMENT_TYPE } from '../../data/types'
import {
  OnAddElement,
  OnEditElementTitle,
  OnRemoveElement,
  OnSelectElement
} from '.'

import { ComposerContext } from '../../contexts/ComposerContext'

import { RenderItemParams } from '@atlaskit/tree'

import { Badge, Button, Typography } from 'antd'
import {
  AlignLeftOutlined,
  DownOutlined,
  FastForwardFilled,
  FolderOpenOutlined,
  FolderOutlined,
  PartitionOutlined,
  QuestionOutlined,
  RightOutlined
} from '@ant-design/icons'

import ContextMenu from './ContextMenu'

import styles from './styles.module.less'

const { Text } = Typography

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
        <FastForwardFilled
          className={`${elementIconClassNames} ${styles.event}`}
        />
      )
      break
    default:
      ElementIcon = () => <QuestionOutlined className={elementIconClassNames} />
      break
  }

  let compositeSelectionStyles: string[] = []

  if (item.data.selected && !snapshot.isDragging)
    compositeSelectionStyles.push(styles.selected)
  if (item.id === composer.selectedSceneMapEvent)
    compositeSelectionStyles.push(styles.sceneComponentSelected)

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
            {!item.isExpanded && !item.data.renaming && (
              <Badge
                count={item.children.length}
                size="small"
                className={styles.badge}
              />
            )}
          </div>
        </ContextMenu>
      )}
    </div>
  )
}

export default ElementItem
