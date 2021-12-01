import React, { useContext, useEffect } from 'react'

import { StudioId, World, GAME_TEMPLATE } from '../../data/types'

import { AppContext } from '../../contexts/AppContext'

import { Modal, ModalProps, Form, Input, Button } from 'antd'

import api from '../../api'

interface SaveWorldModalProps extends ModalProps {
  studioId: StudioId
  game?: World
  edit?: boolean
  onSave?: (savedGame: World) => void
}

const SaveWorldModal: React.FC<SaveWorldModalProps> = ({
  visible = false,
  onCancel,
  afterClose,
  studioId,
  game,
  edit = false,
  onSave
}) => {
  const { app } = useContext(AppContext)

  const [saveWorldForm] = Form.useForm()

  useEffect(() => {
    if (edit && game) {
      saveWorldForm.setFieldsValue({
        title: game.title,
        designer: game.designer,
        version: game.version
      })
    }
  }, [visible])

  return (
    <Modal
      title={`${game && edit ? 'Edit' : 'New'} Storyworld`}
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
            saveWorldForm.submit()
          }}
        >
          Save
        </Button>
      ]}
    >
      <Form
        id="save-game-form"
        form={saveWorldForm}
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
            const savedWorld = await api().worlds.saveWorld(
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

            if (onSave) onSave(savedWorld)
            if (afterClose) afterClose()
          } catch (error) {
            throw error
          }
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Title is required.' }]}
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

SaveWorldModal.displayName = 'SaveWorldModal'

export default SaveWorldModal
