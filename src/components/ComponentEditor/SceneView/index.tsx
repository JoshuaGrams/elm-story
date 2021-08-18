import logger from '../../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash-es'

import {
  ComponentId,
  COMPONENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  Scene,
  StudioId
} from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import {
  useDebouncedResizeObserver,
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

import ContextMenu from './ContextMenu'
import RouteEdge, { RouteEdgeData } from './RouteEdge'
import PassageNode from './PassageNode'
import JumpNode from './JumpNode'

import styles from './styles.module.less'

import api from '../../../api'

export enum DEFAULT_NODE_SIZE {
  PASSAGE_WIDTH = 197,
  PASSAGE_HEIGHT = 68,
  JUMP_WIDTH = 230,
  JUMP_HEIGHT = 200
}

export const SceneViewTools: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId, [sceneId])

  const { editor, editorDispatch } = useContext(EditorContext)

  return (
    <>
      {scene && (
        <>
          {/* Add Passage Button */}
          <Button
            onClick={async () => {
              try {
                const passageId = await onAddComponent(
                  studioId,
                  scene,
                  COMPONENT_TYPE.PASSAGE,
                  {
                    x:
                      editor.selectedComponentEditorSceneViewCenter.x -
                      DEFAULT_NODE_SIZE.PASSAGE_WIDTH / 2,
                    y:
                      editor.selectedComponentEditorSceneViewCenter.y -
                      DEFAULT_NODE_SIZE.PASSAGE_HEIGHT / 2
                  }
                )

                if (passageId)
                  editorDispatch({
                    type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
                    savedComponent: {
                      id: passageId,
                      type: COMPONENT_TYPE.PASSAGE
                    }
                  })
              } catch (error) {
                throw new Error(error)
              }
            }}
          >
            Add Passage
          </Button>

          {/* Add Jump Button */}
          <Button
            onClick={async () => {
              const jumpId = await onAddComponent(
                studioId,
                scene,
                COMPONENT_TYPE.JUMP,
                {
                  x:
                    editor.selectedComponentEditorSceneViewCenter.x -
                    DEFAULT_NODE_SIZE.JUMP_WIDTH / 2,
                  y:
                    editor.selectedComponentEditorSceneViewCenter.y -
                    DEFAULT_NODE_SIZE.JUMP_HEIGHT / 2
                }
              )

              if (jumpId)
                editorDispatch({
                  type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
                  savedComponent: {
                    id: jumpId,
                    type: COMPONENT_TYPE.JUMP
                  }
                })
            }}
          >
            Add Jump
          </Button>

          {/* Remove Scene Button */}
          <Button
            danger
            onClick={async () => {
              const sceneRemovePromises: Promise<void>[] = []
              let foundSceneIndex = -1

              editorDispatch({
                type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE,
                removedComponent: {
                  type: COMPONENT_TYPE.SCENE,
                  id: sceneId
                }
              })

              try {
                if (scene.parent[0] === COMPONENT_TYPE.GAME) {
                  const updatedGameChildren = (
                    await api().games.getGame(studioId, scene.gameId)
                  ).children

                  foundSceneIndex = updatedGameChildren.findIndex(
                    (child) => child[1] === scene.id
                  )

                  updatedGameChildren.splice(foundSceneIndex, 1)

                  sceneRemovePromises.push(
                    api().games.saveChildRefsToGame(
                      studioId,
                      scene.gameId,
                      updatedGameChildren
                    )
                  )
                }

                if (
                  scene.parent[0] === COMPONENT_TYPE.FOLDER &&
                  scene.parent[1]
                ) {
                  const updatedFolderChildren = (
                    await api().folders.getFolder(studioId, scene.parent[1])
                  ).children

                  foundSceneIndex = updatedFolderChildren.findIndex(
                    (child) => child[1] === scene.id
                  )

                  updatedFolderChildren.splice(foundSceneIndex, 1)

                  sceneRemovePromises.push(
                    api().folders.saveChildRefsToFolder(
                      studioId,
                      scene.parent[1],
                      updatedFolderChildren
                    )
                  )
                }

                sceneRemovePromises.push(
                  api().scenes.removeScene(studioId, sceneId)
                )

                await Promise.all(sceneRemovePromises)
              } catch (error) {
                throw error
              }
            }}
          >
            Remove Scene
          </Button>
        </>
      )}
    </>
  )
}

