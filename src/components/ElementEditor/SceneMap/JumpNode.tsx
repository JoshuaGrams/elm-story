import React, { memo, useContext, useEffect, useState } from 'react'

import { StudioId, ElementId, ELEMENT_TYPE, Path } from '../../../data/types'

import { useJump, usePathsBySceneRef, useScene, useEvent } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import {
  Connection,
  FlowElement,
  Handle,
  Node,
  NodeProps,
  Position,
  useStoreState
} from 'react-flow-renderer'

import { Divider } from 'antd'
import {
  AlignLeftOutlined,
  NodeExpandOutlined,
  PartitionOutlined
} from '@ant-design/icons'

import NodeTitle from './NodeTitle'

import styles from './styles.module.less'

import { isConnectionValid } from './EventNode'
import { NodeData } from '.'
import { EVENT_TYPE } from '../../../../engine/tsc-build/src/types'

const JumpHandle: React.FC<{
  jumpId: ElementId
  scenePaths: Path[]
}> = ({ jumpId, scenePaths }) => {
  return (
    <Handle
      type="target"
      id={jumpId}
      position={Position.Left}
      className={styles.jumpHandle}
      isValidConnection={(connection: Connection) =>
        isConnectionValid(connection, scenePaths, 'JUMP')
      }
    >
      <div
        className={`${styles.visual} ${styles.jumpHandleVisual}`}
        style={{
          background: scenePaths.find((path) => path.destinationId === jumpId)
            ? 'var(--jump-node-handle-gradient-left-active)'
            : 'var(--node-handle-gradient-left)'
        }}
      />
    </Handle>
  )
}

const JumpNode: React.FC<NodeProps> = ({ data }) => {
  const jump = useJump(data.studioId, data.jumpId),
    scene = useScene(data.studioId, jump?.path[0], [jump?.path]),
    event = useEvent(data.studioId, jump?.path[1], [jump?.path])

  const [incomingConnection, setIncomingConnection] = useState<{
    active: boolean
    valid: boolean
  }>({
    active: false,
    valid: false
  })

  const { composer, composerDispatch } = useContext(ComposerContext)

  const scenePaths = usePathsBySceneRef(data.studioId, data.sceneId, []) || []

  const nodes: FlowElement<NodeData>[] = useStoreState((state) => state.nodes)

  // const jumps = useStoreState((state) =>
  //     state.nodes.filter(
  //       (node: Node<{ type: ELEMENT_TYPE }>) =>
  //         node?.data?.type === ELEMENT_TYPE.JUMP
  //     )
  //   ),
  //   setSelectedElement = useStoreActions(
  //     (actions) => actions.setSelectedElements
  //   )

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

  useEffect(() => {
    !composer.selectedSceneMapConnectStartData &&
      setIncomingConnection({ active: false, valid: false })
  }, [composer.selectedSceneMapConnectStartData])

  return (
    <div
      className={styles.JumpNode}
      key={jump?.id}
      onMouseEnter={() => {
        const { sceneId, nodeId, handleId, handleType } =
          composer.selectedSceneMapConnectStartData || {}

        if (sceneId && data.sceneId === sceneId && nodeId !== data.jumpId) {
          const foundSourceNode = nodes.find((node) => node.id === nodeId)

          if (foundSourceNode) {
            const valid =
              handleType === 'source' &&
              isConnectionValid(
                {
                  source:
                    handleType === 'source' ? nodeId || null : data.jumpId,
                  sourceHandle: handleId || null,
                  target:
                    handleType === 'source' ? data.jumpId : nodeId || null,
                  targetHandle:
                    handleType === 'source' ? data.jumpId : nodeId || null
                },
                scenePaths,
                foundSourceNode.data?.eventType || EVENT_TYPE.JUMP
              )

            setIncomingConnection({
              ...incomingConnection,
              active: true,
              valid
            })

            composerDispatch({
              type:
                COMPOSER_ACTION_TYPE.SET_SELECTED_SCENE_MAP_CONNECT_START_DATA,
              selectedSceneMapConnectStartData: composer.selectedSceneMapConnectStartData
                ? {
                    ...composer.selectedSceneMapConnectStartData,
                    targetNodeId: valid ? data.jumpId : null
                  }
                : null
            })
          }
        }

        // source: "ca62eafa-ec8b-430c-8daf-493b3d59c173"
        // sourceHandle: "4a8cff3c-0f83-4ad6-81fe-ff4861580e56"
        // target: "386df056-002d-4f07-b170-b8adc5a3bc68"
        // targetHandle: "386df056-002d-4f07-b170-b8adc5a3bc68"

        // handleId: "4a8cff3c-0f83-4ad6-81fe-ff4861580e56" // sourceHandle or targetHandle
        // handleType: "source" // or target
        // nodeId: "ca62eafa-ec8b-430c-8daf-493b3d59c173" // source
        // sceneId: "a0ef93e4-50c2-447f-8802-614401219ed2" // coming from scene
      }}
    >
      <div
        className={`es-scene-map__connection-cover es-scene-map__jump-node ${
          incomingConnection.active && incomingConnection.valid
            ? 'es-scene-map__connection-valid'
            : ''
        } ${
          incomingConnection.active && !incomingConnection.valid
            ? 'es-scene-map__connection-invalid'
            : ''
        }`}
      />

      {jump?.id && (
        <>
          <div>
            <div>
              <NodeTitle studioId={data.studioId} jump={jump} />
            </div>

            <JumpHandle jumpId={jump.id} scenePaths={scenePaths} />
          </div>

          {jump?.id && (
            <div className={`${styles.jumpToContainer}`}>
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
