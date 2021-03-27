import React, { useEffect, useState } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  Background, // TODO: https://github.com/wbkd/react-flow/issues/1037
  MiniMap,
  Controls,
  FlowElement
} from 'react-flow-renderer'

import { ComponentId, StudioId } from '../../../data/types'

import { useScene } from '../../../hooks'

import PassageNode from './PassageNode'

import styles from './styles.module.less'

const SceneTabContent: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId)

  const [nodes, setNodes] = useState<FlowElement[]>([])

  useEffect(() => {
    if (scene) {
      setNodes(
        scene?.passages.map((passageId) => ({
          id: passageId,
          data: {
            studioId,
            passageId
          },
          type: 'passageNode',
          position: { x: 250, y: 5 }
        }))
      )
    }
  }, [scene])

  return (
    <>
      {scene && (
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <ReactFlowProvider>
            <ReactFlow
              elements={nodes}
              snapToGrid
              nodeTypes={{
                passageNode: PassageNode
              }}
            >
              <Background size={1} />
              <Controls className={styles.control} />
              <MiniMap />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      )}
    </>
  )
}

export default SceneTabContent
