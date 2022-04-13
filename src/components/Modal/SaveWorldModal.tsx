import React, { useContext, useEffect } from 'react'

import { StudioId, World } from '../../data/types'

import { AppContext } from '../../contexts/AppContext'

import { Modal, ModalProps, Form, Input, Button } from 'antd'

import api from '../../api'
import saveStarterContent from '../../lib/saveStarterContent'

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
            if (game && edit) {
              await api().worlds.saveWorld(studioId, {
                ...game,
                title,
                designer,
                version
              })

              return
            }

            // elmstorygames/feedback#283
            const savedWorld = await saveStarterContent({
              appVersion: app.version,
              studioId,
              worldTitle: title,
              worldDesigner: designer
            })

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
          labelCol={{ span: 5 }}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item
          label="Designer"
          name="designer"
          rules={[{ required: true, message: 'Designer is required.' }]}
          labelCol={{ span: 5 }}
        >
          <Input />
        </Form.Item>

        {edit && (
          <Form.Item
            label="Version"
            name="version"
            rules={[{ required: true, message: 'Version is required.' }]}
            labelCol={{ span: 10 }}
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
