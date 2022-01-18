import logger from '../../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash-es'

import {
  ElementId,
  ELEMENT_TYPE,
  EVENT_TYPE,
  Scene,
  StudioId,
  PATH_CONDITIONS_TYPE
} from '../../../data/types'
import { DEFAULT_EVENT_CONTENT } from '../../../data/eventContentTypes'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'
import {
  ElementEditorTabContext,
  ELEMENT_EDITOR_TAB_ACTION_TYPE,
  SCENE_MAP_CONTEXT
} from '../../../contexts/ElementEditorTabContext'

import {
  useDebouncedResizeObserver,
  useJumpsBySceneRef,
  useEventsBySceneRef,
  usePathsBySceneRef,
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
  useStoreState,
  HandleType
} from 'react-flow-renderer'

import { Menu } from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'

import ContextMenu from './ContextMenu'
import PathEdge, { PathEdgeData } from './PathEdge'
import EventNode from './EventNode'
import JumpNode from './JumpNode'
import EventContent from '../EventContent'

import styles from './styles.module.less'

import api from '../../../api'

export enum DEFAULT_NODE_SIZE {
  // elmstorygames/feedback#126
  EVENT_WIDTH = 200,
  EVENT_HEIGHT = 69,
  JUMP_WIDTH = 200,
  JUMP_HEIGHT = 117,
  JUMP_HEIGHT_EXTENDED = 171
}

interface NodeData {
  studioId: StudioId
  sceneId?: ElementId
  jumpId?: ElementId
  eventId?: ElementId
  eventType?: EVENT_TYPE
  selectedChoice?: ElementId | null
  onEditEvent?: (eventId: ElementId) => void
  onChoiceSelect?: (eventId: ElementId, choiceId: ElementId | null) => void
  inputId?: ElementId
  totalChoices: number
  type: ELEMENT_TYPE
}

export const SceneMapTools: React.FC<{
  studioId: StudioId
  sceneId: ElementId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId, [sceneId])

  const { composer, composerDispatch } = useContext(ComposerContext),
    {
      elementEditorTab: editorTab,
      elementEditorTabDispatch: editorTabDispatch
    } = useContext(ElementEditorTabContext)

  return (
    <>
      {scene && (
        <Menu mode="horizontal">
          {editorTab.sceneMapContext ===
            SCENE_MAP_CONTEXT.SCENE_SELECTION_NONE && (
            <>
              {/* Add Event Menu Item */}
              <Menu.Item
                onClick={async () => {
                  try {
                    const eventId = await addElementToScene(
                      studioId,
                      scene,
                      ELEMENT_TYPE.EVENT,
                      {
                        x:
                          composer.selectedSceneMapCenter.x -
                          DEFAULT_NODE_SIZE.EVENT_WIDTH / 2,
                        y:
                          composer.selectedSceneMapCenter.y -
                          DEFAULT_NODE_SIZE.EVENT_HEIGHT / 2
                      }
                    )

                    if (eventId)
                      composerDispatch({
                        type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                        savedElement: {
                          id: eventId,
                          type: ELEMENT_TYPE.EVENT
                        }
                      })
                  } catch (error) {
                    throw error
                  }
                }}
              >
                <PlusOutlined />
                Event
              </Menu.Item>

              {/* Add Jump Menu Item */}
              <Menu.Item
                onClick={async () => {
                  const jumpId = await addElementToScene(
                    studioId,
                    scene,
                    ELEMENT_TYPE.JUMP,
                    {
                      x:
                        composer.selectedSceneMapCenter.x -
                        DEFAULT_NODE_SIZE.JUMP_WIDTH / 2,
                      y:
                        composer.selectedSceneMapCenter.y -
                        (scene.children.length === 0
                          ? DEFAULT_NODE_SIZE.JUMP_HEIGHT
                          : DEFAULT_NODE_SIZE.JUMP_HEIGHT_EXTENDED) /
                          2
                    }
                  )

                  if (jumpId)
                    composerDispatch({
                      type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                      savedElement: {
                        id: jumpId,
                        type: ELEMENT_TYPE.JUMP
                      }
                    })
                }}
              >
                <PlusOutlined />
                Jump
              </Menu.Item>
            </>
          )}

          {(editorTab.sceneMapContext === SCENE_MAP_CONTEXT.SCENE_SELECTION ||
            editorTab.sceneMapContext ===
              SCENE_MAP_CONTEXT.SCENE_SELECTION_JUMP ||
            editorTab.sceneMapContext ===
              SCENE_MAP_CONTEXT.SCENE_SELECTION_PASSAGE) &&
            !editorTab.eventForEditing.visible && (
              <Menu.Item
                onClick={() =>
                  !composer.centeredSceneMapSelection &&
                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.SCENE_MAP_CENTERED_SELECTION,
                    centeredSceneMapSelection: true
                  })
                }
              >
                Center Selection
              </Menu.Item>
            )}

          {editorTab.eventForEditing.visible && (
            <Menu.Item
              onClick={() =>
                editorTabDispatch({
                  type: ELEMENT_EDITOR_TAB_ACTION_TYPE.EDIT_EVENT,
                  eventForEditing: { id: undefined, visible: false }
                })
              }
            >
              <CloseOutlined />
              Close Event
            </Menu.Item>
          )}
        </Menu>
      )}
    </>
  )
}

