import logger from '../../lib/logger'

import React, { useEffect } from 'react'

import { Form, Input } from 'antd'

const ComponentTitle: React.FC<{
  title: string
  onUpdate: (title: string) => void
}> = ({ title, onUpdate }) => {
  const [editComponentTitleForm] = Form.useForm()

  useEffect(() => {
    logger.info(`ComponentTitle->title,editorComponentTitleForm useEffect`)
    editComponentTitleForm.resetFields()
  }, [title, editComponentTitleForm])

  return (
    <Form
      form={editComponentTitleForm}
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

export default ComponentTitle
