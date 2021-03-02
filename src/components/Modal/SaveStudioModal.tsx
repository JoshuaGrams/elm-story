import React, { useEffect } from 'react'

import { StudioId, Studio } from '../../data/types'

import { Modal, ModalProps, Form, Input } from 'antd'

import api from '../../api'

interface SaveStudioModalProps extends ModalProps {
  studio?: Studio
  edit?: boolean
  onSave?: (studioId: StudioId) => void
}

const SaveStudioModal: React.FC<SaveStudioModalProps> = ({
  visible = false,
  onCancel,
  afterClose,
  studio,
  edit,
  onSave
}) => {
  const [saveStudioForm] = Form.useForm()

  useEffect(() => {
    if (edit && studio) {
      saveStudioForm.setFieldsValue({
        title: studio.title
      })
    }
  }, [visible])

  return (
    <Modal
      title={`${studio && edit ? 'Edit' : 'New'} Studio`}
      visible={visible}
      destroyOnClose
      onOk={(event) => {
        event.preventDefault()
        saveStudioForm.submit()
      }}
      onCancel={onCancel}
      centered
      okText="Save"
      okButtonProps={{ form: 'save-studio-form', htmlType: 'submit' }}
    >
      <Form
        id="save-studio-form"
        form={saveStudioForm}
        preserve={false}
        onFinish={async ({ title }: { title: string }) => {
          try {
            const studioId = await api().studios.saveStudio(
              studio && edit
                ? { ...studio, title }
                : { title, tags: [], games: [] }
            )

            if (onSave) onSave(studioId)
            if (afterClose) afterClose()
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
          <Input autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SaveStudioModal
