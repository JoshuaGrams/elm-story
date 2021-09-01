import logger from '../../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash-es'

import {
  ComponentId,
  COMPONENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  PASSAGE_TYPE,
  Scene,
  StudioId
} from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'
import {
  EditorTabContext,
  EDITOR_TAB_ACTION_TYPE,
  SCENE_VIEW_CONTEXT
} from '../../../contexts/EditorTabContext'

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
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'

import ContextMenu from './ContextMenu'
import RouteEdge, { RouteEdgeData } from './RouteEdge'
import PassageNode from './PassageNode'
import JumpNode from './JumpNode'
import PassageView from '../PassageView'

import styles from './styles.module.less'

import api from '../../../api'

export enum DEFAULT_NODE_SIZE {
  PASSAGE_WIDTH = 198,
  PASSAGE_HEIGHT = 69,
  JUMP_WIDTH = 214,
  JUMP_HEIGHT = 117,
  JUMP_HEIGHT_EXTENDED = 171
}

interface NodeData {
  studioId: StudioId
  sceneId?: ComponentId
  jumpId?: ComponentId
  passageId?: ComponentId
  passageType?: PASSAGE_TYPE
  selectedChoice?: ComponentId | null
  onEditPassage?: (passageId: ComponentId) => void
  onChoiceSelect?: (
    passageId: ComponentId,
    choiceId: ComponentId | null
  ) => void
  inputId?: ComponentId
  type: COMPONENT_TYPE
}

