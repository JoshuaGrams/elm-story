import { Button } from 'antd'
import { cloneDeep } from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  Background, // TODO: https://github.com/wbkd/react-flow/issues/1037
  MiniMap,
  Controls,
  FlowElement,
  Node
} from 'react-flow-renderer'
import api from '../../../api'
import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../../data/types'

import { usePassagesBySceneRef, useScene } from '../../../hooks'

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
                choices: [],
                content: '',
                tags: [],
                editor: {
                  componentEditorPosX: 0,
                  componentEditorPosY: 0
                }
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
  const passages = usePassagesBySceneRef(studioId, sceneId)

  const [nodes, setNodes] = useState<FlowElement[]>([])

  async function onNodeDragStop(
    event: React.MouseEvent<Element, MouseEvent>,
    node: Node<any>
  ) {
    if (passages) {
      const { id, position } = node,
        clonedPassage = cloneDeep(passages.find((passage) => passage.id === id))

      if (clonedPassage) {
        await api().passages.savePassage(studioId, {
          ...clonedPassage,
          editor: {
            componentEditorPosX: position.x,
            componentEditorPosY: position.y
          }
        })
      }
    }
  }

  useEffect(() => {
    if (passages) {
      setNodes(
        passages.map((passage) => {
          if (!passage.id)
            throw new Error('Unable to set nodes. Missing passage ID.')

          return {
            id: passage.id,
            data: {
              studioId,
              passageId: passage.id
            },
            type: 'passageNode',
            position: passage.editor
              ? {
                  x: passage.editor.componentEditorPosX || 0,
                  y: passage.editor.componentEditorPosY || 0
                }
              : { x: 0, y: 0 }
          }
        })
      )
    }
  }, [passages])

  return (
    <>
      {passages && (
        // <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <ReactFlowProvider>
          <ReactFlow
            elements={nodes}
            snapToGrid
            nodeTypes={{
              passageNode: PassageNode
            }}
            onNodeDragStop={onNodeDragStop}
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
