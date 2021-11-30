import React, { memo, useContext } from 'react'

import { ElementId, COMPONENT_TYPE } from '../../../data/types'

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

import { FastForwardOutlined } from '@ant-design/icons'

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

            <h1 className="nodeJumpHeader" data-component-id={jump.id}>
              <FastForwardOutlined className={styles.headerIcon} />
              {jump.title}
            </h1>
          </div>

          {jump?.id && (
            <div
              className={`${styles.jumpToContainer}`}
              onMouseDown={() => {
                if (
                  jump.id &&
                  editor.selectedComponentEditorSceneViewJump !== jump.id
                ) {
                  setSelectedElement([
                    cloneDeep(jumps.find((jumpNode) => jumpNode.id === jump.id))
                  ])

                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_JUMPS,
                    totalComponentEditorSceneViewSelectedJumps: 1
                  })

                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
                    selectedComponentEditorSceneViewJump: jump.id
                  })

                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                    selectedComponentEditorSceneViewPassage: null
                  })

                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
                    selectedComponentEditorSceneViewChoice: null
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
