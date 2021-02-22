// @TODO: Combine common modal layouts.
import React from 'react'

import type { ModalProps } from '../../components/Modal'
import { StudioDocument } from '../../data/types'

import { Form, Button, Input, Divider } from 'antd'

import api from '../../api'

export enum STUDIO_MODAL_LAYOUT_TYPE {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

interface StudioModalLayoutProps extends ModalProps {
  studio?: StudioDocument
  type?: STUDIO_MODAL_LAYOUT_TYPE
}

const SaveStudioLayout: React.FC<StudioModalLayoutProps> = ({
  studio,
  onCreate,
  onClose
}) => {
  return (
    <>
      <h3>{studio ? 'Edit ' : 'New '} Studio</h3>
      <Form
        initialValues={{ title: studio?.title || '' }}
        onFinish={async ({ title }: { title: string }) => {
          try {
            const studioId = await api().studios.saveStudio(
              studio ? { ...studio, title } : { title, tags: [], games: [] }
            )

            if (onCreate) onCreate(studioId)
            if (onClose) onClose()
          } catch (error) {
            throw new Error(error)
          }
        }}
      >
        <Form.Item
          label="Studio Title"
          name="title"
          rules={[{ required: true, message: 'Studio title is required.' }]}
        >
          <Input />
        </Form.Item>

        <Button onClick={onClose}>Cancel</Button>
        <Button htmlType="submit" type="primary">
          Save
        </Button>
      </Form>
    </>
  )
}

const RemoveStudioLayout: React.FC<StudioModalLayoutProps> = ({
  studio,
  onRemove,
  onClose
}) => {
  if (!studio)
    throw new Error('Unable to use RemoveStudioLayout. Missing studio data.')

  return (
    <>
      <h3>Remove Studio</h3>

      <Divider />

      <div>Are you sure you want to remove studio '{studio.title}'?</div>
      <div>All games under this studio will be removed forever.</div>

      <Divider />

      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={async () => {
          if (studio && studio.id) await api().studios.removeStudio(studio.id)

          if (onRemove) onRemove()
          if (onClose) onClose()
        }}
        type="primary"
        danger
      >
        Remove
      </Button>
    </>
  )
}

const StudioModalLayout: React.FC<StudioModalLayoutProps> = ({
  studio,
  type,
  onCreate,
  onRemove,
  onClose // @BUG: not used properly; see AppModal
}) => {
  return (
    <>
      {type === STUDIO_MODAL_LAYOUT_TYPE.CREATE && (
        <SaveStudioLayout onCreate={onCreate} onClose={onClose} />
      )}
      {type === STUDIO_MODAL_LAYOUT_TYPE.EDIT && (
        <SaveStudioLayout studio={studio} onClose={onClose} />
      )}
      {type === STUDIO_MODAL_LAYOUT_TYPE.REMOVE && (
        <RemoveStudioLayout
          studio={studio}
          onRemove={onRemove}
          onClose={onClose}
        />
      )}
    </>
  )
}

export default StudioModalLayout
