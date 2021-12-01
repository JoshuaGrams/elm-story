import React, { useContext } from 'react'

import { ElementId, ELEMENT_TYPE } from '../../data/types'
import {
  OnAddElement,
  OnEditComponentTitle as OnEditElementTitle,
  OnRemoveComponent,
  OnSelectComponent
} from '.'

import { EditorContext } from '../../contexts/EditorContext'

import { RenderItemParams } from '@atlaskit/tree'

import { Badge, Button, Typography } from 'antd'
import {
  AlignLeftOutlined,
  DownOutlined,
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
  onSelect: OnSelectComponent
  onAdd: OnAddElement
  onRemove: OnRemoveComponent
  OnEditElementTitle: OnEditElementTitle
}) => {
  const { editor } = useContext(EditorContext)

  const elementType: ELEMENT_TYPE = item.data.type,
    elementTitle: string = item.data.title

  const elementIconClassNames = `${styles.itemIcon} ${styles.component}`

  let ExpandedIcon = () =>
      item.isExpanded ? (
        <DownOutlined className={`${styles.itemIcon}`} />
      ) : (
        <RightOutlined className={`${styles.itemIcon}`} />
      ),
    ElementIcon =
      elementType === ELEMENT_TYPE.FOLDER
        ? () =>
            item.isExpanded ? (
              <FolderOpenOutlined className={elementIconClassNames} />
            ) : (
              <FolderOutlined className={elementIconClassNames} />
            )
        : elementType === ELEMENT_TYPE.SCENE
        ? () => <PartitionOutlined className={elementIconClassNames} />
        : elementType === ELEMENT_TYPE.EVENT
        ? () => (
            <AlignLeftOutlined
              className={`${elementIconClassNames} ${styles.passage}`}
            />
          )
        : () => <QuestionOutlined className={elementIconClassNames} />

  let compositeSelectionStyles: string[] = []

  if (item.data.selected && !snapshot.isDragging)
    compositeSelectionStyles.push(styles.selected)
  if (item.id === editor.selectedComponentEditorSceneViewEvent)
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
            {elementType !== ELEMENT_TYPE.EVENT && (
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
