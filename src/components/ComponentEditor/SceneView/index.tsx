import logger from '../../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash-es'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import {
  useJumpsBySceneRef,
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
  useZoomPanHelper,
  useStoreState
} from 'react-flow-renderer'

import { Button } from 'antd'

import PassageNode from './PassageNode'
import JumpNode from './JumpNode'

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
        <>
          <Button
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
                  (await api().scenes.savePassageRefsToScene(
                    studioId,
                    sceneId,
                    [...scene.passages, passage.id]
                  ))

                editorDispatch({
                  type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
                  savedComponent: {
                    id: passage.id,
                    type: COMPONENT_TYPE.PASSAGE
                  }
                })
              } catch (error) {
                throw new Error(error)
              }
            }}
          >
            New Passage
          </Button>

          <Button
            onClick={async () => {
              const jump = await api().jumps.saveJump(studioId, {
                gameId: scene.gameId,
                sceneId,
                title: 'Untitled Jump',
                route: [scene.chapterId],
                tags: [],
                editor: {
                  componentEditorPosX: 0,
                  componentEditorPosY: 0
                }
              })

              jump.id &&
                (await api().scenes.saveJumpRefsToScene(studioId, sceneId, [
                  ...scene.jumps,
                  jump.id
                ]))

              editorDispatch({
                type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
                savedComponent: {
                  id: jump.id,
                  type: COMPONENT_TYPE.JUMP
                }
              })
            }}
          >
            New Jump
          </Button>
        </>
      )}
    </>
  )
}

