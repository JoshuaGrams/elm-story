import logger from '../../../lib/logger'

import React, { memo } from 'react'

import { useJump } from '../../../hooks'

import { NodeProps } from 'react-flow-renderer'

import JumpTo from '../../JumpTo'

import styles from './styles.module.less'

import api from '../../../api'

const JumpNode: React.FC<NodeProps> = ({ data }) => {
  const jump = useJump(data.studioId, data.jumpId)

  return (
    <div className={styles.jumpNode} key={jump?.id}>
      {jump?.id && (
        <>
          <h1>{jump.title}</h1>

          {jump?.id && (
            <div className={styles.jumpToContainer}>
              <JumpTo
                studioId={data.studioId}
                jumpId={jump.id}
                onRemove={async (jumpId) => {
                  // Update scene jumps array
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(JumpNode)
