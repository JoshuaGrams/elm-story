import React, { useEffect } from 'react'

import { DocumentId, GameDocument, GAME_TEMPLATE } from '../../data/types'

import { Modal, ModalProps, Form, Input } from 'antd'

import api from '../../api'

interface SaveGameModalProps extends ModalProps {
  studioId: DocumentId
  game?: GameDocument
  edit?: boolean
  onSave?: (documentId: DocumentId) => void
}

const SaveGameModal: React.FC<SaveGameModalProps> = ({
  visible = false,
  onCancel,
  afterClose,
  studioId,
  game,
  edit = false,
  onSave
}) => {
  const [saveGameForm] = Form.useForm()

  useEffect(() => {
    if (edit && game) {
      saveGameForm.setFieldsValue({
        title: game.title,
        director: game.director
      })
    }
  }, [visible])

  return (
    <Modal
      title={`${game && edit ? 'Edit' : 'New'} Game`}
      visible={visible}
      destroyOnClose
      onOk={(event) => {
        event.preventDefault()
        saveGameForm.submit()
      }}
      onCancel={onCancel}
      centered
      okText="Save"
      okButtonProps={{ form: 'save-game-form', htmlType: 'submit' }}
    >
      <Form
        id="save-game-form"
        form={saveGameForm}
        preserve={false}
        onFinish={async ({
          title,
          director
        }: {
          title: string
          director: string
        }) => {
          try {
            const gameId = await api().games.saveGame(
              studioId,
              game && edit
                ? { ...game, title, director }
                : {
                    title,
                    director,
                    // @TODO: Enable user-defined once more templates are supported.
                    template: GAME_TEMPLATE.ADVENTURE,
                    tags: [],
                    chapters: [],
                    // @TODO: Move to defines/types.
                    engine: '1.0.0',
                    version: '1.0.0'
                  }
            )

            if (onSave) onSave(gameId)
            if (afterClose) afterClose()
          } catch (error) {
            throw new Error(error)
          }
        }}
      >
        <Form.Item
          label="Game Title"
          name="title"
          rules={[{ required: true, message: 'Game title is required.' }]}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item
          label="Director"
          name="director"
          rules={[{ required: true, message: 'Director is required.' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SaveGameModal
