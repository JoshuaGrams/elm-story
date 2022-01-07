import {
  isElementActive,
  isLeafActive,
  toggleElement,
  toggleLeaf
} from '../../../lib/contentEditor'

import React, { useRef, useEffect } from 'react'

import { Editor, Range } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'

import { ELEMENT_FORMATS, LEAF_FORMATS } from '../../../data/eventContentTypes'

import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined
} from '@ant-design/icons'

import Portal from '../../Portal'
import ElementDropdown from './Tools/ElementDropdown'
import AlignDropdown from './Tools/AlignDropdown'

import styles from './toolbarStyles.module.less'

const LeafButton: React.FC<{
  format: ELEMENT_FORMATS | LEAF_FORMATS
  type: 'element' | 'leaf'
}> = ({ format, type, children }) => {
  const editor = useSlate()

  const isActive =
    type === 'element'
      ? isElementActive(editor, format as ELEMENT_FORMATS)
      : isLeafActive(editor, format as LEAF_FORMATS)

  return (
    <div
      className={`${styles.leafButton} ${isActive ? styles.active : ''}`}
      onMouseDown={(event) => {
        event.preventDefault()

        type === 'element' &&
          toggleElement(editor, format as ELEMENT_FORMATS, isActive)
        type === 'leaf' && toggleLeaf(editor, format as LEAF_FORMATS, isActive)
      }}
    >
      {children || format}
    </div>
  )
}

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
      toolbarRef.current.style.top = `${Math.round(
        rect.top + window.pageYOffset - toolbarRef.current.offsetHeight - 4
      )}px`
      toolbarRef.current.style.left = `${Math.round(
        rect.left +
          window.pageXOffset -
          toolbarRef.current.offsetWidth / 2 +
          rect.width / 2
      )}px`
    }
  })

  return (
    <Portal>
      <div ref={toolbarRef} className="event-content-hovering-toolbar">
        <div className={styles.elementTools}>
          <ElementDropdown />
        </div>

        <div className={styles.leafTools}>
          <LeafButton format={LEAF_FORMATS.STRONG} type="leaf">
            <BoldOutlined />
          </LeafButton>

          <LeafButton format={LEAF_FORMATS.EM} type="leaf">
            <ItalicOutlined />
          </LeafButton>

          <LeafButton format={LEAF_FORMATS.U} type="leaf">
            <UnderlineOutlined />
          </LeafButton>

          <LeafButton format={LEAF_FORMATS.S} type="leaf">
            <StrikethroughOutlined />
          </LeafButton>
        </div>

        <div className={styles.alignTools}>
          <AlignDropdown />
        </div>
      </div>
    </Portal>
  )
}

EventContentToolbar.displayName = 'EventContentHoveringToolbar'

export default EventContentToolbar
