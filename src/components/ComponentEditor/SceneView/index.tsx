import logger from '../../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import {
  usePassagesBySceneRef,
  useRoutesBySceneRef,
  useScene
} from '../../../hooks'

import ReactFlow, {
  ReactFlowProvider,
  Background,
  MiniMap,
  Controls,
  FlowElement,
  Node,
  OnConnectStartParams,
  Edge,
  Connection,
  Elements,
  ArrowHeadType
} from 'react-flow-renderer'

import { Button } from 'antd'

import PassageNode from './PassageNode'

import styles from './styles.module.less'

import api from '../../../api'

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
  const scene = useScene(studioId, sceneId),
    routes = useRoutesBySceneRef(studioId, sceneId),
    passages = usePassagesBySceneRef(studioId, sceneId)

  const [elements, setElements] = useState<FlowElement[]>([])

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

  async function onConnect(connection: Edge<any> | Connection) {
    logger.info('onConnect')

    if (
      scene &&
      connection.source &&
      connection.sourceHandle &&
      connection.targetHandle
    ) {
      api().routes.saveRoute(studioId, {
        title: '',
        gameId: scene.gameId,
        sceneId,
        originId: connection.source,
        choiceId: connection.sourceHandle,
        originType: COMPONENT_TYPE.CHOICE,
        destinationId: connection.targetHandle,
        destinationType: COMPONENT_TYPE.PASSAGE,
        tags: []
      })
    }
  }

  async function onSelectionDragStop(
    event: React.MouseEvent<Element, MouseEvent>,
    nodes: Node<any>[]
  ) {
    if (passages) {
      const clonedPassages =
        cloneDeep(
          passages.filter(
            (passage) =>
              nodes.find((node) => node.id === passage.id) !== undefined
          )
        ) || []

      Promise.all(
        clonedPassages.map(async (clonedPassage) => {
          // TODO: cache this
          const foundNode = nodes.find((node) => node.id === clonedPassage.id)

          foundNode &&
            (await api().passages.savePassage(studioId, {
              ...clonedPassage,
              editor: {
                componentEditorPosX: foundNode.position.x,
                componentEditorPosY: foundNode.position.y
              }
            }))
        })
      )
    }
  }

  async function onElementsRemove(elements: Elements<any>) {
    logger.info('onElementsRemove')

    const routeRefs: ComponentId[] = [],
      passageRefs: ComponentId[] = []

    elements.map((element) => {
      // TODO: improve types
      switch (element.data.type as COMPONENT_TYPE) {
        case COMPONENT_TYPE.ROUTE:
          routeRefs.push(element.id)
          break
        case COMPONENT_TYPE.PASSAGE:
          passageRefs.push(element.id)
          break
        default:
          logger.info('Unknown element type.')
          return
      }
    })

    await Promise.all(
      routeRefs.map(async (routeRef) => {
        await api().routes.removeRoute(studioId, routeRef)
      })
    )

    // TODO: issue #45

    // const clonedScene = cloneDeep(scene)

    // if (clonedScene && clonedScene.id) {
    //   await Promise.all([
    //     api().scenes.savePassageRefsToScene(
    //       studioId,
    //       clonedScene.id,
    //       clonedScene.passages.filter(
    //         (passageRef) => !passageRefs.includes(passageRef)
    //       )
    //     ),
    //     passageRefs.map(async (passageRef) => {
    //       await api().passages.removePassage(studioId, passageRef)
    //     })
    //   ])
    // }
  }

  useEffect(() => {
    if (passages && routes) {
      // TODO: optimize; this is re-rendering too much
      const nodes: Node[] = passages.map((passage) => {
          if (!passage.id)
            throw new Error('Unable to set nodes. Missing passage ID.')

          return {
            id: passage.id,
            data: {
              studioId,
              passageId: passage.id,
              type: COMPONENT_TYPE.PASSAGE
            },
            type: 'passageNode',
            position: passage.editor
              ? {
                  x: passage.editor.componentEditorPosX || 0,
                  y: passage.editor.componentEditorPosY || 0
                }
              : { x: 0, y: 0 }
          }
        }),
        edges: Edge[] = routes.map((route) => {
          if (!route.id)
            throw new Error('Unable to generate edge. Missing route ID.')

          return {
            id: route.id,
            source: route.originId,
            sourceHandle: route.choiceId, // TODO: this will change with entrances / exits
            target: route.destinationId,
            targetHandle: route.destinationId,
            type: 'default',
            arrowHeadType: ArrowHeadType.ArrowClosed,
            animated: true,
            data: {
              type: COMPONENT_TYPE.ROUTE
            }
          }
        })

      // BUG: Unable to create edges on initial node render because choices aren't ready
      setElements([...nodes, ...edges])
    }
  }, [passages, routes])

  return (
    <>
      {passages && (
        <ReactFlowProvider>
          <ReactFlow
            snapToGrid
            nodeTypes={{
              passageNode: PassageNode
            }}
            onlyRenderVisibleElements={false}
            // TODO: fit to saved editor transform (pan/zoom)
            onLoad={(reactFlowInstance) => reactFlowInstance.fitView()}
            elements={elements}
            onElementsRemove={onElementsRemove}
            onNodeDragStop={onNodeDragStop}
            onConnectStart={(
              event: React.MouseEvent<Element, MouseEvent>,
              params: OnConnectStartParams
            ) => {
              // nodeId: passage ID
              // handleId: passage ID or choice ID
              // handleType: 'target' passage ID / 'source' choice ID
              logger.info('onConnectStart')
            }}
            onConnect={onConnect}
            elementsSelectable
            onSelectionDragStop={onSelectionDragStop}
            onSelectionChange={(elements: Elements<any> | null) => {
              logger.info('onSelectionChange')
              console.log(elements)
            }}
          >
            <Background size={1} />
            <Controls className={styles.control} />
            <MiniMap />
          </ReactFlow>
        </ReactFlowProvider>
      )}
    </>
  )
}

export default SceneView