export const SceneViewTools: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId, [sceneId])

  const { editor, editorDispatch } = useContext(EditorContext),
    { editorTab, editorTabDispatch } = useContext(EditorTabContext)

  return (
    <>
      {scene && (
        <>
          {editorTab.sceneViewContext ===
            SCENE_VIEW_CONTEXT.SCENE_SELECTION_NONE && (
            <>
              {/* Add Passage Button */}
              <Button
                onClick={async () => {
                  try {
                    const passageId = await addComponentToScene(
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
                <PlusOutlined /> Passage
              </Button>

              {/* Add Jump Button */}
              <Button
                onClick={async () => {
                  const jumpId = await addComponentToScene(
                    studioId,
                    scene,
                    COMPONENT_TYPE.JUMP,
                    {
                      x:
                        editor.selectedComponentEditorSceneViewCenter.x -
                        DEFAULT_NODE_SIZE.JUMP_WIDTH / 2,
                      y:
                        editor.selectedComponentEditorSceneViewCenter.y -
                        (scene.children.length === 0
                          ? DEFAULT_NODE_SIZE.JUMP_HEIGHT
                          : DEFAULT_NODE_SIZE.JUMP_HEIGHT_EXTENDED) /
                          2
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
                <PlusOutlined /> Jump
              </Button>
            </>
          )}

          {(editorTab.sceneViewContext === SCENE_VIEW_CONTEXT.SCENE_SELECTION ||
            editorTab.sceneViewContext ===
              SCENE_VIEW_CONTEXT.SCENE_SELECTION_JUMP ||
            editorTab.sceneViewContext ===
              SCENE_VIEW_CONTEXT.SCENE_SELECTION_PASSAGE) &&
            !editorTab.passageForEditing.visible && (
              <Button
                onClick={() =>
                  !editor.centeredComponentEditorSceneViewSelection &&
                  editorDispatch({
                    type:
                      EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_CENTERED_SELECTION,
                    centeredComponentEditorSceneViewSelection: true
                  })
                }
              >
                Center Selection
              </Button>
            )}

          {editorTab.passageForEditing.visible && (
            <Button
              onClick={() =>
                editorTabDispatch({
                  type: EDITOR_TAB_ACTION_TYPE.EDIT_PASSAGE,
                  passageForEditing: { id: undefined, visible: false }
                })
              }
            >
              <CloseOutlined /> Close Passage
            </Button>
          )}
        </>
      )}
    </>
  )
}

async function addComponentToScene(
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
          type: PASSAGE_TYPE.CHOICE,
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

async function removeComponentFromScene(
  studioId: StudioId,
  scene: Scene,
  type: COMPONENT_TYPE,
  id: ComponentId
): Promise<void> {
  if (scene.id) {
    switch (type) {
      case COMPONENT_TYPE.PASSAGE:
        const clonedChildRefs = [...scene.children],
          passageRefIndex = clonedChildRefs.findIndex(
            (clonedPassageRef) => clonedPassageRef[1] === id
          )

        if (passageRefIndex !== -1) {
          clonedChildRefs.splice(passageRefIndex, 1)

          await api().scenes.saveChildRefsToScene(
            studioId,
            scene.id,
            clonedChildRefs
          )
        }

        await api().passages.removePassage(studioId, id)

        break
      case COMPONENT_TYPE.JUMP:
        const clonedJumpRefs = [...scene.jumps],
          jumpRefIndex = clonedJumpRefs.findIndex(
            (clonedJumpRef) => clonedJumpRef === id
          )

        if (jumpRefIndex !== -1) {
          clonedJumpRefs.splice(jumpRefIndex, 1)

          await api().scenes.saveJumpRefsToScene(
            studioId,
            scene.id,
            clonedJumpRefs
          )
        }

        await api().jumps.removeJump(studioId, id)

        break
      default:
        break
    }
  }
}

function findElement(elements: FlowElement[], componentId: ComponentId | null) {
  if (!componentId) return undefined

  return cloneDeep(elements.find((element) => element.id === componentId))
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

  const { editor, editorDispatch } = useContext(EditorContext),
    { editorTab, editorTabDispatch } = useContext(EditorTabContext)

  const jumps = useJumpsBySceneRef(studioId, sceneId),
    scene = useScene(studioId, sceneId),
    routes = useRoutesBySceneRef(studioId, sceneId),
    passages = usePassagesBySceneRef(studioId, sceneId)

  const currentZoom = useStoreState((state) => state.transform[2]),
    nodes = useStoreState((state) => state.nodes),
    selectedElements = useStoreState((state) => state.selectedElements),
    setInternalElements = useStoreActions((actions) => actions.setElements),
    setSelectedElements = useStoreActions(
      (actions) => actions.setSelectedElements
    ),
    { transform, project, setCenter } = useZoomPanHelper()

  const [ready, setReady] = useState(false),
    // TODO: Support multiple selected jump and passages?
    [totalSelectedJumps, setTotalSelectedJumps] = useState<number>(0),
    [totalSelectedPassages, setTotalSelectedPassages] = useState<number>(0),
    [totalSelectedRoutes, setTotalSelectedRoutes] = useState<number>(0),
    [selectedJump, setSelectedJump] = useState<ComponentId | null>(null),
    [selectedPassage, setSelectedPassage] = useState<ComponentId | null>(
      editor.selectedComponentEditorSceneViewPassage
    ),
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
      const foundSourceNode:
          | FlowElement<{ passageType: PASSAGE_TYPE }>
          | undefined = elements.find(
          (element) => element.id === connection.source
        ),
        foundDestinationNode:
          | FlowElement<{ type: COMPONENT_TYPE }>
          | undefined = elements.find(
          (element) => element.id === connection.targetHandle
        )

      if (
        foundSourceNode?.data?.passageType &&
        foundDestinationNode?.data?.type
      ) {
        api().routes.saveRoute(studioId, {
          title: 'Untitled Route',
          gameId: scene.gameId,
          sceneId,
          originId: connection.source,
          choiceId:
            foundSourceNode?.data.passageType === PASSAGE_TYPE.CHOICE
              ? connection.sourceHandle
              : undefined,
          inputId:
            foundSourceNode?.data.passageType === PASSAGE_TYPE.INPUT
              ? connection.sourceHandle
              : undefined,
          originType: foundSourceNode?.data.passageType,
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

  // When selecting a nested component e.g. passage from the GameOutline
  function selectElement(componentId: ComponentId | null) {
    const foundElement = findElement(elements, componentId || null)

    foundElement && setSelectedElements([foundElement])
  }

  function centerSelection() {
    if (nodes && selectedElements) {
      if (selectedElements.length === 1) {
        const foundNode = nodes.find(
          (node) => node.id === selectedElements[0].id
        )

        foundNode &&
          setCenter(
            foundNode.position.x + foundNode.__rf.width / 2,
            foundNode.position.y + foundNode.__rf.height / 2,
            currentZoom
          )
      }

      if (selectedElements.length > 1) {
        const selectedNodes = nodes.filter(
          (node) =>
            selectedElements.findIndex((element) => node.id === element.id) !==
            -1
        )

        const minXElement = selectedNodes.reduce((acc, loc) =>
            acc.position.x < loc.position.x ? acc : loc
          ),
          maxXElement = selectedNodes.reduce((acc, loc) =>
            acc.position.x > loc.position.x ? acc : loc
          ),
          minYElement = selectedNodes.reduce((acc, loc) =>
            acc.position.y < loc.position.y ? acc : loc
          ),
          maxYElement = selectedNodes.reduce((acc, loc) =>
            acc.position.y > loc.position.y ? acc : loc
          )

        const foundWidth =
            selectedNodes.find((node) => node.id === maxXElement.id)?.__rf
              .width || 0,
          foundHeight =
            selectedNodes.find((node) => node.id === maxYElement.id)?.__rf
              .height || 0

        setCenter(
          (minXElement.position.x + maxXElement.position.x + foundWidth) / 2,
          (minYElement.position.y + maxYElement.position.y + foundHeight) / 2,
          currentZoom
        )
      }

      setSelectedSceneViewCenter()
    }
  }

  function setContext() {
    if (
      totalSelectedJumps === 0 &&
      totalSelectedPassages === 0 &&
      editorTab.sceneViewContext !== SCENE_VIEW_CONTEXT.SCENE_SELECTION_NONE
    )
      editorTabDispatch({
        type: EDITOR_TAB_ACTION_TYPE.SCENE_VIEW_CONTEXT,
        sceneViewContext: SCENE_VIEW_CONTEXT.SCENE_SELECTION_NONE
      })

    if (
      totalSelectedJumps > 1 ||
      (totalSelectedPassages > 1 &&
        editorTab.sceneViewContext !== SCENE_VIEW_CONTEXT.SCENE_SELECTION)
    )
      editorTabDispatch({
        type: EDITOR_TAB_ACTION_TYPE.SCENE_VIEW_CONTEXT,
        sceneViewContext: SCENE_VIEW_CONTEXT.SCENE_SELECTION
      })

    if (
      totalSelectedJumps === 1 &&
      totalSelectedPassages === 0 &&
      editorTab.sceneViewContext !== SCENE_VIEW_CONTEXT.SCENE_SELECTION_JUMP
    )
      editorTabDispatch({
        type: EDITOR_TAB_ACTION_TYPE.SCENE_VIEW_CONTEXT,
        sceneViewContext: SCENE_VIEW_CONTEXT.SCENE_SELECTION_JUMP
      })

    if (
      totalSelectedJumps === 0 &&
      totalSelectedPassages === 1 &&
      editorTab.sceneViewContext !== SCENE_VIEW_CONTEXT.SCENE_SELECTION_PASSAGE
    )
      editorTabDispatch({
        type: EDITOR_TAB_ACTION_TYPE.SCENE_VIEW_CONTEXT,
        sceneViewContext: SCENE_VIEW_CONTEXT.SCENE_SELECTION_PASSAGE
      })
  }

  useEffect(() => {
    logger.info(`SceneView->scene,passages,routes->useEffect`)

    if (jumps && scene && passages && routes) {
      logger.info(
        `SceneView->scene,passages,routes->useEffect->have scene, passages and routes`
      )

      !ready && setReady(true)

      // TODO: optimize; this is re-rendering too much
      const nodes: Node<NodeData>[] = []

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
        if (scene.id && passage.id) {
          let passageNodeData: NodeData = {
            studioId,
            sceneId: scene.id,
            onEditPassage: (id: ComponentId) =>
              editorTabDispatch({
                type: EDITOR_TAB_ACTION_TYPE.EDIT_PASSAGE,
                passageForEditing: { id, visible: true }
              }),
            passageId: passage.id,
            passageType: passage.type,

            type: COMPONENT_TYPE.PASSAGE
          }

          switch (passage.type) {
            case PASSAGE_TYPE.CHOICE:
              passageNodeData = {
                ...passageNodeData,
                selectedChoice: null,
                onChoiceSelect
              }
              break
            case PASSAGE_TYPE.INPUT:
              if (passage.input)
                passageNodeData = {
                  ...passageNodeData,
                  inputId: passage.input
                }
              break
            default:
              break
          }

          nodes.push({
            id: passage.id,
            data: passageNodeData,
            type: 'passageNode',
            position: passage.editor
              ? {
                  x: passage.editor.componentEditorPosX || 0,
                  y: passage.editor.componentEditorPosY || 0
                }
              : { x: 0, y: 0 }
          })
        }
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
      setContext()

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
    logger.info(
      `SceneView->editor.selectedComponentEditorSceneViewPassage/Jump->useEffects`
    )

    selectElement(
      editor.selectedComponentEditorSceneViewPassage ||
        editor.selectedComponentEditorSceneViewJump
    )
  }, [
    editor.selectedComponentEditorSceneViewPassage,
    editor.selectedComponentEditorSceneViewJump
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

    const foundElement = findElement(elements, editor.savedComponent.id || null)

    if (foundElement) {
      setSelectedElements([foundElement])

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_SAVE,
        savedComponent: { id: undefined, type: undefined }
      })
    }
  }, [editor.savedComponent, elements])

  useEffect(() => {
    if (
      editor.centeredComponentEditorSceneViewSelection &&
      editor.selectedGameOutlineComponent.id === sceneId
    ) {
      logger.info(
        `SceneView->editor.centeredComponentEditorSceneViewSelection-useEffect`
      )

      centerSelection()

      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_CENTERED_SELECTION,
        centeredComponentEditorSceneViewSelection: false
      })
    }
  }, [
    editor.centeredComponentEditorSceneViewSelection,
    nodes,
    selectedElements,
    currentZoom
  ])

  useEffect(() => {
    logger.info(
      `SceneView->editorTab.passageForEditing->useEffect: ${editorTab.passageForEditing.visible}`
    )

    if (
      editor.selectedGameOutlineComponent.id === sceneId &&
      editorTab.passageForEditing.visible
    ) {
      editor.selectedComponentEditorSceneViewPassage &&
        editor.selectedComponentEditorSceneViewPassage !==
          editorTab.passageForEditing.id &&
        editorTabDispatch({
          type: EDITOR_TAB_ACTION_TYPE.EDIT_PASSAGE,
          passageForEditing: {
            id: editor.selectedComponentEditorSceneViewPassage,
            visible: true
          }
        })

      editorTabDispatch({
        type: EDITOR_TAB_ACTION_TYPE.SCENE_VIEW_CONTEXT,
        sceneViewContext: SCENE_VIEW_CONTEXT.PASSAGE
      })
    }

    !editorTab.passageForEditing.visible && setContext()
  }, [
    editorTab.passageForEditing,
    editor.selectedGameOutlineComponent,
    editor.selectedComponentEditorSceneViewPassage
  ])

  return (
    <>
      {passages && (
        <div
          id={`scene-view-${sceneId}`}
          className={styles.SceneView}
          ref={flowWrapperRef}
          style={{ width: '100%', height: '100%' }}
        >
          {scene && editorTab.passageForEditing.id && (
            <PassageView
              studioId={studioId}
              scene={scene}
              passageId={editorTab.passageForEditing.id}
              onClose={() =>
                editorTabDispatch({
                  type: EDITOR_TAB_ACTION_TYPE.EDIT_PASSAGE,
                  passageForEditing: { id: undefined, visible: false }
                })
              }
            />
          )}

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
                        try {
                          const passageId = await addComponentToScene(
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
                        } catch (error) {
                          throw new Error(error)
                        }
                      }
                    }
                  ],
                  [
                    'Add Jump',
                    async ({ clickPosition }) => {
                      if (scene) {
                        try {
                          const jumpId = await addComponentToScene(
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
                        } catch (error) {
                          throw new Error()
                        }
                      }
                    }
                  ]
                ]
              },
              {
                className: 'nodePassageHeader',
                items: [
                  [
                    'Edit Passage',
                    ({ componentId }) => {
                      if (componentId) {
                        if (
                          componentId !==
                          editor.selectedComponentEditorSceneViewPassage
                        ) {
                          editorDispatch({
                            type:
                              EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                            selectedComponentEditorSceneViewPassage: componentId
                          })
                        }

                        editorTabDispatch({
                          type: EDITOR_TAB_ACTION_TYPE.EDIT_PASSAGE,
                          passageForEditing: {
                            id: componentId,
                            visible: true
                          }
                        })
                      }
                    }
                  ],
                  [
                    'Remove Passage',
                    async ({ componentId }) => {
                      if (scene && componentId)
                        try {
                          await removeComponentFromScene(
                            studioId,
                            scene,
                            COMPONENT_TYPE.PASSAGE,
                            componentId
                          )

                          if (
                            componentId ===
                            editor.selectedComponentEditorSceneViewPassage
                          ) {
                            setTotalSelectedPassages(0)

                            editorDispatch({
                              type:
                                EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                              selectedComponentEditorSceneViewPassage: null
                            })
                          }

                          editorDispatch({
                            type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE,
                            removedComponent: {
                              type: COMPONENT_TYPE.PASSAGE,
                              id: componentId
                            }
                          })
                        } catch (error) {
                          throw new Error(error)
                        }
                    }
                  ]
                ]
              },
              {
                className: 'nodeJumpHeader',
                items: [
                  [
                    'Remove Jump',
                    async ({ componentId }) => {
                      if (scene && componentId) {
                        try {
                          await removeComponentFromScene(
                            studioId,
                            scene,
                            COMPONENT_TYPE.JUMP,
                            componentId
                          )

                          if (
                            componentId ===
                            editor.selectedComponentEditorSceneViewJump
                          ) {
                            setTotalSelectedJumps(0)

                            editorDispatch({
                              type:
                                EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
                              selectedComponentEditorSceneViewJump: null
                            })
                          }
                        } catch (error) {
                          throw new Error(error)
                        }
                      }
                    }
                  ]
                ]
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
            onLoad={() => {
              logger.info('SceneView->ReactFlow->onLoad')

              selectElement(
                editor.selectedComponentEditorSceneViewPassage ||
                  editor.selectedComponentEditorSceneViewJump
              )
            }}
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
