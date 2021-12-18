import React, { memo, useContext } from 'react'

import { StudioId, ElementId, ELEMENT_TYPE } from '../../../data/types'

import { useJump, usePathsBySceneRef, useScene, useEvent } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import {
  Connection,
  Handle,
  Node,
  NodeProps,
  Position,
  useStoreActions,
  useStoreState
} from 'react-flow-renderer'

import { Divider } from 'antd'
import {
  AlignLeftOutlined,
  PartitionOutlined,
  SendOutlined
} from '@ant-design/icons'

import styles from './styles.module.less'

import { cloneDeep } from 'lodash'

import { isConnectionValid } from './EventNode'

const JumpHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  jumpId: ElementId
}> = ({ studioId, sceneId, jumpId }) => {
  const paths = usePathsBySceneRef(studioId, sceneId) || []

  return (
    <Handle
      type="target"
      id={jumpId}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Left}
      className={styles.jumpHandle}
      isValidConnection={(connection: Connection) =>
        isConnectionValid(connection, paths, 'JUMP')
      }
    />
  )
}

const JumpNode: React.FC<NodeProps> = ({ data }) => {
  const jump = useJump(data.studioId, data.jumpId),
    scene = useScene(data.studioId, jump?.path[0], [jump?.path]),
    event = useEvent(data.studioId, jump?.path[1], [jump?.path])

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

  const jumpToLink = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    sceneOnly: boolean = false
  ) => {
    event.stopPropagation()

    if (scene && jump) {
      composerDispatch({
        type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
        selectedWorldOutlineElement: {
          expanded: true,
          id: jump.path[0],
          title: scene.title,
          type: ELEMENT_TYPE.SCENE
        }
      })

      if (!sceneOnly && jump.path[1])
        setTimeout(
          () =>
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
              selectedSceneMapEvent: jump.path[1] || null
            }),
          1
        )
    }
  }

  return (
    <div className={styles.JumpNode} key={jump?.id}>
      {jump?.id && (
        <>
          <div>
            <JumpHandle
              studioId={data.studioId}
              sceneId={data.sceneId}
              jumpId={jump.id}
            />

            <h1 className="nodeJumpHeader" data-component-id={jump.id}>
              <SendOutlined className={styles.headerIcon} />
              {jump.title}
            </h1>
          </div>

          {jump?.id && (
            <div
              className={`${styles.jumpToContainer}`}
              onMouseDown={(event) => {
                const classList = (event.target as Element).classList

                if (classList.contains('nodrag')) return

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
              <div className={styles.jumpDetails}>
                {scene?.id && (
                  <>
                    <Divider>
                      <h2>
                        <PartitionOutlined /> Scene
                      </h2>
                    </Divider>

                    <div
                      className={`${styles.jumpLink} nodrag`}
                      onClick={(event) => jumpToLink(event, true)}
                    >
                      {scene.title}
                    </div>
                  </>
                )}
                {event?.id && (
                  <>
                    <Divider>
                      <h2>
                        <AlignLeftOutlined /> Event
                      </h2>
                    </Divider>

                    <div
                      className={`${styles.jumpLink} nodrag`}
                      onClick={jumpToLink}
                    >
                      {event.title}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(JumpNode)
