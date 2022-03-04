import { ipcRenderer, clipboard } from 'electron'
import isUrl from 'is-url'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Range, Transforms } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'

import { Button, Form, Input, Popover } from 'antd'
import Icon, { DeleteOutlined } from '@ant-design/icons'

import { LinkElement } from '../../../../data/eventContentTypes'

import styles from './styles.module.less'
import { WINDOW_EVENT_TYPE } from '../../../../lib/events'

const ClipboardIcon: React.FC = (props) => (
  <Icon
    component={() => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
      </svg>
    )}
    {...props}
  />
)

const OpenLinkIcon: React.FC = (props) => (
  <Icon
    component={() => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          fillRule="evenodd"
          d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
        />
        <path
          fillRule="evenodd"
          d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
        />
      </svg>
    )}
  />
)

const LinkElementEditor: React.FC<{ element: LinkElement }> = ({
  element,
  children
}) => {
  const [linkForm] = Form.useForm(),
    inputRef = useRef<Input>(null)

  const editor = useSlate(),
    { selection } = editor

  const [popoverVisible, setPopoverVisible] = useState(false),
    [selectionIsCollapsed, setSelectionIsCollapsed] = useState(false),
    [urlValue, setUrlValue] = useState<string | undefined>(undefined)

  const saveLinkUrl = ({ url }: { url?: string }) => {
    const linkElementPath = ReactEditor.findPath(editor, element)

    Transforms.setNodes<LinkElement>(
      editor,
      {
        url
      },
      { at: linkElementPath }
    )

    setPopoverVisible(false)
  }

  const removeLink = () => {
    const linkElementPath = ReactEditor.findPath(editor, element)

    Transforms.removeNodes(editor, { at: linkElementPath })
  }

  const setUrlToClipboardText = useCallback(() => {
    const text = clipboard.readText('clipboard')

    setUrlValue(text)
    linkForm.setFieldsValue({ url: text })

    linkForm.validateFields()
  }, [linkForm])

  useEffect(() => {
    setSelectionIsCollapsed(
      selection && Range.isCollapsed(selection) ? true : false
    )
  }, [selection])

  useEffect(() => {
    if (popoverVisible) {
      setUrlValue(element.url)
      linkForm.resetFields()
    }
  }, [popoverVisible, linkForm])

  return (
    <Popover
      content={
        <div className={styles.container}>
          <Form
            form={linkForm}
            initialValues={{ url: element.url }}
            onValuesChange={(changedValues) => setUrlValue(changedValues.url)}
            onFinish={saveLinkUrl}
          >
            <Form.Item
              name="url"
              rules={[
                {
                  validator: (_, value) => {
                    return new Promise((resolve, reject) => {
                      if (!value || (value && isUrl(value))) {
                        resolve('Valid URL format.')
                      }

                      reject('Invalid URL format.')
                    })
                  }
                }
              ]}
            >
              <Input placeholder="Enter URL..." ref={inputRef} />
            </Form.Item>

            <div
              className={styles.buttons}
              style={{
                gridTemplateColumns:
                  urlValue && isUrl(urlValue)
                    ? '1fr auto auto auto'
                    : '1fr auto auto'
              }}
            >
              <Button
                danger
                size="small"
                title="Remove link"
                onMouseDown={removeLink}
              >
                <DeleteOutlined />
              </Button>
              <Button
                size="small"
                title="Paste link from clipboard"
                onMouseDown={setUrlToClipboardText}
              >
                <ClipboardIcon />
              </Button>

              {urlValue && isUrl(urlValue) && (
                <Button
                  size="small"
                  title="Open in browser"
                  htmlType="submit"
                  onMouseDown={() =>
                    ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                      urlValue
                    ])
                  }
                >
                  <OpenLinkIcon />
                </Button>
              )}

              <Button
                type="primary"
                size="small"
                title="Save link"
                htmlType="submit"
              >
                Save
              </Button>
            </div>
          </Form>
        </div>
      }
      visible={popoverVisible && selectionIsCollapsed}
      // visible={true}
      overlayClassName="es-link-element-editor__popover"
      mouseEnterDelay={0.5}
      mouseLeaveDelay={1}
      destroyTooltipOnHide
      onVisibleChange={(visible) =>
        setPopoverVisible(selectionIsCollapsed && visible ? true : false)
      }
    >
      {children}
    </Popover>
  )
}

LinkElementEditor.displayName = 'LinkElementEditor'

export default LinkElementEditor
