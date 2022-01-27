import React, { memo, useContext, useEffect, useState } from 'react'

import { StudioId, ElementId, ELEMENT_TYPE } from '../../../data/types'

import { useJump, usePathsBySceneRef, useScene, useEvent } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import { Connection, Handle, NodeProps, Position } from 'react-flow-renderer'

import { Divider } from 'antd'
import { AlignLeftOutlined, PartitionOutlined } from '@ant-design/icons'

import NodeTitle from './NodeTitle'

import styles from './styles.module.less'

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
      style={{
        top: '50%',
        bottom: '50%',
        background: paths.find((path) => path.destinationId === jumpId)
          ? 'white'
          : 'black'
      }}
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

  const [incomingConnection, setIncomingConnection] = useState<{
    active: boolean
    possible: boolean
  }>({
    active: false,
    possible: false
  })

  const { composer } = useContext(ComposerContext)

  // const jumps = useStoreState((state) =>
  //     state.nodes.filter(
  //       (node: Node<{ type: ELEMENT_TYPE }>) =>
  //         node?.data?.type === ELEMENT_TYPE.JUMP
  //     )
  //   ),
  //   setSelectedElement = useStoreActions(
  //     (actions) => actions.setSelectedElements
  //   )

  const { composerDispatch } = useContext(ComposerContext)

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
      setIncomingConnection({ active: false, possible: false })
  }, [composer.selectedSceneMapConnectStartData])

  return (
    <div
      className={styles.JumpNode}
      key={jump?.id}
      onMouseEnter={() => {
        const { sceneId, nodeId, handleId, handleType } =
          composer.selectedSceneMapConnectStartData || {}

        console.log(sceneId)
        console.log(data.sceneId)

        if (sceneId && data.sceneId === sceneId && nodeId !== data.jumpId) {
          setIncomingConnection({ ...incomingConnection, active: true })
          console.log(composer.selectedSceneMapConnectStartData)
        }
      }}
    >
      <div
        className={`es-scene-map__connection-cover es-scene-map__jump-node ${
          incomingConnection.active ? styles.incomingConnectionActive : ''
        }`}
      />

      {jump?.id && (
        <>
          <div>
            <div>
              <NodeTitle studioId={data.studioId} jump={jump} />
            </div>

            <JumpHandle
              studioId={data.studioId}
              sceneId={data.sceneId}
              jumpId={jump.id}
            />
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
