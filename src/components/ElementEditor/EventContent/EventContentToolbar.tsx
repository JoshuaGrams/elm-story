import React, { useRef, useEffect } from 'react'

import { Editor, Range } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'

import { Button } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined
} from '@ant-design/icons'

import Portal from '../../Portal'

import styles from './styles.module.less'

const EventContentToolbar: React.FC = () => {
  const toolbarRef = useRef<HTMLDivElement | null>(null),
    editor = useSlate()

  useEffect(() => {
    const { selection } = editor

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      if (toolbarRef.current) {
        toolbarRef.current.style.opacity = '0'
        toolbarRef.current.style.pointerEvents = 'none'
      }
      return
    }

    const domSelection = window.getSelection(),
      domRange = domSelection?.getRangeAt(0),
      rect = domRange?.getBoundingClientRect()

    if (rect && toolbarRef.current) {
      toolbarRef.current.style.pointerEvents = 'unset'
      toolbarRef.current.style.opacity = '1'
      toolbarRef.current.style.top = `${
        rect.top + window.pageYOffset - toolbarRef.current.offsetHeight
      }px`
      toolbarRef.current.style.left = `${
        rect.left +
        window.pageXOffset -
        toolbarRef.current.offsetWidth / 2 +
        rect.width / 2
      }px`
    }
  })

  return (
    <Portal>
      <div ref={toolbarRef} className="event-content-hovering-toolbar">
        <Button>
          <BoldOutlined />
        </Button>

        <Button>
          <ItalicOutlined />
        </Button>

        <Button>
          <UnderlineOutlined />
        </Button>
      </div>
    </Portal>
  )
}

EventContentToolbar.displayName = 'EventContentHoveringToolbar'

export default EventContentToolbar
