import React, { useContext } from 'react'

import { COMPONENT_TYPE, GameId } from '../../data/types'
import { OnAddComponent } from '.'

import { EditorContext } from '../../contexts/EditorContext'

import { Dropdown, Menu } from 'antd'
import {
  AlignLeftOutlined,
  FolderOutlined,
  PartitionOutlined
} from '@ant-design/icons'

const AddComponentMenu: React.FC<{
  gameId: GameId
  onAdd: OnAddComponent
}> = ({ children, gameId, onAdd }) => {
  const { editor } = useContext(EditorContext)

  return (
    <Dropdown
      overlay={
        <Menu onClick={(event) => event.domEvent.stopPropagation()}>
          <Menu.Item
            key={'add-folder'}
            onClick={() => onAdd(gameId, COMPONENT_TYPE.FOLDER)}
          >
            <FolderOutlined />
            Folder
          </Menu.Item>
          <Menu.Item
            key={'add-scene'}
            onClick={() => onAdd(gameId, COMPONENT_TYPE.SCENE)}
          >
            <PartitionOutlined />
            Scene
          </Menu.Item>
          <Menu.Item
            key={'add-passage'}
            onClick={() => onAdd(gameId, COMPONENT_TYPE.PASSAGE)}
            disabled={
              editor.selectedGameOutlineComponent.type !== COMPONENT_TYPE.SCENE
            }
          >
            <AlignLeftOutlined />
            Passage
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
