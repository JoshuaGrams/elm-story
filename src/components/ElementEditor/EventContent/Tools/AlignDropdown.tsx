import { getActiveAlign } from '../../../../lib/contentEditor'

import React, { useEffect, useState } from 'react'

import { ALIGN_TYPE } from '../../../../data/eventContentTypes'

import { Editor, Transforms } from 'slate'
import { useFocused, useSlate } from 'slate-react'

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  DownOutlined
} from '@ant-design/icons'
import { Dropdown, Menu } from 'antd'

import styles from './styles.module.less'

const AlignDropdown: React.FC = () => {
  const focused = useFocused()
  const editor = useSlate()

  const [currentAlign, setCurrentAlign] = useState<ALIGN_TYPE>(ALIGN_TYPE.LEFT)

  const changeAlign = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    type: ALIGN_TYPE
  ) => {
    event.preventDefault()

    const { selection } = editor

    if (!selection) return

    setCurrentAlign(type)

    const { anchor, focus } = selection

    // TODO: handle elements at the end that don't support alignment
    Transforms.setNodes(
      editor,
      { align: type === ALIGN_TYPE.LEFT ? undefined : type },
      {
        at: {
          anchor: { path: [anchor.path[0], 0], offset: 0 },
          focus: {
            path: [focus.path[0], 0],
            offset: focus.offset
          }
        }
      }
    )

    Transforms.collapse(editor, { edge: 'end' })
  }

  useEffect(() => setCurrentAlign(getActiveAlign(editor)), [editor.selection])

  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item
            onMouseDown={(event) => changeAlign(event, ALIGN_TYPE.LEFT)}
            style={{
              color:
                currentAlign === ALIGN_TYPE.LEFT
                  ? 'var(--highlight-color)'
                  : 'unset'
            }}
          >
            <AlignLeftOutlined /> Left
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeAlign(event, ALIGN_TYPE.CENTER)}
            style={{
              color:
                currentAlign === ALIGN_TYPE.CENTER
                  ? 'var(--highlight-color)'
                  : 'unset'
            }}
          >
            <AlignCenterOutlined /> Center
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeAlign(event, ALIGN_TYPE.RIGHT)}
            style={{
              color:
                currentAlign === ALIGN_TYPE.RIGHT
                  ? 'var(--highlight-color)'
                  : 'unset'
            }}
          >
            <AlignRightOutlined /> Right
          </Menu.Item>
        </Menu>
      }
    >
      <div
        className={styles.AlignDropdown}
        onMouseDown={(event) => event.preventDefault()}
      >
        {currentAlign === ALIGN_TYPE.LEFT && (
          <>
            <AlignLeftOutlined /> Left
          </>
        )}
        {currentAlign === ALIGN_TYPE.CENTER && (
          <>
            <AlignCenterOutlined /> Center
          </>
        )}
        {currentAlign === ALIGN_TYPE.RIGHT && (
          <>
            <AlignRightOutlined /> Right
          </>
        )}{' '}
        <DownOutlined />
      </div>
    </Dropdown>
  )
}

AlignDropdown.displayName = 'AlignDropdown'

export default AlignDropdown
