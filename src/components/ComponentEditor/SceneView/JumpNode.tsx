import logger from '../../../lib/logger'

import React, { memo, useContext } from 'react'

import { ComponentId, COMPONENT_TYPE } from '../../../data/types'

import { useJump } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import {
  Handle,
  Node,
  NodeProps,
  Position,
  useStoreActions,
  useStoreState
} from 'react-flow-renderer'

import { DeleteOutlined, ForwardOutlined } from '@ant-design/icons'

import JumpTo from '../../JumpTo'

import styles from './styles.module.less'

import api from '../../../api'
import { cloneDeep } from 'lodash'

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

  const jumps = useStoreState((state) =>
      state.nodes.filter(
        (node: Node<{ type: COMPONENT_TYPE }>) =>
          node?.data?.type === COMPONENT_TYPE.JUMP
      )
    ),
    setSelectedElement = useStoreActions(
      (actions) => actions.setSelectedElements
    )

  const { editor, editorDispatch } = useContext(EditorContext)

  return (
    <div className={styles.jumpNode} key={jump?.id}>
      {jump?.id && (
        <>
          <div>
            <JumpHandle jumpId={jump.id} />

            <h1 className="nodeHeader">
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

          <div
            className={`${styles.removeJumpBtn} nodrag`}
            onClick={async () => {
              logger.info(`JumpNode->removeJumpBtn->onClick`)

              if (editor.selectedComponentEditorSceneViewJump === jump.id) {
                if (jump.sceneId) {
                  const scene = await api().scenes.getScene(
                      data.studioId,
                      jump.sceneId
                    ),
                    clonedJumpRefs = [...scene.jumps],
                    jumpRefIndex = clonedJumpRefs.findIndex(
                      (clonedJumpRef) => clonedJumpRef === jump.id
                    )

                  if (jumpRefIndex !== -1) {
                    clonedJumpRefs.splice(jumpRefIndex, 1)

                    await api().scenes.saveJumpRefsToScene(
                      data.studioId,
                      jump.sceneId,
                      clonedJumpRefs
                    )
                  }
                }

                await api().jumps.removeJump(data.studioId, jump.id)
              } else {
                jump.id &&
                  setSelectedElement([
                    cloneDeep(jumps.find((jumpNode) => jumpNode.id === jump.id))
                  ]) &&
                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
                    selectedComponentEditorSceneViewJump: jump.id
                  }) &&
                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                    selectedComponentEditorSceneViewPassage: null
                  }) &&
                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
                    selectedComponentEditorSceneViewChoice: null
                  })
              }
            }}
          >
            <DeleteOutlined />
          </div>
        </>
      )}
    </div>
  )
}

export default memo(JumpNode)
