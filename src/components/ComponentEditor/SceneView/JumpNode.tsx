import logger from '../../../lib/logger'

import React, { memo } from 'react'

import { ComponentId } from '../../../data/types'

import { useJump } from '../../../hooks'

import { Handle, NodeProps, Position } from 'react-flow-renderer'

import { DeleteOutlined, ForwardOutlined } from '@ant-design/icons'

import JumpTo from '../../JumpTo'

import styles from './styles.module.less'

import api from '../../../api'

const JumpHandle: React.FC<{ jumpId: ComponentId }> = ({ jumpId }) => {
  return (
    <Handle
      type="target"
      id={jumpId}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Left}
      className={styles.jumpHandle}
    />
  )
}

const JumpNode: React.FC<NodeProps> = ({ data }) => {
  const jump = useJump(data.studioId, data.jumpId)

  return (
    <div className={styles.jumpNode} key={jump?.id}>
      {jump?.id && (
        <>
          <div>
            <JumpHandle jumpId={jump.id} />

            <h1>
              <ForwardOutlined className={styles.headerIcon} />
              {jump.title}
            </h1>
          </div>

          {jump?.id && (
            <div className={`${styles.jumpToContainer} nodrag`}>
              <JumpTo
                studioId={data.studioId}
                jumpId={jump.id}
                onRemove={async (jumpId) => {
                  // Update scene jumps array
                }}
              />
            </div>
          )}

          <div className={`${styles.removeJumpBtn} nodrag`}>
            <DeleteOutlined />
          </div>
        </>
      )}
    </div>
  )
}

export default memo(JumpNode)
