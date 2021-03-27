import { Button } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  Background, // TODO: https://github.com/wbkd/react-flow/issues/1037
  MiniMap,
  Controls,
  FlowElement
} from 'react-flow-renderer'
import api from '../../../api'
import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../../data/types'

import { useScene } from '../../../hooks'

import PassageNode from './PassageNode'

import styles from './styles.module.less'

export const SceneViewTools: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId)

  const { editorDispatch } = useContext(EditorContext)

  return (
    <>
      {scene && (
        <Button
          size="small"
          onClick={async () => {
            try {
              const passage = await api().passages.savePassage(studioId, {
                gameId: scene.gameId,
                sceneId: sceneId,
                title: 'Untitled Passage',
                content: '',
                tags: []
              })

              passage.id &&
                (await api().scenes.savePassageRefsToScene(studioId, sceneId, [
                  ...scene.passages,
                  passage.id
                ]))

              editorDispatch({
                type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
                savedComponent: { id: passage.id, type: COMPONENT_TYPE.PASSAGE }
              })
            } catch (error) {
              throw new Error(error)
            }
          }}
        >
          New Passage
        </Button>
      )}
    </>
  )
}

const SceneView: React.FC<{
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
        // <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
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
        // </div>
      )}
    </>
  )
}

export default SceneView