async function onAddComponent(
  studioId: StudioId,
  scene: Scene,
  type: COMPONENT_TYPE,
  position: { x: number; y: number }
): Promise<ComponentId | undefined> {
  if (scene.id) {
    switch (type) {
      case COMPONENT_TYPE.PASSAGE:
        const passage = await api().passages.savePassage(studioId, {
          gameId: scene.gameId,
          sceneId: scene.id,
          title: 'Untitled Passage',
          choices: [],
          content: JSON.stringify([...DEFAULT_PASSAGE_CONTENT]),
          tags: [],
          editor: {
            componentEditorPosX: position.x,
            componentEditorPosY: position.y
          }
        })

        passage.id &&
          (await api().scenes.saveChildRefsToScene(studioId, scene.id, [
            ...scene.children,
            [COMPONENT_TYPE.PASSAGE, passage.id]
          ]))

        return passage.id
      case COMPONENT_TYPE.JUMP:
        const jump = await api().jumps.saveJump(studioId, {
          gameId: scene.gameId,
          sceneId: scene.id,
          title: 'Untitled Jump',
          route: [scene.id],
          tags: [],
          editor: {
            componentEditorPosX: position.x,
            componentEditorPosY: position.y
          }
        })

        jump.id &&
          (await api().scenes.saveJumpRefsToScene(studioId, scene.id, [
            ...scene.jumps,
            jump.id
          ]))

        return jump.id
      default:
        return undefined
    }
  }

  return undefined
}

