import logger from '../../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash-es'

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
  Background,
  MiniMap,
  Controls,
  FlowElement,
  Node,
  OnConnectStartParams,
  Edge,
  Connection,
  Elements,
  useStoreActions,
  FlowTransform,
  useZoomPanHelper
} from 'react-flow-renderer'

import { Button } from 'antd'

import PassageNode from './PassageNode'

import styles from './styles.module.less'

import api from '../../../api'

export const SceneViewTools: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId, [sceneId])

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

  const setSelectedElements = useStoreActions(
      (actions) => actions.setSelectedElements
    ),
    { transform } = useZoomPanHelper()

  const { editor, editorDispatch } = useContext(EditorContext)

  const [ready, setReady] = useState(false),
    // TODO: Support multiple selected passages?
    [totalSelectedPassages, setTotalSelectedPassages] = useState<number>(0),
    [totalSelectedRoutes, setTotalSelectedRoutes] = useState<number>(0),
    [selectedPassage, setSelectedPassage] = useState<ComponentId | null>(null),
    [selectedChoice, setSelectedChoice] = useState<ComponentId | null>(null),
    [elements, setElements] = useState<FlowElement[]>([])

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

    if (!editor.selectedComponentEditorSceneViewChoice) {
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
    }

    if (editor.selectedComponentEditorSceneViewChoice) {
      await api().routes.removeRoutesByChoiceRef(
        studioId,
        editor.selectedComponentEditorSceneViewChoice
      )
    }

    // TODO: issue #45
    // It's not currently possible to remove multiple passages, choices from SceneView

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

  function onSelectionChange(elements: Elements<any> | null) {
    logger.info('SceneView->onSelectionChange')

    let _totalSelectedPassages = 0,
      _totalSelectedRoutes = 0

    elements?.map((element) => {
      element.data.type === COMPONENT_TYPE.PASSAGE && ++_totalSelectedPassages

      element.data.type === COMPONENT_TYPE.ROUTE && ++_totalSelectedRoutes
    })

    setTotalSelectedPassages(_totalSelectedPassages)
    setTotalSelectedRoutes(_totalSelectedRoutes)

    if (!elements || (elements && elements.length > 0)) {
      setSelectedPassage(null)
      setSelectedChoice(null)
    }

    if (elements && elements.length === 1) {
      setSelectedPassage(elements[0].id)
      setSelectedChoice(null)
    }
  }

  async function onMoveEnd(flowTransform?: FlowTransform | undefined) {
    scene &&
      scene.id &&
      flowTransform &&
      (await api().scenes.saveSceneViewTransform(
        studioId,
        scene.id,
        flowTransform
      ))
  }

  useEffect(() => {
    logger.info(`SceneView->scene,passages,routes->useEffect`)

    if (scene && passages && routes) {
      logger.info(
        `SceneView->scene,passages,routes->useEffect->have scene, passages and routes`
      )

      !ready && setReady(true)

      // TODO: optimize; this is re-rendering too much
      const nodes: Node[] = passages.map((passage) => {
          if (!passage.id)
            throw new Error('Unable to set nodes. Missing passage ID.')

          return {
            id: passage.id,
            data: {
              studioId,
              sceneId: scene.id,
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
            animated: true,
            data: {
              type: COMPONENT_TYPE.ROUTE
            }
          }
        })

      // BUG: Unable to create edges on initial node render because choices aren't ready
      setElements([...nodes, ...edges])
    }
  }, [scene, passages, routes, ready])

  useEffect(() => {
    logger.info(`SceneView->sceneReady->useEffect`)

    ready &&
      transform({
        x: scene?.editor?.componentEditorTransformX || 0,
        y: scene?.editor?.componentEditorTransformY || 0,
        zoom: scene?.editor?.componentEditorTransformZoom || 1
      })
  }, [ready])

  useEffect(() => {
    if (editor.selectedGameOutlineComponent.id === sceneId) {
      totalSelectedPassages !==
        editor.totalComponentEditorSceneViewSelectedPassages &&
        editorDispatch({
          type:
            EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES,
          totalComponentEditorSceneViewSelectedPassages: totalSelectedPassages
        })

      totalSelectedRoutes !==
        editor.totalComponentEditorSceneViewSelectedRoutes &&
        editorDispatch({
          type:
            EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_ROUTES,
          totalComponentEditorSceneViewSelectedRoutes: totalSelectedRoutes
        })

      selectedPassage !== editor.selectedComponentEditorSceneViewPassage &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
          selectedComponentEditorSceneViewPassage: selectedPassage
        })

      selectedChoice !== editor.selectedComponentEditorSceneViewChoice &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
          selectedComponentEditorSceneViewChoice: selectedChoice
        })
    }
  }, [
    editor.selectedGameOutlineComponent,
    totalSelectedPassages,
    selectedPassage,
    selectedChoice
  ])

  useEffect(() => {
    if (editor.savedComponent.id) {
      logger.info(`SceneView->editor.savedComponent,elements->useEffect`)

      const foundElement = cloneDeep(
        elements.find((element) => element.id === editor.savedComponent.id)
      )

      foundElement && setSelectedElements([foundElement])

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
        savedComponent: { id: undefined, type: undefined }
      })
    }
  }, [editor.savedComponent, elements])

  return (
    <>
      {passages && (
        <ReactFlow
          className={styles.sceneView}
          snapToGrid
          nodeTypes={{
            passageNode: PassageNode
          }}
          snapGrid={[4, 4]}
          onlyRenderVisibleElements={false}
          // TODO: fit to saved editor transform (pan/zoom)
          onLoad={(reactFlowInstance) => reactFlowInstance.fitView()}
          elements={elements}
          onElementsRemove={
            editor.selectedGameOutlineComponent.id === scene?.id
              ? onElementsRemove
              : undefined
          }
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
          onSelectionChange={onSelectionChange}
          onMoveEnd={onMoveEnd}
        >
          <Background
            size={1}
            className={styles.background}
            color={'hsl(0, 0%, 10%)'}
          />
          <Controls className={styles.control} />
          <MiniMap />
        </ReactFlow>
      )}
    </>
  )
}

export default SceneView
