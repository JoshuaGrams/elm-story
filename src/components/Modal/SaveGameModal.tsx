import React, { useContext, useEffect } from 'react'

import { StudioId, Game, GAME_TEMPLATE } from '../../data/types'

import { AppContext } from '../../contexts/AppContext'

import { Modal, ModalProps, Form, Input, Button } from 'antd'

import api from '../../api'

interface SaveGameModalProps extends ModalProps {
  studioId: StudioId
  game?: Game
  edit?: boolean
  onSave?: (savedGame: Game) => void
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
  const { app } = useContext(AppContext)

  const [saveGameForm] = Form.useForm()

  useEffect(() => {
    if (edit && game) {
      saveGameForm.setFieldsValue({
        title: game.title,
        designer: game.designer,
        version: game.version
      })
    }
  }, [visible])

  return (
    <Modal
      title={`${game && edit ? 'Edit' : 'New'} Game`}
      visible={visible}
      destroyOnClose
      onCancel={(event) => onCancel && onCancel(event)}
      centered
      footer={[
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
          form="save-game-form"
          htmlType="submit"
          onClick={(event) => {
            event.preventDefault()
            saveGameForm.submit()
          }}
        >
          Save
        </Button>
      ]}
    >
      <Form
        id="save-game-form"
        form={saveGameForm}
        preserve={false}
        onFinish={async ({
          title,
          designer,
          version
        }: {
          title: string
          designer: string
          version: string
        }) => {
          try {
            const savedGame = await api().games.saveGame(
              studioId,
              game && edit
                ? { ...game, title, designer, version }
                : {
                    children: [],
                    designer,
                    engine: app.version,
                    jump: null,
                    // TODO: Enable user-defined once more templates are supported.
                    template: GAME_TEMPLATE.ADVENTURE,
                    title,
                    tags: [],
                    // TODO: Move to defines/types.
                    version: '0.0.1'
                  }
            )

            if (onSave) onSave(savedGame)
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
          label="Designer"
          name="designer"
          rules={[{ required: true, message: 'Designer is required.' }]}
        >
          <Input />
        </Form.Item>

        {edit && (
          <Form.Item
            label="Version"
            name="version"
            rules={[{ required: true, message: 'Version is required.' }]}
          >
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default SaveGameModal
