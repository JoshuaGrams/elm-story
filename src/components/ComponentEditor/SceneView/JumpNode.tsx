import logger from '../../../lib/logger'

import React, { memo } from 'react'

import { NodeProps } from 'react-flow-renderer'

const JumpNode: React.FC<NodeProps> = ({ data }) => {
  return <div>JumpNode</div>
}

export default memo(JumpNode)
