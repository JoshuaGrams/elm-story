import { getActiveAlign, isAlignActive } from '../../../../lib/contentEditor'

import React, { useEffect, useState } from 'react'

import { useSlate } from 'slate-react'

import { ALIGN_TYPE } from '../../../../data/eventContentTypes'

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined
} from '@ant-design/icons'
import { Button, Menu, Select } from 'antd'
import { Transforms } from 'slate'

const AlignButton: React.FC<{ type: ALIGN_TYPE }> = ({ type }) => {
  const editor = useSlate()

  let icon: JSX.Element

  switch (type) {
    case ALIGN_TYPE.CENTER:
      icon = <AlignCenterOutlined />
      break
    case ALIGN_TYPE.RIGHT:
      icon = <AlignRightOutlined />
      break
    case ALIGN_TYPE.LEFT:
    default:
      icon = <AlignLeftOutlined />
      break
  }

  const isActive = isAlignActive(editor, type)

  return (
    <Button
      style={{
        border: '1px solid',
        borderColor: isActive ? '#8E4CFF' : 'hsl(0, 0%, 20%)'
      }}
      onMouseDown={(event) => {
        event.preventDefault()

        const { selection } = editor

        if (!selection) return

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
      }}
    >
      {icon}
    </Button>
  )
}

const AlginSelect: React.FC = () => {
  const editor = useSlate()

  const [currentAlign, setCurrentAlign] = useState<ALIGN_TYPE>(ALIGN_TYPE.LEFT)

  useEffect(() => setCurrentAlign(getActiveAlign(editor)), [editor.selection])

  return (
    <Select value={currentAlign}>
      <Select.Option value={ALIGN_TYPE.LEFT}>
        <AlignButton type={ALIGN_TYPE.LEFT} />
      </Select.Option>

      <Select.Option value={ALIGN_TYPE.CENTER}>
        <AlignButton type={ALIGN_TYPE.CENTER} />
      </Select.Option>

      <Select.Option value={ALIGN_TYPE.RIGHT}>
        <AlignButton type={ALIGN_TYPE.RIGHT} />
      </Select.Option>
    </Select>
  )
}

AlginSelect.displayName = 'AlignSelect'

export default AlginSelect