const SceneView: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const {
    ref: flowWrapperRef,
    width: flowWrapperRefWidth,
    height: flowWrapperRefHeight
  } = useDebouncedResizeObserver(500)

  const { editor, editorDispatch } = useContext(EditorContext)

  const jumps = useJumpsBySceneRef(studioId, sceneId),
    scene = useScene(studioId, sceneId),
    routes = useRoutesBySceneRef(studioId, sceneId),
    passages = usePassagesBySceneRef(studioId, sceneId)

  const currentZoom = useStoreState((state) => state.transform[2]),
    selectedElements = useStoreState((state) => state.selectedElements),
    setInternalElements = useStoreActions((actions) => actions.setElements),
    setSelectedElements = useStoreActions(
      (actions) => actions.setSelectedElements
    ),
    { transform, project } = useZoomPanHelper()

  const [ready, setReady] = useState(false),
    // TODO: Support multiple selected jump and passages?
    [totalSelectedJumps, setTotalSelectedJumps] = useState<number>(0),
    [totalSelectedPassages, setTotalSelectedPassages] = useState<number>(0),
    [totalSelectedRoutes, setTotalSelectedRoutes] = useState<number>(0),
    [selectedJump, setSelectedJump] = useState<ComponentId | null>(null),
    [selectedPassage, setSelectedPassage] = useState<ComponentId | null>(null),
    [selectedRoute, setSelectedRoute] = useState<ComponentId | null>(null),
    [selectedChoice, setSelectedChoice] = useState<ComponentId | null>(null),
    [elements, setElements] = useState<FlowElement[]>([]),
    [paneMoving, setPaneMoving] = useState(false)

  function setSelectedSceneViewCenter() {
    editorDispatch({
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CENTER,
      selectedComponentEditorSceneViewCenter: {
        ...project({
          x: flowWrapperRefWidth / 2,
          y: flowWrapperRefHeight / 2
        }),
        zoom: currentZoom
      }
    })
  }

  // This is not selection.
  function highlightElements(elementsToHighlight: Elements<any> | null) {
    logger.info(`SceneView->highlightElements`)

    if (editor.selectedGameOutlineComponent.id === sceneId) {
      const clonedElements = cloneDeep(elements),
        clonedJumps = clonedElements.filter(
          (clonedElement): clonedElement is Node =>
            clonedElement.data.type === COMPONENT_TYPE.JUMP
        ),
        clonedPassages = clonedElements.filter(
          (clonedElement): clonedElement is Node =>
            clonedElement.data.type === COMPONENT_TYPE.PASSAGE
        ),
        clonedRoutes = clonedElements.filter(
          (clonedElement): clonedElement is Edge =>
            clonedElement.data.type === COMPONENT_TYPE.ROUTE
        )

      if (elementsToHighlight) {
        const selectedJumps = clonedJumps.filter((clonedJump) =>
            elementsToHighlight.find(
              (selectedElement) => selectedElement.id === clonedJump.id
            )
          ),
          selectedPassages = clonedPassages.filter((clonedPassage) =>
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
          ...clonedJumps,
          ...clonedPassages,
          ...clonedRoutes.map((edge) => {
            edge.className = styles.routeNotConnected

            !selectedChoice &&
              selectedJumps.map((selectedJump) => {
                if (
                  edge.source === selectedJump.id ||
                  edge.target === selectedJump.id
                ) {
                  edge.className = 'selected jump'
                }
              }) &&
              selectedPassages.map((selectedPassage) => {
                if (
                  edge.source === selectedPassage.id ||
                  edge.target === selectedPassage.id
                ) {
                  edge.className = 'selected passage'
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
          ...clonedJumps,
          ...clonedPassages,
          ...clonedRoutes.map((edge) => {
            edge.className = ''

            return edge
          })
        ])
      }
    }
  }

  async function onNodeDragStop(
    _: React.MouseEvent<Element, MouseEvent>,
    node: Node<{
      type: COMPONENT_TYPE
    }>
  ) {
    const { id, position, data } = node

    logger.info(`SceneView->onNodeDragStop->type:${data?.type}`)

    switch (data?.type) {
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
          title: 'Untitled Route',
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

  async function onElementsRemove(elements: Elements<any>) {
    logger.info('onElementsRemove')

    if (!editor.selectedComponentEditorSceneViewChoice) {
      const jumpRefs: ComponentId[] = [],
        routeRefs: ComponentId[] = [],
        passageRefs: ComponentId[] = []

      elements.map((element) => {
        switch (element.data.type) {
          // TODO: #45
          // case COMPONENT_TYPE.JUMP:
          //   jumpRefs.push(element.id)
          //   break
          case COMPONENT_TYPE.ROUTE:
            routeRefs.push(element.id)
            break
          // TODO: #45
          // case COMPONENT_TYPE.PASSAGE:
          //   passageRefs.push(element.id)
          //   break
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
    // It's not currently possible to remove multiple jumps, passages, choices from SceneView

    // const clonedScene = cloneDeep(scene)

    // if (clonedScene && clonedScene.id) {
    //   await Promise.all([
    //     api().scenes.saveChildRefsToScene(
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

  async function onSelectionDragStop(
    event: React.MouseEvent<Element, MouseEvent>,
    nodes: Node<{ type: COMPONENT_TYPE }>[]
  ) {
    if (jumps && passages) {
      const clonedJumps =
          cloneDeep(
            jumps.filter(
              (jump) => nodes.find((node) => node.id == jump.id) !== undefined
            )
          ) || [],
        clonedPassages =
          cloneDeep(
            passages.filter(
              (passage) =>
                nodes.find((node) => node.id === passage.id) !== undefined
            )
          ) || []

      await Promise.all([
        clonedJumps.map(async (clonedJump) => {
          // TODO: cache this
          const foundNode = nodes.find((node) => node.id === clonedJump.id)

          foundNode &&
            (await api().jumps.saveJump(studioId, {
              ...clonedJump,
              editor: {
                componentEditorPosX: foundNode.position.x,
                componentEditorPosY: foundNode.position.y
              }
            }))
        }),
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
      ])
    }
  }

  function onSelectionChange(selectedElements: Elements<any> | null) {
    logger.info('SceneView->onSelectionChange')

    let _totalSelectedJumps = 0,
      _totalSelectedPassages = 0,
      _totalSelectedRoutes = 0

    selectedElements?.map((element) => {
      switch (element.data.type) {
        case COMPONENT_TYPE.JUMP:
          _totalSelectedJumps++
          break
        case COMPONENT_TYPE.PASSAGE:
          _totalSelectedPassages++
          break
        case COMPONENT_TYPE.ROUTE:
          _totalSelectedRoutes++
          break
        default:
          break
      }
    })

    setTotalSelectedJumps(_totalSelectedJumps)
    setTotalSelectedPassages(_totalSelectedPassages)
    setTotalSelectedRoutes(_totalSelectedRoutes)

    if (
      !selectedElements ||
      (selectedElements && selectedElements.length > 0)
    ) {
      setSelectedJump(null)
      setSelectedPassage(null)
      setSelectedRoute(null)
      setSelectedChoice(null)
    }

    if (selectedElements && selectedElements.length === 1) {
      selectedElements[0].data.type === COMPONENT_TYPE.JUMP &&
        setSelectedJump(selectedElements[0].id)

      selectedElements[0].data.type === COMPONENT_TYPE.PASSAGE &&
        setSelectedPassage(selectedElements[0].id)

      selectedElements[0].data.type === COMPONENT_TYPE.ROUTE &&
        setSelectedRoute(selectedElements[0].id)

      setSelectedChoice(null)
    }

    highlightElements(selectedElements)
  }

  async function onMoveEnd(flowTransform?: FlowTransform | undefined) {
    setPaneMoving(false)

    if (scene?.id && flowTransform) {
      setSelectedSceneViewCenter()

      await api().scenes.saveSceneViewTransform(
        studioId,
        scene.id,
        flowTransform
      )
    }
  }

  useEffect(() => {
    logger.info(`SceneView->scene,passages,routes->useEffect`)

    if (jumps && scene && passages && routes) {
      logger.info(
        `SceneView->scene,passages,routes->useEffect->have scene, passages and routes`
      )

      !ready && setReady(true)

      // TODO: optimize; this is re-rendering too much
      const nodes: Node<{
        studioId: StudioId
        sceneId?: ComponentId
        jumpId?: ComponentId
        passageId?: ComponentId
        selectedChoice?: ComponentId | null
        onChoiceSelect?: (
          passageId: ComponentId,
          choiceId: ComponentId | null
        ) => void
        type: COMPONENT_TYPE
      }>[] = []

      jumps.map((jump) => {
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

      passages.map((passage) => {
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

      const edges: Edge<RouteEdgeData>[] = routes.map((route) => {
        if (!route.id)
          throw new Error('Unable to generate edge. Missing route ID.')

        return {
          id: route.id,
          source: route.originId,
          sourceHandle: route.choiceId,
          target: route.destinationId,
          targetHandle: route.destinationId,
          type: 'routeEdge',
          animated: true,
          data: {
            type: COMPONENT_TYPE.ROUTE,
            studioId,
            routeId: route.id
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
       selectedJump,
       selectedPassage,
       selectedChoice
       ->useEffect`
    )

    if (editor.selectedGameOutlineComponent.id === sceneId) {
      totalSelectedJumps !==
        editor.totalComponentEditorSceneViewSelectedJumps &&
        editorDispatch({
          type:
            EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_JUMPS,
          totalComponentEditorSceneViewSelectedJumps: totalSelectedJumps
        })

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

      selectedJump !== editor.selectedComponentEditorSceneViewJump &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
          selectedComponentEditorSceneViewJump: selectedJump
        })

      selectedPassage !== editor.selectedComponentEditorSceneViewPassage &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
          selectedComponentEditorSceneViewPassage: selectedPassage
        })

      selectedRoute !== editor.selectedComponentEditorSceneViewRoute &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_ROUTE,
          selectedComponentEditorSceneViewRoute: selectedRoute
        })

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
        selectedComponentEditorSceneViewChoice: selectedChoice
      })

      highlightElements(selectedElements)
    }
  }, [
    editor.selectedGameOutlineComponent,
    totalSelectedJumps,
    totalSelectedPassages,
    selectedJump,
    selectedPassage,
    selectedRoute,
    selectedChoice
  ])

  useEffect(() => {
    editor.selectedGameOutlineComponent.id === sceneId &&
      setSelectedSceneViewCenter()
  }, [
    editor.selectedGameOutlineComponent,
    flowWrapperRefWidth,
    flowWrapperRefHeight,
    currentZoom
  ])

  useEffect(() => {
    logger.info(`SceneView->selectedElements->useEffect->nothing`)
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
        <div
          id={`scene-view-${sceneId}`}
          className={styles.SceneView}
          ref={flowWrapperRef}
        >
          <ContextMenu
            trigger={`scene-view-${sceneId}`}
            features={[
              {
                className: 'react-flow__pane',
                items: [
                  [
                    'Add Passage',
                    async ({ clickPosition }) => {
                      if (scene) {
                        const passageId = await onAddComponent(
                          studioId,
                          scene,
                          COMPONENT_TYPE.PASSAGE,
                          project(clickPosition)
                        )

                        if (passageId)
                          editorDispatch({
                            type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
                            savedComponent: {
                              id: passageId,
                              type: COMPONENT_TYPE.PASSAGE
                            }
                          })
                      }
                    }
                  ],
                  [
                    'Add Jump',
                    async ({ clickPosition }) => {
                      if (scene) {
                        const jumpId = await onAddComponent(
                          studioId,
                          scene,
                          COMPONENT_TYPE.JUMP,
                          project(clickPosition)
                        )

                        if (jumpId)
                          editorDispatch({
                            type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
                            savedComponent: {
                              id: jumpId,
                              type: COMPONENT_TYPE.JUMP
                            }
                          })
                      }
                    }
                  ]
                ]
              },
              {
                className: 'nodePassageHeader',
                items: [
                  ['Edit Passage', () => console.log('edit passage')],
                  ['Remove Passage', () => console.log('remove passage')]
                ]
              },
              {
                className: 'nodeJumpHeader',
                items: [['Remove Jump', () => console.log('remove jump')]]
              }
            ]}
            forceHide={paneMoving}
          />

          <ReactFlow
            snapToGrid
            nodeTypes={{
              passageNode: PassageNode,
              jumpNode: JumpNode
            }}
            edgeTypes={{
              routeEdge: RouteEdge
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
            onMove={() => {
              setPaneMoving(true)
            }}
            onMoveEnd={onMoveEnd}
          >
            <Background
              size={1}
              className={styles.background}
              color={'hsl(0, 0%, 10%)'}
            />
            <Controls className={styles.control} />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'passageNode':
                    return 'hsl(265, 100%, 60%)'
                  case 'jumpNode':
                    return 'hsl(160, 100%, 60%)'
                  default:
                    return '#000'
                }
              }}
              nodeBorderRadius={10}
            />
          </ReactFlow>
        </div>
      )}
    </>
  )
}

export default SceneView
