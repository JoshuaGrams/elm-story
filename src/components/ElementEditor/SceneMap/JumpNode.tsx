import React, { memo, useContext } from 'react'

import { ElementId, ELEMENT_TYPE } from '../../../data/types'

import { useJump } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import {
  Handle,
  Node,
  NodeProps,
  Position,
  useStoreActions,
  useStoreState
} from 'react-flow-renderer'

import { SendOutlined } from '@ant-design/icons'

import JumpTo from '../../JumpTo'

import styles from './styles.module.less'

import { cloneDeep } from 'lodash'

const JumpHandle: React.FC<{ jumpId: ElementId }> = ({ jumpId }) => {
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

  const jumps = useStoreState((state) =>
      state.nodes.filter(
        (node: Node<{ type: ELEMENT_TYPE }>) =>
          node?.data?.type === ELEMENT_TYPE.JUMP
      )
    ),
    setSelectedElement = useStoreActions(
      (actions) => actions.setSelectedElements
    )

  const { composer, composerDispatch } = useContext(ComposerContext)

  return (
    <div className={styles.jumpNode} key={jump?.id}>
      {jump?.id && (
        <>
          <div>
            <JumpHandle jumpId={jump.id} />

            <h1 className="nodeJumpHeader" data-component-id={jump.id}>
              <SendOutlined className={styles.headerIcon} />
              {jump.title}
            </h1>
          </div>

          {jump?.id && (
            <div
              className={`${styles.jumpToContainer}`}
              onMouseDown={() => {
                if (jump.id && composer.selectedSceneMapJump !== jump.id) {
                  setSelectedElement([
                    cloneDeep(jumps.find((jumpNode) => jumpNode.id === jump.id))
                  ])

                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
                    selectedSceneMapJump: jump.id
                  })

                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                    selectedSceneMapEvent: null
                  })

                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE,
                    selectedSceneMapChoice: null
                  })
                }
              }}
            >
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