SceneMapTools.displayName = 'SceneMapTools'

async function addElementToScene(
  studioId: StudioId,
  scene: Scene,
  type: ELEMENT_TYPE,
  position: { x: number; y: number }
): Promise<ElementId | undefined> {
  if (scene.id) {
    switch (type) {
      case ELEMENT_TYPE.EVENT:
        const event = await api().events.saveEvent(studioId, {
          characters: [],
          ending: false,
          worldId: scene.worldId,
          sceneId: scene.id,
          title: 'Untitled Event',
          choices: [],
          content: JSON.stringify([...DEFAULT_EVENT_CONTENT]),
          tags: [],
          type: EVENT_TYPE.CHOICE,
          composer: {
            sceneMapPosX: position.x,
            sceneMapPosY: position.y
          }
        })

        event.id &&
          (await api().scenes.saveChildRefsToScene(studioId, scene.id, [
            ...scene.children,
            [ELEMENT_TYPE.EVENT, event.id]
          ]))

        return event.id
      case ELEMENT_TYPE.JUMP:
        const jump = await api().jumps.saveJump(studioId, {
          worldId: scene.worldId,
          sceneId: scene.id,
          title: 'Untitled Jump',
          path: [scene.id],
          tags: [],
          composer: {
            sceneMapPosX: position.x,
            sceneMapPosY: position.y
          }
        })

        jump.id &&
          (await api().scenes.saveChildRefsToScene(studioId, scene.id, [
            ...scene.children,
            [ELEMENT_TYPE.JUMP, jump.id]
          ]))

        return jump.id
      default:
        return undefined
    }
  }

  return undefined
}

async function removeElementFromScene(
  studioId: StudioId,
  scene: Scene,
  type: ELEMENT_TYPE,
  id: ElementId
): Promise<void> {
  if (scene.id) {
    switch (type) {
      case ELEMENT_TYPE.EVENT:
        await api().events.removeEvent(studioId, id)

        break
      case ELEMENT_TYPE.JUMP:
        await api().jumps.removeJump(studioId, id)

        break
      default:
        break
    }
  }
}

function findElement(elements: FlowElement[], componentId: ElementId | null) {
  if (!componentId) return undefined

  return cloneDeep(elements.find((element) => element.id === componentId))
}

