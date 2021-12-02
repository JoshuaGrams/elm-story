import React, { useContext } from 'react'

import { ELEMENT_TYPE, WorldId } from '../../data/types'
import { OnAddElement } from '.'

import { ComposerContext } from '../../contexts/ComposerContext'

import { Dropdown, Menu } from 'antd'
import {
  AlignLeftOutlined,
  FolderOutlined,
  PartitionOutlined
} from '@ant-design/icons'

const AddElementMenu: React.FC<{
  worldId: WorldId
  onAdd: OnAddElement
}> = ({ children, worldId, onAdd }) => {
  const { composer } = useContext(ComposerContext)

  return (
    <Dropdown
      overlay={
        <Menu onClick={(event) => event.domEvent.stopPropagation()}>
          <Menu.Item
            key={'add-folder'}
            onClick={() => onAdd(worldId, ELEMENT_TYPE.FOLDER)}
            disabled={
              composer.selectedWorldOutlineElement.type ===
                ELEMENT_TYPE.SCENE ||
              composer.selectedWorldOutlineElement.type === ELEMENT_TYPE.EVENT
            }
          >
            <FolderOutlined />
            Folder
          </Menu.Item>
          <Menu.Item
            key={'add-scene'}
            onClick={() => onAdd(worldId, ELEMENT_TYPE.SCENE)}
            disabled={
              composer.selectedWorldOutlineElement.type ===
                ELEMENT_TYPE.SCENE ||
              composer.selectedWorldOutlineElement.type === ELEMENT_TYPE.EVENT
            }
          >
            <PartitionOutlined />
            Scene
          </Menu.Item>
          <Menu.Item
            key={'add-event'}
            onClick={() => onAdd(worldId, ELEMENT_TYPE.EVENT)}
            disabled={
              composer.selectedWorldOutlineElement.type ===
                ELEMENT_TYPE.WORLD ||
              composer.selectedWorldOutlineElement.type === ELEMENT_TYPE.FOLDER
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

export default AddElementMenu
