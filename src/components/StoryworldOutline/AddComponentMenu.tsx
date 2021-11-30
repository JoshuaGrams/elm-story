import React, { useContext } from 'react'

import { ELEMENT_TYPE, WorldId } from '../../data/types'
import { OnAddComponent } from '.'

import { EditorContext } from '../../contexts/EditorContext'

import { Dropdown, Menu } from 'antd'
import {
  AlignLeftOutlined,
  FolderOutlined,
  PartitionOutlined
} from '@ant-design/icons'

const AddComponentMenu: React.FC<{
  gameId: WorldId
  onAdd: OnAddComponent
}> = ({ children, gameId, onAdd }) => {
  const { editor } = useContext(EditorContext)

  return (
    <Dropdown
      overlay={
        <Menu onClick={(event) => event.domEvent.stopPropagation()}>
          <Menu.Item
            key={'add-folder'}
            onClick={() => onAdd(gameId, ELEMENT_TYPE.FOLDER)}
            disabled={
              editor.selectedGameOutlineComponent.type === ELEMENT_TYPE.SCENE ||
              editor.selectedGameOutlineComponent.type === ELEMENT_TYPE.PASSAGE
            }
          >
            <FolderOutlined />
            Folder
          </Menu.Item>
          <Menu.Item
            key={'add-scene'}
            onClick={() => onAdd(gameId, ELEMENT_TYPE.SCENE)}
            disabled={
              editor.selectedGameOutlineComponent.type === ELEMENT_TYPE.SCENE ||
              editor.selectedGameOutlineComponent.type === ELEMENT_TYPE.PASSAGE
            }
          >
            <PartitionOutlined />
            Scene
          </Menu.Item>
          <Menu.Item
            key={'add-event'}
            onClick={() => onAdd(gameId, ELEMENT_TYPE.PASSAGE)}
            disabled={
              editor.selectedGameOutlineComponent.type === ELEMENT_TYPE.GAME ||
              editor.selectedGameOutlineComponent.type === ELEMENT_TYPE.FOLDER
            }
          >
            <AlignLeftOutlined />
            Event
          </Menu.Item>
        </Menu>
      }
      trigger={['click']}
    >
      {children}
    </Dropdown>
  )
}

export default AddComponentMenu