const SceneMap: React.FC<{
  studioId: StudioId
  sceneId: ElementId
}> = ({ studioId, sceneId }) => {
  const {
    ref: flowWrapperRef,
    width: flowWrapperRefWidth,
    height: flowWrapperRefHeight
  } = useDebouncedResizeObserver(500)

  const { composer, composerDispatch } = useContext(ComposerContext),
    {
      elementEditorTab: editorTab,
      elementEditorTabDispatch: editorTabDispatch
    } = useContext(ElementEditorTabContext)

  const jumps = useJumpsBySceneRef(studioId, sceneId),
    scene = useScene(studioId, sceneId),
    paths = usePathsBySceneRef(studioId, sceneId),
    events = useEventsBySceneRef(studioId, sceneId)

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
    [totalSelectedEvents, setTotalSelectedEvents] = useState<number>(0),
    [totalSelectedPaths, setTotalSelectedPaths] = useState<number>(0),
    [selectedJump, setSelectedJump] = useState<ElementId | null>(null),
    [selectedEvent, setSelectedEvent] = useState<ElementId | null>(
      composer.selectedSceneMapEvent
    ),
    [selectedRoute, setSelectedRoute] = useState<ElementId | null>(null),
    [selectedChoice, setSelectedChoice] = useState<ElementId | null>(null),
    [elements, setElements] = useState<FlowElement[]>([]),
    [paneMoving, setPaneMoving] = useState(false),
    // elmstorygames/feedback#109
    [connectStartData, setConnectStartData] = useState<{
      nodeId: ElementId | null
      handleId: ElementId | null
      handleType: HandleType | null
    } | null>(null)

  function setSelectedSceneViewCenter() {
    composerDispatch({
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CENTER,
      selectedSceneMapCenter: {
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
    logger.info(`SceneMap->highlightElements`)

    if (composer.selectedWorldOutlineElement.id === sceneId) {
      const clonedElements = cloneDeep(elements),
        clonedJumps = clonedElements.filter(
          (clonedElement): clonedElement is Node =>
            clonedElement.data.type === ELEMENT_TYPE.JUMP
        ),
        clonedPassages = clonedElements.filter(
          (clonedElement): clonedElement is Node =>
            clonedElement.data.type === ELEMENT_TYPE.EVENT
        ),
        clonedRoutes = clonedElements.filter(
          (clonedElement): clonedElement is Edge =>
            clonedElement.data.type === ELEMENT_TYPE.PATH
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
              clonedPassage.id === selectedEvent ? selectedChoice : null
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
                  if (events) {
                    const foundEvent = events.find(
                      (event) => selectedPassage.id === event.id
                    )

                    edge.className =
                      foundEvent && foundEvent.ending
                        ? 'selected ending'
                        : 'selected event'
                  }
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
      type: ELEMENT_TYPE
    }>
  ) {
    const { id, position, data } = node

    logger.info(`SceneMap->onNodeDragStop->type:${data?.type}`)

    switch (data?.type) {
      case ELEMENT_TYPE.JUMP:
        if (jumps) {
          const clonedJump = cloneDeep(jumps.find((jump) => jump.id === id))

          clonedJump &&
            (await api().jumps.saveJump(studioId, {
              ...clonedJump,
              composer: {
                sceneMapPosX: position.x,
                sceneMapPosY: position.y
              }
            }))
        }
        break
      case ELEMENT_TYPE.EVENT:
        if (events) {
          const clonedEvent = cloneDeep(events.find((event) => event.id === id))

          clonedEvent &&
            (await api().events.saveEvent(studioId, {
              ...clonedEvent,
              composer: {
                sceneMapPosX: position.x,
                sceneMapPosY: position.y
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
      const foundSourceNode: FlowElement<NodeData> | undefined = elements.find(
          (element) => element.id === connection.source
        ),
        foundDestinationNode:
          | FlowElement<{ type: ELEMENT_TYPE }>
          | undefined = elements.find(
          (element) => element.id === connection.targetHandle
        )

      if (
        foundSourceNode?.data?.eventType &&
        foundDestinationNode?.data?.type
      ) {
        // #398, #397: as effect may fire before routePassthroughs is updated,
        // need to do a check on originId as may be referencing previously
        // selected event node
        if (events) {
          const foundEvent = events.find(
            (event) => event.id === connection.source
          )

          if (foundEvent?.id && foundEvent.ending) {
            await api().events.setEventEnding(studioId, foundEvent.id, false)
          }
        }

        await api().paths.savePath(studioId, {
          title: 'Untitled Path',
          worldId: scene.worldId,
          conditionsType: PATH_CONDITIONS_TYPE.ALL,
          sceneId,
          originId: connection.source,
          choiceId:
            foundSourceNode?.data.eventType === EVENT_TYPE.CHOICE &&
            foundSourceNode?.data.totalChoices > 0
              ? connection.sourceHandle
              : undefined,
          inputId:
            foundSourceNode?.data.eventType === EVENT_TYPE.INPUT
              ? connection.sourceHandle
              : undefined,
          originType: foundSourceNode?.data.eventType,
          destinationId: connection.targetHandle,
          destinationType: foundDestinationNode.data.type,
          tags: []
        })
      }
    }
  }

  async function onElementsRemove(elements: Elements<any>) {
    logger.info('onElementsRemove')

    if (!composer.selectedSceneMapChoice) {
      const jumpRefs: ElementId[] = [],
        routeRefs: ElementId[] = [],
        passageRefs: ElementId[] = []

      elements.map((element) => {
        switch (element.data.type) {
          // TODO: #45
          // case ELEMENT_TYPE.JUMP:
          //   jumpRefs.push(element.id)
          //   break
          case ELEMENT_TYPE.PATH:
            routeRefs.push(element.id)
            break
          // TODO: #45
          // case ELEMENT_TYPE.EVENT:
          //   passageRefs.push(element.id)
          //   break
          default:
            logger.info('Unknown element type.')
            return
        }
      })

      await Promise.all(
        routeRefs.map(async (pathRef) => {
          await api().paths.removePath(studioId, pathRef)
        })
      )
    }

    if (composer.selectedSceneMapChoice) {
      await api().paths.removePathsByChoiceRef(
        studioId,
        composer.selectedSceneMapChoice
      )
    }

    // TODO: issue #45
    // It's not currently possible to remove multiple jumps, passages, choices from SceneMap

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
    //       await api().passages.removeEvent(studioId, passageRef)
    //     })
    //   ])
    // }
  }

  function onChoiceSelect(eventId: ElementId, choiceId: ElementId | null) {
    logger.info(
      `Sceneview->onChoiceSelect->
       eventId: ${eventId} choiceId: ${choiceId}`
    )

    setSelectedChoice(choiceId)
  }

  async function onSelectionDragStop(
    event: React.MouseEvent<Element, MouseEvent>,
    nodes: Node<{ type: ELEMENT_TYPE }>[]
  ) {
    if (jumps && events) {
      const clonedJumps =
          cloneDeep(
            jumps.filter(
              (jump) => nodes.find((node) => node.id == jump.id) !== undefined
            )
          ) || [],
        clonedPassages =
          cloneDeep(
            events.filter(
              (event) =>
                nodes.find((node) => node.id === event.id) !== undefined
            )
          ) || []

      await Promise.all([
        clonedJumps.map(async (clonedJump) => {
          // TODO: cache this
          const foundNode = nodes.find((node) => node.id === clonedJump.id)

          foundNode &&
            (await api().jumps.saveJump(studioId, {
              ...clonedJump,
              composer: {
                sceneMapPosX: foundNode.position.x,
                sceneMapPosY: foundNode.position.y
              }
            }))
        }),
        clonedPassages.map(async (clonedPassage) => {
          // TODO: cache this
          const foundNode = nodes.find((node) => node.id === clonedPassage.id)

          foundNode &&
            (await api().events.saveEvent(studioId, {
              ...clonedPassage,
              composer: {
                sceneMapPosX: foundNode.position.x,
                sceneMapPosY: foundNode.position.y
              }
            }))
        })
      ])
    }
  }

  function onSelectionChange(selectedElements: Elements<any> | null) {
    logger.info('SceneMap->onSelectionChange')

    let _totalSelectedJumps = 0,
      _totalSelectedPassages = 0,
      _totalSelectedRoutes = 0

    selectedElements?.map((element) => {
      switch (element.data.type) {
        case ELEMENT_TYPE.JUMP:
          _totalSelectedJumps++
          break
        case ELEMENT_TYPE.EVENT:
          _totalSelectedPassages++
          break
        case ELEMENT_TYPE.PATH:
          _totalSelectedRoutes++
          break
        default:
          break
      }
    })

    setTotalSelectedJumps(_totalSelectedJumps)
    setTotalSelectedEvents(_totalSelectedPassages)
    setTotalSelectedPaths(_totalSelectedRoutes)

    if (
      !selectedElements ||
      (selectedElements && selectedElements.length > 0)
    ) {
      setSelectedJump(null)
      setSelectedEvent(null)
      setSelectedRoute(null)
      setSelectedChoice(null)
    }

    if (selectedElements && selectedElements.length === 1) {
      selectedElements[0].data.type === ELEMENT_TYPE.JUMP &&
        setSelectedJump(selectedElements[0].id)

      selectedElements[0].data.type === ELEMENT_TYPE.EVENT &&
        setSelectedEvent(selectedElements[0].id)

      selectedElements[0].data.type === ELEMENT_TYPE.PATH &&
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

  // When selecting a nested component e.g. event from the WorldOutline
  function selectElement(componentId: ElementId | null) {
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
      totalSelectedEvents === 0 &&
      editorTab.sceneMapContext !== SCENE_MAP_CONTEXT.SCENE_SELECTION_NONE
    )
      editorTabDispatch({
        type: ELEMENT_EDITOR_TAB_ACTION_TYPE.SCENE_MAP_CONTEXT,
        sceneMapContext: SCENE_MAP_CONTEXT.SCENE_SELECTION_NONE
      })

    if (
      totalSelectedJumps > 1 ||
      (totalSelectedEvents > 1 &&
        editorTab.sceneMapContext !== SCENE_MAP_CONTEXT.SCENE_SELECTION)
    )
      editorTabDispatch({
        type: ELEMENT_EDITOR_TAB_ACTION_TYPE.SCENE_MAP_CONTEXT,
        sceneMapContext: SCENE_MAP_CONTEXT.SCENE_SELECTION
      })

    if (
      totalSelectedJumps === 1 &&
      totalSelectedEvents === 0 &&
      editorTab.sceneMapContext !== SCENE_MAP_CONTEXT.SCENE_SELECTION_JUMP
    )
      editorTabDispatch({
        type: ELEMENT_EDITOR_TAB_ACTION_TYPE.SCENE_MAP_CONTEXT,
        sceneMapContext: SCENE_MAP_CONTEXT.SCENE_SELECTION_JUMP
      })

    if (
      totalSelectedJumps === 0 &&
      totalSelectedEvents === 1 &&
      editorTab.sceneMapContext !== SCENE_MAP_CONTEXT.SCENE_SELECTION_PASSAGE
    )
      editorTabDispatch({
        type: ELEMENT_EDITOR_TAB_ACTION_TYPE.SCENE_MAP_CONTEXT,
        sceneMapContext: SCENE_MAP_CONTEXT.SCENE_SELECTION_PASSAGE
      })
  }

  useEffect(() => {
    logger.info(`SceneMap->scene,events,paths->useEffect`)

    if (jumps && scene && events && paths) {
      logger.info(
        `SceneMap->scene,events,paths->useEffect->have scene, events and paths`
      )

      !ready && setReady(true)

      // TODO: optimize; this is re-rendering too much
      const nodes: Node<NodeData>[] = []

      jumps.map((jump) => {
        jump.id &&
          nodes.push({
            id: jump.id,
            // TODO
            data: {
              studioId,
              sceneId,
              jumpId: jump.id,
              type: ELEMENT_TYPE.JUMP
            },
            type: 'jumpNode',
            position: jump.composer
              ? {
                  x: jump.composer.sceneMapPosX || 0,
                  y: jump.composer.sceneMapPosY || 0
                }
              : { x: 0, y: 0 }
          })
      })

      events.map((event) => {
        if (scene.id && event.id) {
          let eventNodeData: NodeData = {
            studioId,
            sceneId: scene.id,
            onEditEvent: (id: ElementId) =>
              editorTabDispatch({
                type: ELEMENT_EDITOR_TAB_ACTION_TYPE.EDIT_EVENT,
                eventForEditing: { id, visible: true }
              }),
            eventId: event.id,
            eventType: event.type,
            totalChoices: event.choices.length,
            type: ELEMENT_TYPE.EVENT
          }

          switch (event.type) {
            case EVENT_TYPE.CHOICE:
              eventNodeData = {
                ...eventNodeData,
                selectedChoice: null,
                onChoiceSelect
              }
              break
            case EVENT_TYPE.INPUT:
              if (event.input)
                eventNodeData = {
                  ...eventNodeData,
                  inputId: event.input
                }
              break
            default:
              break
          }

          nodes.push({
            id: event.id,
            data: eventNodeData,
            type: 'eventNode',
            position: event.composer
              ? {
                  x: event.composer.sceneMapPosX || 0,
                  y: event.composer.sceneMapPosY || 0
                }
              : { x: 0, y: 0 }
          })
        }
      })

      const edges: Edge<PathEdgeData>[] = paths.map((path) => {
        if (!path.id)
          throw new Error('Unable to generate edge. Missing path ID.')

        return {
          id: path.id,
          source: path.originId,
          sourceHandle: path.choiceId,
          target: path.destinationId,
          targetHandle: path.destinationId,
          type: 'pathEdge',
          animated: true,
          data: {
            type: ELEMENT_TYPE.PATH,
            studioId,
            pathId: path.id,
            conditionsType: path.conditionsType
          }
        }
      })

      // BUG: Unable to create edges on initial node render because choices aren't ready
      setElements([...nodes, ...edges])
    }
  }, [jumps, scene, events, paths, ready])

  useEffect(() => {
    logger.info(`SceneMap->sceneReady->useEffect`)

    ready &&
      transform({
        x: scene?.composer?.sceneMapTransformX || 0,
        y: scene?.composer?.sceneMapTransformY || 0,
        zoom: scene?.composer?.sceneMapTransformZoom || 1
      })
  }, [ready])

  useEffect(() => {
    logger.info(
      `SceneMap->
       composer.selectedWorldOutlineElement,
       totalSelectedPassages,
       selectedJump,
       selectedPassage,
       selectedChoice
       ->useEffect`
    )

    if (composer.selectedWorldOutlineElement.id === sceneId) {
      setContext()

      totalSelectedJumps !== composer.totalSceneMapSelectedJumps &&
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_JUMPS,
          totalSceneMapSelectedJumps: totalSelectedJumps
        })

      totalSelectedEvents !== composer.totalSceneMapSelectedEvents &&
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_EVENTS,
          totalSceneMapSelectedEvents: totalSelectedEvents
        })

      totalSelectedPaths !== composer.totalSceneMapSelectedPaths &&
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_PATHS,
          totalSceneMapSelectedPaths: totalSelectedPaths
        })

      selectedJump !== composer.selectedSceneMapJump &&
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
          selectedSceneMapJump: selectedJump
        })

      selectedEvent !== composer.selectedSceneMapEvent &&
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
          selectedSceneMapEvent: selectedEvent
        })

      selectedRoute !== composer.selectedSceneMapPath &&
        composerDispatch({
          type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_PATH,
          selectedSceneMapPath: selectedRoute
        })

      composerDispatch({
        type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE,
        selectedSceneMapChoice: selectedChoice
      })

      highlightElements(selectedElements)
    }
  }, [
    composer.selectedWorldOutlineElement,
    totalSelectedJumps,
    totalSelectedEvents,
    selectedJump,
    selectedEvent,
    selectedRoute,
    selectedChoice
  ])

  useEffect(() => {
    composer.selectedWorldOutlineElement.id === sceneId &&
      setSelectedSceneViewCenter()
  }, [
    composer.selectedWorldOutlineElement,
    flowWrapperRefWidth,
    flowWrapperRefHeight,
    currentZoom
  ])

  useEffect(() => {
    logger.info(
      `SceneMap->composer.selectedComponentEditorSceneViewMap/Jump->useEffects`
    )

    selectElement(
      composer.selectedSceneMapEvent || composer.selectedSceneMapJump
    )
  }, [composer.selectedSceneMapEvent, composer.selectedSceneMapJump])

  useEffect(() => {
    logger.info(`SceneMap->selectedElements->useEffect`)
  }, [selectedElements])

  useEffect(() => {
    logger.info(`SceneMap->elements->useEffect`)

    highlightElements(selectedElements)
  }, [elements])

  useEffect(() => {
    logger.info(`SceneMap->composer.saveElement,elements->useEffect`)

    const foundElement = findElement(elements, composer.savedElement.id || null)

    if (foundElement) {
      setSelectedElements([foundElement])

      composerDispatch({
        type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
        savedElement: { id: undefined, type: undefined }
      })
    }
  }, [composer.savedElement, elements])

  useEffect(() => {
    if (
      composer.centeredSceneMapSelection &&
      composer.selectedWorldOutlineElement.id === sceneId
    ) {
      logger.info(
        `SceneMap->composer.centeredComponentEditorSceneViewSelection-useEffect`
      )

      centerSelection()

      composerDispatch({
        type: COMPOSER_ACTION_TYPE.SCENE_MAP_CENTERED_SELECTION,
        centeredSceneMapSelection: false
      })
    }
  }, [composer.centeredSceneMapSelection, nodes, selectedElements, currentZoom])

  useEffect(() => {
    logger.info(
      `SceneMap->editorTab.passageForEditing->useEffect: ${editorTab.eventForEditing.visible}`
    )

    if (
      composer.selectedWorldOutlineElement.id === sceneId &&
      editorTab.eventForEditing.visible
    ) {
      // composer.selectedSceneMapEvent &&
      //   composer.selectedSceneMapEvent !== editorTab.eventForEditing.id &&
      //   editorTabDispatch({
      //     type: ELEMENT_EDITOR_TAB_ACTION_TYPE.EDIT_EVENT,
      //     eventForEditing: {
      //       id: editorTab.eventForEditing.id,
      //       visible: true
      //     }
      //   })

      // elmstorygames/feedback#2
      editorTabDispatch({
        type: ELEMENT_EDITOR_TAB_ACTION_TYPE.SCENE_MAP_CONTEXT,
        sceneMapContext: SCENE_MAP_CONTEXT.EVENT
      })
    }

    !editorTab.eventForEditing.visible && setContext()
  }, [
    editorTab.eventForEditing,
    composer.selectedWorldOutlineElement,
    composer.selectedSceneMapEvent
  ])

  return (
    <>
      {events && (
        <div
          id={`scene-view-${sceneId}`}
          className={styles.SceneMap}
          ref={flowWrapperRef}
          style={{ width: '100%', height: '100%' }}
          // #356
          onClick={() => {
            if (
              scene?.id &&
              scene.id !== composer.selectedWorldOutlineElement.id
            ) {
              composerDispatch({
                type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
                selectedWorldOutlineElement: {
                  id: scene.id,
                  title: scene.title,
                  type: ELEMENT_TYPE.SCENE,
                  expanded: true
                }
              })
            }
          }}
        >
          {scene && editorTab.eventForEditing.id && (
            <EventContent
              studioId={studioId}
              scene={scene}
              eventId={editorTab.eventForEditing.id}
              onClose={() =>
                editorTabDispatch({
                  type: ELEMENT_EDITOR_TAB_ACTION_TYPE.EDIT_EVENT,
                  eventForEditing: { id: undefined, visible: false }
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
                    'Add Event',
                    async ({ clickPosition }) => {
                      if (scene) {
                        try {
                          const eventId = await addElementToScene(
                            studioId,
                            scene,
                            ELEMENT_TYPE.EVENT,
                            project(clickPosition)
                          )

                          if (eventId)
                            composerDispatch({
                              type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                              savedElement: {
                                id: eventId,
                                type: ELEMENT_TYPE.EVENT
                              }
                            })
                        } catch (error) {
                          throw error
                        }
                      }
                    }
                  ],
                  [
                    'Add Jump',
                    async ({ clickPosition }) => {
                      if (scene) {
                        try {
                          const jumpId = await addElementToScene(
                            studioId,
                            scene,
                            ELEMENT_TYPE.JUMP,
                            project(clickPosition)
                          )

                          if (jumpId)
                            composerDispatch({
                              type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                              savedElement: {
                                id: jumpId,
                                type: ELEMENT_TYPE.JUMP
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
                className: 'nodeEventHeader',
                items: [
                  [
                    'Edit Event',
                    ({ elementId }) => {
                      if (elementId) {
                        if (elementId !== composer.selectedSceneMapEvent) {
                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                            selectedSceneMapEvent: elementId
                          })
                        }

                        editorTabDispatch({
                          type: ELEMENT_EDITOR_TAB_ACTION_TYPE.EDIT_EVENT,
                          eventForEditing: {
                            id: elementId,
                            visible: true
                          }
                        })
                      }
                    }
                  ],
                  [
                    // #292
                    (elementId) => {
                      const foundEvent = events.find(
                        (event) => event.id === elementId
                      )

                      if (foundEvent)
                        switch (foundEvent.type) {
                          case EVENT_TYPE.CHOICE:
                            return 'Switch to Input'
                          case EVENT_TYPE.INPUT:
                            return 'Switch to Choice'
                          default:
                            break
                        }

                      return 'Unknown Event Type'
                    },
                    async ({ elementId }) => {
                      const foundEvent = events.find(
                        (event) => event.id === elementId
                      )

                      if (foundEvent && foundEvent.id) {
                        if (foundEvent.type === EVENT_TYPE.CHOICE) {
                          composer.selectedSceneMapEvent === foundEvent.id &&
                            composerDispatch({
                              type:
                                COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE,
                              selectedSceneMapChoice: null
                            })

                          await api().events.switchEventFromChoiceToInputType(
                            studioId,
                            foundEvent
                          )
                        }

                        foundEvent.type === EVENT_TYPE.INPUT &&
                          foundEvent.input &&
                          (await api().events.switchEventFromInputToChoiceType(
                            studioId,
                            foundEvent
                          ))
                      }
                    }
                  ],
                  [
                    'Switch to Jump',
                    async ({ elementId }) => {
                      if (elementId) {
                        const foundEvent = await api().events.getEvent(
                          studioId,
                          elementId
                        )

                        const jumpId = await api().events.switchEventFromChoiceOrInputToJumpType(
                          studioId,
                          foundEvent
                        )

                        if (jumpId) {
                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
                            removedElement: {
                              id: foundEvent.id,
                              type: ELEMENT_TYPE.EVENT
                            }
                          })

                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                            savedElement: {
                              id: jumpId,
                              type: ELEMENT_TYPE.JUMP
                            }
                          })
                        }
                      }
                    }
                  ],
                  [
                    'Remove Event',
                    async ({ elementId }) => {
                      if (scene && elementId)
                        try {
                          await removeElementFromScene(
                            studioId,
                            scene,
                            ELEMENT_TYPE.EVENT,
                            elementId
                          )

                          if (elementId === composer.selectedSceneMapEvent) {
                            setTotalSelectedEvents(0)

                            composerDispatch({
                              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                              selectedSceneMapEvent: null
                            })
                          }

                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
                            removedElement: {
                              type: ELEMENT_TYPE.EVENT,
                              id: elementId
                            }
                          })
                        } catch (error) {
                          throw error
                        }
                    }
                  ]
                ]
              },
              {
                className: 'nodeJumpHeader',
                items: [
                  [
                    'Switch to Choice',
                    async ({ elementId }) => {
                      if (elementId) {
                        const foundJump = await api().jumps.getJump(
                          studioId,
                          elementId
                        )

                        const eventId = await api().jumps.switchJumpToChoiceOrInputEventType(
                          studioId,
                          foundJump,
                          EVENT_TYPE.CHOICE
                        )

                        if (eventId) {
                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
                            removedElement: {
                              id: foundJump.id,
                              type: ELEMENT_TYPE.JUMP
                            }
                          })

                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                            savedElement: {
                              id: eventId,
                              type: ELEMENT_TYPE.EVENT
                            }
                          })
                        }
                      }
                    }
                  ],
                  [
                    'Switch to Input',
                    async ({ elementId }) => {
                      if (elementId) {
                        const foundJump = await api().jumps.getJump(
                          studioId,
                          elementId
                        )

                        const eventId = await api().jumps.switchJumpToChoiceOrInputEventType(
                          studioId,
                          foundJump,
                          EVENT_TYPE.INPUT
                        )

                        if (eventId) {
                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
                            removedElement: {
                              id: foundJump.id,
                              type: ELEMENT_TYPE.JUMP
                            }
                          })

                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                            savedElement: {
                              id: eventId,
                              type: ELEMENT_TYPE.EVENT
                            }
                          })
                        }
                      }
                    }
                  ],
                  [
                    'Remove Jump',
                    async ({ elementId }) => {
                      if (scene && elementId) {
                        try {
                          await removeElementFromScene(
                            studioId,
                            scene,
                            ELEMENT_TYPE.JUMP,
                            elementId
                          )

                          if (elementId === composer.selectedSceneMapJump) {
                            setTotalSelectedJumps(0)

                            composerDispatch({
                              type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
                              selectedSceneMapJump: null
                            })
                          }

                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
                            removedElement: {
                              type: ELEMENT_TYPE.JUMP,
                              id: elementId
                            }
                          })
                        } catch (error) {
                          throw error
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
              eventNode: EventNode,
              jumpNode: JumpNode
            }}
            edgeTypes={{
              pathEdge: PathEdge
            }}
            snapGrid={[4, 4]}
            onlyRenderVisibleElements={false}
            onLoad={() => {
              logger.info('SceneMap->ReactFlow->onLoad')

              selectElement(
                composer.selectedSceneMapEvent || composer.selectedSceneMapJump
              )
            }}
            elements={elements}
            onElementsRemove={
              composer.selectedWorldOutlineElement.id === scene?.id
                ? onElementsRemove
                : undefined
            }
            onNodeDragStop={onNodeDragStop}
            onConnectStart={(
              event: React.MouseEvent<Element, MouseEvent>,
              params: OnConnectStartParams
            ) => {
              // nodeId: event ID
              // handleId: event ID or choice ID
              // handleType: 'target' event ID / 'source' choice ID
              logger.info('onConnectStart')

              // elmstorygames/feedback#109
              setConnectStartData(params)
            }}
            onConnect={onConnect}
            elementsSelectable
            onSelectionDragStop={onSelectionDragStop}
            onSelectionChange={onSelectionChange}
            onMove={() => {
              setPaneMoving(true)
            }}
            // elmstorygames/feedback#109
            onMouseUp={async (event) => {
              logger.info('ReactFlow->onMouseUp')

              if (
                !connectStartData ||
                !(event.target as Element).classList.contains(
                  'react-flow__pane'
                ) ||
                composer.selectedWorldOutlineElement.id !== sceneId ||
                !scene
              ) {
                setConnectStartData(null)

                return
              }

              try {
                const eventId = await addElementToScene(
                  studioId,
                  scene,
                  ELEMENT_TYPE.EVENT,
                  project({
                    x:
                      event.nativeEvent.offsetX -
                      (connectStartData.handleType === 'target'
                        ? DEFAULT_NODE_SIZE.EVENT_WIDTH
                        : 2) *
                        composer.selectedSceneMapCenter.zoom,
                    y:
                      event.nativeEvent.offsetY -
                      22 * composer.selectedSceneMapCenter.zoom
                  })
                )

                if (eventId) {
                  const foundSourceNode:
                    | FlowElement<NodeData>
                    | undefined = elements.find(
                    (element) => element.id === connectStartData.nodeId
                  )

                  if (connectStartData.nodeId && connectStartData.handleId) {
                    if (events && connectStartData.handleType === 'source') {
                      const foundEvent = events.find(
                        (event) => event.id === connectStartData.nodeId
                      )

                      if (foundEvent?.id && foundEvent.ending) {
                        await api().events.setEventEnding(
                          studioId,
                          foundEvent.id,
                          false
                        )
                      }
                    }

                    await api().paths.savePath(studioId, {
                      title: 'Untitled Path',
                      worldId: scene.worldId,
                      conditionsType: PATH_CONDITIONS_TYPE.ALL,
                      sceneId,
                      originId:
                        connectStartData.handleType === 'target'
                          ? eventId
                          : connectStartData.nodeId,
                      choiceId:
                        foundSourceNode?.data?.eventType ===
                          EVENT_TYPE.CHOICE &&
                        foundSourceNode?.data.totalChoices > 0 &&
                        connectStartData.handleType === 'source'
                          ? connectStartData.handleId
                          : undefined,
                      inputId:
                        foundSourceNode?.data?.eventType === EVENT_TYPE.INPUT &&
                        connectStartData.handleType === 'source'
                          ? connectStartData.handleId
                          : undefined,
                      originType:
                        foundSourceNode?.data?.eventType || ELEMENT_TYPE.CHOICE,
                      destinationId:
                        connectStartData.handleType === 'target'
                          ? connectStartData.nodeId
                          : eventId,
                      destinationType:
                        foundSourceNode?.data?.type === ELEMENT_TYPE.JUMP
                          ? ELEMENT_TYPE.JUMP
                          : ELEMENT_TYPE.EVENT,
                      tags: []
                    })
                  }

                  setConnectStartData(null)

                  composerDispatch({
                    type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE,
                    savedElement: {
                      id: eventId,
                      type: ELEMENT_TYPE.EVENT
                    }
                  })
                }
              } catch (error) {
                throw error
              }
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
                  case 'eventNode':
                    if (events) {
                      const foundEvent = events.find(
                        (event) => node.id === event.id
                      )

                      if (foundEvent && foundEvent.ending) {
                        return `hsl(350, 100%, 65%)`
                      }
                    }

                    return 'hsl(262, 100%, 65%)'
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

SceneMap.displayName = 'SceneMap'

export default SceneMap
