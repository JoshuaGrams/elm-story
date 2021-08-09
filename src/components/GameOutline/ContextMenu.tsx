import React from 'react'

import { ComponentId, COMPONENT_TYPE } from '../../data/types'

import { Dropdown, Menu } from 'antd'

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

export default ContextMenu
