import React from 'react'

import { StudioId, World } from '../../data/types'

import { Modal, ModalProps } from 'antd'

import api from '../../api'

interface RemoveWorldModalProps extends ModalProps {
  studioId: StudioId
  world: World
}

const RemoveWorldModal: React.FC<RemoveWorldModalProps> = ({
  visible = false,
  onCancel,
  afterClose,
  studioId,
  world
}) => {
  return (
    <Modal
      title="Remove Storyworld"
      visible={visible}
      destroyOnClose
      onOk={async () => {
        if (world.id) await api().worlds.removeWorld(studioId, world.id)

        if (afterClose) afterClose()
      }}
      onCancel={onCancel}
      centered
      okText="Remove"
      okButtonProps={{ danger: true }}
    >
      <div>Are you sure you want to remove world '{world.title}'?</div>
    </Modal>
  )
}

RemoveWorldModal.displayName = 'RemoveWorldModal'

export default RemoveWorldModal
