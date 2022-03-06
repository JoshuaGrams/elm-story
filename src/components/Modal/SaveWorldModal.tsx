import { getRandomElementName } from '../../lib'

import { v4 as uuid } from 'uuid'

import React, { useContext, useEffect } from 'react'

import {
  ElementId,
  ELEMENT_TYPE,
  Event,
  EVENT_TYPE,
  StudioId,
  World,
  WORLD_TEMPLATE
} from '../../data/types'
import { DEFAULT_EVENT_CONTENT } from '../../data/eventContentTypes'

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
            if (game && edit) {
              api().worlds.saveWorld(studioId, {
                ...game,
                title,
                designer,
                version
              })

              return
            }

            const worldId = uuid(),
              sceneId = uuid(),
              eventId = uuid()

            const promises: [
              Promise<World>,
              Promise<ElementId>,
              Promise<Event>
            ] = [
              api().worlds.saveWorld(studioId, {
                children: [[ELEMENT_TYPE.SCENE, sceneId]],
                designer,
                engine: app.version,
                id: worldId,
                jump: null,
                // TODO: Enable user-defined once more templates are supported.
                template: WORLD_TEMPLATE.ADVENTURE,
                title,
                tags: [],
                // TODO: Move to defines/types.
                version: '0.0.1'
              }),
              api().scenes.saveScene(studioId, {
                id: sceneId,
                children: [[ELEMENT_TYPE.EVENT, eventId]],
                parent: [ELEMENT_TYPE.WORLD, null],
                tags: [],
                title: getRandomElementName(2),
                worldId
              }),
              api().events.saveEvent(studioId, {
                id: eventId,
                characters: [],
                choices: [],
                content: JSON.stringify([...DEFAULT_EVENT_CONTENT]),
                ending: false,
                images: [],
                sceneId,
                tags: [],
                title: getRandomElementName(2),
                type: EVENT_TYPE.CHOICE,
                worldId
              })
            ]

            const [savedWorld] = await Promise.all(promises)

            // const savedWorld = await api().worlds.saveWorld(
            //   studioId,
            //   game && edit
            //     ? { ...game, title, designer, version }
            //     : {
            //         children: [],
            //         designer,
            //         engine: app.version,
            //         jump: null,
            //         // TODO: Enable user-defined once more templates are supported.
            //         template: WORLD_TEMPLATE.ADVENTURE,
            //         title,
            //         tags: [],
            //         // TODO: Move to defines/types.
            //         version: '0.0.1'
            //       }
            // )

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
