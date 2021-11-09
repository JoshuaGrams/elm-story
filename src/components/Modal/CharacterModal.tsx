import React from 'react'

import { StudioId, GameId, ComponentId } from '../../data/types'

import { Button, Modal, ModalProps, Form } from 'antd'

import api from '../../api'

interface CharacterModalProps extends ModalProps {
  studioId: StudioId
  gameId: GameId
  characterId?: ComponentId
  type: 'NEW' | 'EDIT'
  visible?: boolean
}

const CharacterModal: React.FC<CharacterModalProps> = ({
  studioId,
  gameId,
  characterId,
  type,
  visible,
  onCancel
}) => {
  const [saveCharacterForm] = Form.useForm()

  let footerButtons: JSX.Element[] = []

  if (type === 'EDIT') {
    footerButtons.push(
      <Button
        key="remove"
        danger
        style={{ position: 'absolute', left: '16px' }}
        onClick={async () => {
          characterId &&
            (await api().characters.removeCharacter(studioId, characterId))

          // onRemove && onRemove()
        }}
      >
        Remove
      </Button>
    )
  }

  footerButtons = [
    ...footerButtons,
    <Button
      key="cancel"
      onClick={(event) => {
        onCancel && onCancel(event)
      }}
    >
      Cancel
    </Button>,
    <Button
      key="submit"
      type="primary"
      form="save-character-form"
      htmlType="submit"
      onClick={(event) => {
        event.preventDefault()
        saveCharacterForm.submit()
      }}
    >
      Save
    </Button>
  ]

  return (
    <Modal
      title={`${type === 'NEW' ? 'New' : 'Edit'} Character`}
      visible={visible}
      destroyOnClose
      onCancel={(event) => onCancel && onCancel(event)}
      centered
      footer={footerButtons}
    >
      Character Modal
    </Modal>
  )
}

CharacterModal.displayName = 'CharacterModal'

export default CharacterModal
