import logger from '../../lib/logger'

import React, { useEffect } from 'react'

import { Form, Input } from 'antd'

const ElementTitle: React.FC<{
  title: string
  onUpdate: (title: string) => void
}> = ({ title, onUpdate }) => {
  const [editElementTitleForm] = Form.useForm()

  useEffect(() => {
    logger.info(`ElementTitle->title,editorElementTitleForm useEffect`)
    editElementTitleForm.resetFields()
  }, [title, editElementTitleForm])

  return (
    <Form
      form={editElementTitleForm}
      initialValues={{
        title
      }}
      onBlur={(event) => onUpdate(event.target.value)}
      onFinish={({ title }) => onUpdate(title)}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: 'Title is required.' }]}
        style={{ marginBottom: '15px' }}
      >
        <Input />
      </Form.Item>
    </Form>
  )
}

export default ElementTitle
