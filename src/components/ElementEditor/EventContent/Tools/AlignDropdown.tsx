import { getActiveAlignType } from '../../../../lib/contentEditor'

import React, { useCallback, useEffect, useState } from 'react'

import { ALIGN_TYPE } from '../../../../data/eventContentTypes'

import { Transforms } from 'slate'
import { useSlate } from 'slate-react'

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  DownOutlined
} from '@ant-design/icons'
import { Dropdown, Menu } from 'antd'

import styles from './styles.module.less'

const AlignDropdown: React.FC = () => {
  const editor = useSlate()

  const [currentAlignType, setCurrentAlignType] = useState<ALIGN_TYPE>(
    ALIGN_TYPE.LEFT
  )

  const changeAlign = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>, type: ALIGN_TYPE) => {
      event.preventDefault()

      const { selection } = editor

      if (!selection) return

      setCurrentAlignType(type)

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
    },
    []
  )

  useEffect(() => setCurrentAlignType(getActiveAlignType(editor)), [
    editor.selection
  ])

  return (
    <Dropdown
      // @ts-ignore
      autoDestroy
      overlayClassName="event-content-align-dropdown-menu"
      overlay={
        <Menu>
          <Menu.Item
            onMouseDown={(event) => changeAlign(event, ALIGN_TYPE.LEFT)}
            className={
              currentAlignType === ALIGN_TYPE.LEFT ? styles.activeElement : ''
            }
          >
            <AlignLeftOutlined className={styles.icon} /> Left
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeAlign(event, ALIGN_TYPE.CENTER)}
            className={
              currentAlignType === ALIGN_TYPE.CENTER ? styles.activeElement : ''
            }
          >
            <AlignCenterOutlined className={styles.icon} /> Center
          </Menu.Item>
          <Menu.Item
            onMouseDown={(event) => changeAlign(event, ALIGN_TYPE.RIGHT)}
            className={
              currentAlignType === ALIGN_TYPE.RIGHT ? styles.activeElement : ''
            }
          >
            <AlignRightOutlined className={styles.icon} /> Right
          </Menu.Item>
        </Menu>
      }
    >
      <div
        className={styles.AlignDropdown}
        onMouseDown={(event) => event.preventDefault()}
      >
        {currentAlignType === ALIGN_TYPE.LEFT && (
          <>
            <AlignLeftOutlined className={styles.iconHighlight} /> Left
          </>
        )}
        {currentAlignType === ALIGN_TYPE.CENTER && (
          <>
            <AlignCenterOutlined className={styles.iconHighlight} /> Center
          </>
        )}
        {currentAlignType === ALIGN_TYPE.RIGHT && (
          <>
            <AlignRightOutlined className={styles.iconHighlight} /> Right
          </>
        )}{' '}
        <DownOutlined />
      </div>
    </Dropdown>
  )
}

AlignDropdown.displayName = 'AlignDropdown'

export default AlignDropdown