const SceneView: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  const jumps = useJumpsBySceneRef(studioId, sceneId),
    scene = useScene(studioId, sceneId),
    routes = useRoutesBySceneRef(studioId, sceneId),
    passages = usePassagesBySceneRef(studioId, sceneId)

  const selectedElements = useStoreState((state) => state.selectedElements),
    setInternalElements = useStoreActions((actions) => actions.setElements),
    setSelectedElements = useStoreActions(
      (actions) => actions.setSelectedElements
    ),
    { transform } = useZoomPanHelper()

  const [ready, setReady] = useState(false),
    // TODO: Support multiple selected passages?
    [totalSelectedPassages, setTotalSelectedPassages] = useState<number>(0),
    [totalSelectedRoutes, setTotalSelectedRoutes] = useState<number>(0),
    [selectedPassage, setSelectedPassage] = useState<ComponentId | null>(null),
    [selectedChoice, setSelectedChoice] = useState<ComponentId | null>(null),
    [elements, setElements] = useState<FlowElement[]>([])

  // This is not selection.
  function highlightElements(elementsToHighlight: Elements<any> | null) {
    logger.info(`SceneView->highlightElements`)
    if (editor.selectedGameOutlineComponent.id === sceneId) {
      const clonedElements = cloneDeep(elements),
        clonedPassages = clonedElements.filter(
          (clonedElement): clonedElement is Node =>
            clonedElement.data.type === COMPONENT_TYPE.PASSAGE ||
            clonedElement.data.type === COMPONENT_TYPE.JUMP
        ),
        clonedRoutes = clonedElements.filter(
          (clonedElement): clonedElement is Edge =>
            clonedElement.data.type === COMPONENT_TYPE.ROUTE
        )

      if (elementsToHighlight) {
        const selectedPassages = clonedPassages.filter((clonedPassage) =>
            elementsToHighlight.find(
              (selectedElement) => selectedElement.id === clonedPassage.id
            )
          ),
          selectedEdges = selectedChoice
            ? clonedRoutes.filter(
                (clonedEdge) => clonedEdge.sourceHandle === selectedChoice
              )
            : clonedRoutes.filter((clonedEdge) =>
                elementsToHighlight.find(
                  (selectedElement) => selectedElement.id === clonedEdge.id
                )
              )

        if (selectedChoice) {
          clonedPassages.map((clonedPassage) => {
            clonedPassage.data.selectedChoice =
              clonedPassage.id === selectedPassage ? selectedChoice : null
          })
        }

        setInternalElements([
          ...clonedPassages,
          ...clonedRoutes.map((edge) => {
            edge.className = styles.routeNotConnectedToPassage

            !selectedChoice &&
              selectedPassages.map((selectedPassage) => {
                if (
                  edge.source === selectedPassage.id ||
                  edge.target === selectedPassage.id
                ) {
                  edge.className = 'selected'
                }
              })

            selectedEdges.map((selectedEdge) => {
              if (edge.id === selectedEdge.id) {
                edge.className = 'selected'
              }
            })

            return edge
          })
        ])
      }

      if (!elementsToHighlight) {
        setInternalElements([
          ...clonedPassages,
          ...clonedRoutes.map((edge) => {
            edge.className = ''

            return edge
          })
        ])
      }
    }
  }

  function onChoiceSelect(
    passageId: ComponentId,
    choiceId: ComponentId | null
  ) {
    logger.info(
      `Sceneview->onChoiceSelect->
       passageId: ${passageId} choiceId: ${choiceId}`
    )

    setSelectedChoice(choiceId)
  }

  async function onNodeDragStop(
    event: React.MouseEvent<Element, MouseEvent>,
    node: Node<{
      type: COMPONENT_TYPE
    }>
  ) {
    const { id, position, data } = node

    logger.info(`SceneView->onNodeDragStop->type:${data?.type}`)

    switch (data?.type) {
      case COMPONENT_TYPE.PASSAGE:
        if (passages) {
          const clonedPassage = cloneDeep(
            passages.find((passage) => passage.id === id)
          )

          clonedPassage &&
            (await api().passages.savePassage(studioId, {
              ...clonedPassage,
              editor: {
                componentEditorPosX: position.x,
                componentEditorPosY: position.y
              }
            }))
        }
        break
      case COMPONENT_TYPE.JUMP:
        if (jumps) {
          const clonedJump = cloneDeep(jumps.find((jump) => jump.id === id))

          clonedJump &&
            (await api().jumps.saveJump(studioId, {
              ...clonedJump,
              editor: {
                componentEditorPosX: position.x,
                componentEditorPosY: position.y
              }
            }))
        }
        break
      default:
        break
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
      const foundDestinationNode:
        | FlowElement<{ type: COMPONENT_TYPE }>
        | undefined = elements.find(
        (element) => element.id === connection.targetHandle
      )

      if (foundDestinationNode?.data?.type) {
        api().routes.saveRoute(studioId, {
          title: '',
          gameId: scene.gameId,
          sceneId,
          originId: connection.source,
          choiceId: connection.sourceHandle,
          originType: COMPONENT_TYPE.CHOICE,
          destinationId: connection.targetHandle,
          destinationType: foundDestinationNode.data.type,
          tags: []
        })
      }
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

  function onSelectionChange(selectedElements: Elements<any> | null) {
    logger.info('SceneView->onSelectionChange')

    let _totalSelectedPassages = 0,
      _totalSelectedRoutes = 0

    selectedElements?.map((element) => {
      element.data.type === COMPONENT_TYPE.PASSAGE && ++_totalSelectedPassages

      element.data.type === COMPONENT_TYPE.ROUTE && ++_totalSelectedRoutes
    })

    setTotalSelectedPassages(_totalSelectedPassages)
    setTotalSelectedRoutes(_totalSelectedRoutes)

    if (
      !selectedElements ||
      (selectedElements && selectedElements.length > 0)
    ) {
      setSelectedPassage(null)
      setSelectedChoice(null)
    }

    if (
      selectedElements &&
      selectedElements.length === 1 &&
      selectedElements[0].data.type === COMPONENT_TYPE.PASSAGE
    ) {
      setSelectedPassage(selectedElements[0].id)
      setSelectedChoice(null)
    }

    highlightElements(selectedElements)
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

    if (jumps && scene && passages && routes) {
      logger.info(
        `SceneView->scene,passages,routes->useEffect->have scene, passages and routes`
      )

      !ready && setReady(true)

      // TODO: optimize; this is re-rendering too much
      const nodes: Node[] = []

      passages.map((passage) => {
        // TODO: improve types

        passage.id &&
          nodes.push({
            id: passage.id,
            data: {
              studioId,
              sceneId: scene.id,
              passageId: passage.id,
              selectedChoice: null,
              onChoiceSelect,
              type: COMPONENT_TYPE.PASSAGE
            },
            type: 'passageNode',
            position: passage.editor
              ? {
                  x: passage.editor.componentEditorPosX || 0,
                  y: passage.editor.componentEditorPosY || 0
                }
              : { x: 0, y: 0 }
          })
      })

      jumps.map((jump) => {
        // TODO: improve types

        jump.id &&
          nodes.push({
            id: jump.id,
            data: { studioId, jumpId: jump.id, type: COMPONENT_TYPE.JUMP },
            type: 'jumpNode',
            position: jump.editor
              ? {
                  x: jump.editor.componentEditorPosX || 0,
                  y: jump.editor.componentEditorPosY || 0
                }
              : { x: 0, y: 0 }
          })
      })

      const edges: Edge[] = routes.map((route) => {
        if (!route.id)
          throw new Error('Unable to generate edge. Missing route ID.')

        // TODO: improve types
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
  }, [jumps, scene, passages, routes, ready])

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
    logger.info(
      `SceneView->
       editor.selectedGameOutlineComponent,
       totalSelectedPassages,
       selectedPassage,
       selectedChoice
       ->useEffect`
    )

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

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
        selectedComponentEditorSceneViewChoice: selectedChoice
      })

      highlightElements(selectedElements)
    }
  }, [
    editor.selectedGameOutlineComponent,
    totalSelectedPassages,
    selectedPassage,
    selectedChoice
  ])

  useEffect(() => {
    logger.info(`SceneView->selectedElements->useEffect`)
  }, [selectedElements])

  useEffect(() => {
    logger.info(`SceneView->elements->useEffect`)

    highlightElements(selectedElements)
  }, [elements])

  useEffect(() => {
    logger.info(`SceneView->editor.savedComponent,elements->useEffect`)

    if (editor.savedComponent.id) {
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
            passageNode: PassageNode,
            jumpNode: JumpNode
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
