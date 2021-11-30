import React from 'react'

import { StudioId, World } from '../../data/types'

import { Modal, ModalProps } from 'antd'

import api from '../../api'

interface RemoveGameModalProps extends ModalProps {
  studioId: StudioId
  game: World
}

const RemoveGameModal: React.FC<RemoveGameModalProps> = ({
  visible = false,
  onCancel,
  afterClose,
  studioId,
  game
}) => {
  return (
    <Modal
      title="Remove Storyworld"
      visible={visible}
      destroyOnClose
      onOk={async () => {
        if (game.id) await api().worlds.removeGame(studioId, game.id)

        if (afterClose) afterClose()
      }}
      onCancel={onCancel}
      centered
      okText="Remove"
      okButtonProps={{ danger: true }}
    >
      <div>Are you sure you want to remove world '{game.title}'?</div>
    </Modal>
  )
}

export default RemoveGameModal
