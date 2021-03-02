import React from 'react'

import { Studio } from '../../data/types'

import { Modal, ModalProps } from 'antd'

import api from '../../api'

interface RemoveStudioModalProps extends ModalProps {
  studio: Studio
  onRemove?: () => void
}

const RemoveStudioModal: React.FC<RemoveStudioModalProps> = ({
  visible = false,
  onCancel,
  afterClose,
  studio,
  onRemove
}) => {
  return (
    <Modal
      title="Remove Studio"
      visible={visible}
      destroyOnClose
      onOk={async () => {
        if (studio.id) await api().studios.removeStudio(studio.id)

        if (onRemove) onRemove()
        if (afterClose) afterClose()
      }}
      onCancel={onCancel}
      centered
      okText="Remove"
      okButtonProps={{ danger: true }}
    >
      <div>Are you sure you want to remove studio '{studio.title}'?</div>
    </Modal>
  )
}

export default RemoveStudioModal
