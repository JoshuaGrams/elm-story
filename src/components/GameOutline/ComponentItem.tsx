import React from 'react'

import { ComponentId, COMPONENT_TYPE } from '../../data/types'

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

type OnSelectItem = (componentId: ComponentId) => void
type onAddItem = (componentId: ComponentId) => void
type OnRemoveItem = (componentId: ComponentId) => void
type OnEditName = (
  componentId: ComponentId,
  title: string | undefined,
  complete: boolean | false
) => void

const ComponentItem = ({
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
}) => {
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
      componentType === COMPONENT_TYPE.FOLDER
        ? () =>
            item.isExpanded ? (
              <FolderOpenOutlined className={componentIconClassNames} />
            ) : (
              <FolderOutlined className={componentIconClassNames} />
            )
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
        item.data.selected && !snapshot.isDragging ? styles.selected : ''
      }`}
      onClick={(event) => {
        event.stopPropagation()
        if (!item.data.renaming) onSelect(item.id as ComponentId)
      }}
      onContextMenu={(event) => event.stopPropagation()}
    >
      {snapshot.isDragging && (
        <div className={styles.dragging}>
          <span className={styles.draggingTitle}>{componentTitle}</span>
        </div>
      )}

      {!snapshot.isDragging && (
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
                  onChange: (title) =>
                    onEditName(item.id as string, title, true)
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
      )}
    </div>
  )
}

export default ComponentItem
