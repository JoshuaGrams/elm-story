import logger from '../../../lib/logger'

import React, {
  memo,
  ReactEventHandler,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { cloneDeep } from 'lodash-es'
import { v4 as uuid } from 'uuid'

import {
  useStoreState,
  useStoreActions,
  Node,
  useUpdateNodeInternals,
  FlowElement
} from 'react-flow-renderer'

import {
  Choice,
  ElementId,
  ELEMENT_TYPE,
  EVENT_TYPE,
  Path,
  StudioId
} from '../../../data/types'

import {
  useChoice,
  useChoicesByEventRef,
  useEvent,
  useInput,
  usePathsByChoiceRef,
  usePathsBySceneRef,
  useVariable
} from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import { Handle, Position, NodeProps, Connection } from 'react-flow-renderer'

import { Dropdown, Menu, Typography } from 'antd'
import {
  BranchesOutlined,
  FacebookFilled,
  PlusOutlined
} from '@ant-design/icons'

import NodeTitle from './NodeTitle'
import EventPersonaPane from './EventPersona'
import EventSnippet from './EventSnippet'
import EventCharacterRefGrid from './EventCharacterRefGrid'

import styles from './styles.module.less'

import api from '../../../api'
import { NodeData } from '.'

interface MenuInfo {
  domEvent: React.MouseEvent<HTMLElement>
}

export const isConnectionValid = (
  connection: Connection,
  paths: Path[],
  handleType: 'CHOICE' | 'INPUT' | 'JUMP' | 'ORIGIN'
): boolean => {
  logger.info('isConnectionValid')
  logger.info(`handleType: ${handleType}`)

  if (connection.source === connection.target) {
    logger.info('Unable to make connection. Source is equal to target.')
    return false
  }

  if (!connection.sourceHandle) {
    logger.info('Unable to make connection. Source handle is missing.')
    return false
  }

  if (
    paths.find((path) => {
      switch (handleType) {
        case 'CHOICE':
          logger.info(
            'Unable to make connection. Path choice is equal to source handle and path destination is equal to target.'
          )

          if (
            path.choiceId === connection.sourceHandle &&
            path.destinationId === connection.target
          ) {
            return true
          }

          if (
            !path.choiceId &&
            path.originId === connection.source &&
            path.destinationId === connection.target
          ) {
            return true
          }

          return false
        case 'INPUT':
          logger.info(
            'Unable to make connection. Path input is equal to source handle and path destination is equal to target.'
          )
          if (
            path.inputId === connection.sourceHandle &&
            path.destinationId === connection.target
          ) {
            return true
          }

          return false
        case 'JUMP':
          logger.info(
            'Unable to make connection. Path choice is equal to source handle and path destination is equal to target or path input is equal to source handle and path destination is equal to target '
          )
          if (
            (path.choiceId === connection.sourceHandle &&
              path.destinationId === connection.target) ||
            (path.inputId === connection.sourceHandle &&
              path.destinationId === connection.target)
          ) {
            return true
          }

          if (
            !path.choiceId &&
            path.originId === connection.source &&
            path.destinationId === connection.target
          ) {
            return true
          }

          return false
        case 'ORIGIN':
          logger.info(
            'Unable to make connection. Path origin is equal to source handle and destination is equal to target.'
          )
          return (
            path.originId === connection.sourceHandle &&
            path.destinationId === connection.target
          )
        default:
          logger.info('Unable to make connection. Reason unknown.')
          return true
      }
    })
  ) {
    return false
  }

  logger.info(
    `Path possible from source: ${connection.sourceHandle} to target: ${connection.target}`
  )

  return true
}

const ChoiceSourceHandle: React.FC<{
  choiceId: ElementId
  scenePaths: Path[]
}> = ({ choiceId, scenePaths }) => {
  return (
    <Handle
      key={choiceId}
      type="source"
      className={styles.choiceHandle}
      position={Position.Right}
      id={choiceId}
      isValidConnection={(connection: Connection) =>
        isConnectionValid(connection, scenePaths, 'CHOICE')
      }
    >
      <div
        className={`${styles.visual} ${styles.choiceHandleVisual}`}
        style={{
          background: scenePaths.find((path) => path.choiceId === choiceId)
            ? 'var(--event-node-handle-gradient-right-active)'
            : 'var(--node-handle-gradient-right)'
        }}
      />
    </Handle>
  )
}

const ChoiceRow: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  choiceId: ElementId
  title: string
  order: [number, number] // [position, total]
  showDivider: boolean
  handle: JSX.Element
  selected: boolean
  onSelect: (eventId: ElementId, choiceId: ElementId) => void
  onReorder: (
    eventId: ElementId,
    choiceId: ElementId,
    newPosition: number
  ) => void
  onDelete: (choiceId: ElementId, outgoingRoutes: Path[]) => void
  onValidateConnection: () => boolean
}> = ({
  studioId,
  sceneId,
  choiceId,
  title,
  order,
  showDivider = true, // last choice
  handle,
  selected = false,
  onSelect,
  onReorder,
  onDelete,
  onValidateConnection
}) => {
  const choice = useChoice(studioId, choiceId),
    outgoingPaths = usePathsByChoiceRef(studioId, choiceId)

  const { composer, composerDispatch } = useContext(ComposerContext)

  const [renamingChoice, setRenamingChoice] = useState(false),
    [isValidConnection, setIsValidConnection] = useState<boolean | undefined>(
      undefined
    )

  function _onReorder(event: MenuInfo, newPosition: number) {
    event.domEvent.stopPropagation()

    choice?.eventId &&
      choice?.id &&
      onReorder(choice?.eventId, choice.id, newPosition)
  }

  useEffect(() => {
    setRenamingChoice(false)
  }, [title])

  useEffect(() => {
    // elmstorygames/feedback#152
    if (renamingChoice) {
      const textarea = document.querySelector(
        '.ant-typography-edit-content .ant-input'
      ) as HTMLTextAreaElement | null

      textarea?.select()
    }
  }, [renamingChoice])

  useEffect(() => {
    if (
      choiceId === composer.selectedSceneMapConnectStartData?.choiceId ||
      !composer.selectedSceneMapConnectStartData?.choiceId
    ) {
      // TODO: this is being processed all the time
      setIsValidConnection(onValidateConnection())
    }
  }, [choiceId, composer.selectedSceneMapConnectStartData?.choiceId])

  useEffect(() => {
    if (
      !composer.selectedSceneMapConnectStartData ||
      choiceId !== composer.selectedSceneMapConnectStartData.choiceId
    ) {
      setIsValidConnection(undefined)
    }
  }, [choiceId, composer.selectedSceneMapConnectStartData])

  return (
    <div
      className={`${styles.ChoiceRow} nodrag ${
        selected ? styles.choiceSelected : ''
      } ${
        sceneId !== composer.selectedWorldOutlineElement.id && !showDivider
          ? styles.bottomRadius
          : ''
      }`}
      style={{
        borderBottom: showDivider ? '1px solid hsl(0, 0%, 15%)' : 'none'
      }}
      onMouseDown={() =>
        !renamingChoice &&
        choice?.eventId &&
        choice?.id &&
        onSelect(choice.eventId, choice.id)
      }
      onMouseEnter={(event) => {
        event.stopPropagation()

        choice &&
          composer.selectedSceneMapConnectStartData &&
          composerDispatch({
            type:
              COMPOSER_ACTION_TYPE.SET_SELECTED_SCENE_MAP_CONNECT_START_DATA,
            selectedSceneMapConnectStartData: {
              ...composer.selectedSceneMapConnectStartData,
              choiceId: choice.id || null,
              targetNodeId: choice.eventId || null
            }
          })
      }}
      onMouseLeave={(event) => {
        event.stopPropagation()

        choice &&
          composer.selectedSceneMapConnectStartData &&
          composerDispatch({
            type:
              COMPOSER_ACTION_TYPE.SET_SELECTED_SCENE_MAP_CONNECT_START_DATA,
            selectedSceneMapConnectStartData: {
              ...composer.selectedSceneMapConnectStartData,
              choiceId: null,
              targetNodeId: choice.eventId || null
            }
          })
      }}
      onDoubleClick={() => !renamingChoice && setRenamingChoice(true)}
      data-id={choice?.id}
    >
      {composer.selectedSceneMapConnectStartData && choice && (
        <div
          className={`es-scene-map__connection-cover ${
            composer.selectedSceneMapConnectStartData?.choiceId === choiceId &&
            isValidConnection
              ? styles.validConnection
              : ''
          } ${
            composer.selectedSceneMapConnectStartData?.choiceId === choiceId &&
            isValidConnection === false
              ? styles.invalidConnection
              : ''
          }`}
          data-id={choice?.id}
          style={{
            zIndex: 3,
            pointerEvents: 'all',
            borderBottomLeftRadius: !showDivider ? '5px' : '0px',
            borderBottomRightRadius: !showDivider ? '5px' : '0px'
          }}
        />
      )}

      <Dropdown
        trigger={['contextMenu']}
        overlay={
          <Menu>
            {order[0] > 1 && (
              <Menu.Item onClick={(event) => _onReorder(event, 0)}>
                Move to Top
              </Menu.Item>
            )}
            {order[0] > 0 && (
              <Menu.Item onClick={(event) => _onReorder(event, order[0] - 1)}>
                Move Up
              </Menu.Item>
            )}
            {order[0] < order[1] - 1 && (
              <Menu.Item onClick={(event) => _onReorder(event, order[0] + 1)}>
                Move Down
              </Menu.Item>
            )}
            {order[0] < order[1] - 2 && (
              <Menu.Item onClick={(event) => _onReorder(event, order[1] - 1)}>
                Move to Bottom
              </Menu.Item>
            )}

            <Menu.Item
              onClick={(event) => {
                event.domEvent.stopPropagation()

                onDelete(choiceId, outgoingPaths || [])
              }}
            >
              Remove Choice...
            </Menu.Item>
          </Menu>
        }
      >
        <div data-id={choice?.id}>
          <BranchesOutlined className={styles.choiceRowIcon} />{' '}
          <Typography.Text
            editable={{
              editing: renamingChoice,
              onChange: async (newTitle) => {
                if (!newTitle || title === newTitle) {
                  setRenamingChoice(false)
                  return
                }

                try {
                  choice &&
                    (await api().choices.saveChoice(studioId, {
                      ...choice,
                      title: newTitle
                    }))
                } catch (error) {
                  throw error
                }
              }
            }}
          >
            {title}
            {/* {isValidConnection === undefined
              ? ''
              : isValidConnection
              ? 'yes'
              : 'no'} */}
          </Typography.Text>
        </div>
      </Dropdown>
      {handle}
    </div>
  )
}

ChoiceRow.displayName = 'ChoiceRow'

const InputSourceHandle: React.FC<{
  inputId: ElementId
  scenePaths: Path[]
}> = ({ inputId, scenePaths }) => {
  return (
    <Handle
      key={inputId}
      type="source"
      className={styles.inputHandle}
      position={Position.Right}
      id={inputId}
      isValidConnection={(connection: Connection) =>
        isConnectionValid(connection, scenePaths, 'INPUT')
      }
    >
      <div
        className={`${styles.visual} ${styles.inputHandleVisual}`}
        style={{
          background: scenePaths.find((path) => path.inputId === inputId)
            ? 'var(--event-node-handle-gradient-right-active)'
            : 'var(--node-handle-gradient-right)'
        }}
      />
    </Handle>
  )
}

InputSourceHandle.displayName = 'InputSourceHandle'

const InputRow: React.FC<{
  studioId: StudioId
  eventSceneId: ElementId
  inputId: ElementId
  handle: JSX.Element
}> = ({ studioId, eventSceneId, inputId, handle }) => {
  const input = useInput(studioId, inputId, [inputId]),
    variable = useVariable(studioId, input?.variableId, [input?.variableId])

  const { composer, composerDispatch } = useContext(ComposerContext)

  const [incomingConnection, setIncomingConnection] = useState<{
    active: boolean
    validSource: boolean
    validTarget: boolean
  }>({
    active: false,
    validSource: false,
    validTarget: false
  })

  useEffect(() => {
    !composer.selectedSceneMapConnectStartData &&
      setIncomingConnection({
        active: false,
        validSource: false,
        validTarget: false
      })
  }, [composer.selectedSceneMapConnectStartData])

  return (
    <div className={styles.InputRow}>
      {variable ? (
        <div className={styles.info}>
          <h2>Input Variable</h2>
          <p>{variable.title}</p>

          <h2>Variable Type</h2>
          <p>{variable.type}</p>

          <h2>Initial Value</h2>
          <p>{variable.initialValue || 'undefined'}</p>
        </div>
      ) : (
        <span className={styles.warning}>Missing input variable...</span>
      )}

      {handle}
    </div>
  )
}

InputRow.displayName = 'InputRow'

const EventTargetHandle: React.FC<{
  eventId: ElementId
  scenePaths: Path[]
}> = ({ eventId, scenePaths }) => {
  return (
    <Handle
      type="target"
      id={eventId}
      className={styles.eventTargetHandle}
      position={Position.Left}
      isValidConnection={(connection: Connection) =>
        isConnectionValid(connection, scenePaths, 'CHOICE')
      }
    >
      <div
        className={`${styles.visual} ${styles.eventHandleVisual}`}
        style={{
          background: scenePaths.find((path) => path.destinationId === eventId)
            ? 'var(--event-node-handle-gradient-left-active)'
            : 'var(--node-handle-gradient-left)'
        }}
      />
    </Handle>
  )
}

EventTargetHandle.displayName = 'EventTargetHandle'

const EventSourceHandle: React.FC<{
  eventId: ElementId
  scenePaths: Path[]
}> = ({ eventId, scenePaths }) => {
  return (
    <Handle
      key={eventId}
      type="source"
      className={styles.eventSourceHandle}
      position={Position.Right}
      id={eventId}
      isValidConnection={(connection: Connection) =>
        isConnectionValid(connection, scenePaths, 'ORIGIN')
      }
    >
      <div
        className={`${styles.visual} ${styles.eventHandleVisual}`}
        style={{
          background: scenePaths.find((path) => path.originId === eventId)
            ? 'var(--event-node-handle-gradient-right-active)'
            : 'var(--node-handle-gradient-right)'
        }}
      />
    </Handle>
  )
}

EventSourceHandle.displayName = 'EventSourceHandle'

const EventNode: React.FC<NodeProps<{
  studioId: StudioId
  sceneId: ElementId
  eventId: ElementId
  selectedChoice: ElementId | null
  onEditEvent: (eventId: ElementId) => void
  onChoiceSelect: (eventId: ElementId, choiceId: ElementId | null) => void
  type: ELEMENT_TYPE
}>> = ({ data }) => {
  const event = useEvent(data.studioId, data.eventId),
    choicesByEventRef = useChoicesByEventRef(data.studioId, data.eventId)

  const updateNodeInternals = useUpdateNodeInternals()

  const events = useStoreState((state) =>
      state.nodes.filter(
        (node: Node<{ type: ELEMENT_TYPE }>) =>
          node?.data?.type === ELEMENT_TYPE.EVENT
      )
    ),
    setSelectedElement = useStoreActions(
      (actions) => actions.setSelectedElements
    )

  const { composer, composerDispatch } = useContext(ComposerContext)

  const [choices, setChoices] = useState<
      { id: ElementId; title: string; handle: JSX.Element }[]
    >([]),
    [incomingConnection, setIncomingConnection] = useState<{
      active: boolean
      validTarget: boolean
      validSource: boolean
    }>({
      active: false,
      validTarget: false,
      validSource: false
    })

  const scenePaths = usePathsBySceneRef(data.studioId, data.sceneId, []) || []

  const nodes: FlowElement<NodeData>[] = useStoreState((state) => state.nodes)

  const isPassthroughEvent =
      event && event.choices.length === 0 && event.type !== EVENT_TYPE.INPUT,
    isInputEvent = event?.type === EVENT_TYPE.INPUT,
    isMultiChoiceEvent = event && event.choices.length > 0

  const validateConnection = useCallback(
    (_event?: React.MouseEvent<HTMLDivElement, MouseEvent>): boolean => {
      const { sceneId, nodeId, handleId, handleType, targetNodeId } =
        composer.selectedSceneMapConnectStartData || {}

      let valid = false

      if (
        event?.id &&
        sceneId &&
        event.sceneId === sceneId &&
        nodeId !== event.id
      ) {
        const foundSourceNode = nodes.find((node) => node.id === nodeId),
          foundTargetNode = nodes.find(
            (node) => node.id === targetNodeId || event.id
          )

        if (foundSourceNode && foundTargetNode) {
          if (handleType === 'target' && !isPassthroughEvent) {
            if (isInputEvent && event.input) {
              valid = isConnectionValid(
                {
                  source: event.id,
                  sourceHandle: event.input,
                  target: nodeId || null,
                  targetHandle: nodeId || null
                },
                scenePaths,
                foundTargetNode.data?.eventType || EVENT_TYPE.JUMP
              )
            }

            if (isMultiChoiceEvent) {
              valid = isConnectionValid(
                {
                  source: event.id,
                  sourceHandle:
                    composer.selectedSceneMapConnectStartData?.choiceId || null,
                  target: nodeId || null,
                  targetHandle: nodeId || null
                },
                scenePaths,
                foundTargetNode.data?.eventType || EVENT_TYPE.JUMP
              )
            }
          } else {
            valid = isConnectionValid(
              {
                source: handleType === 'source' ? nodeId || null : event.id,
                sourceHandle: handleId || null,
                target: handleType === 'source' ? event.id : nodeId || null,
                targetHandle:
                  handleType === 'source' ? event.id : nodeId || null
              },
              scenePaths,
              handleType === 'target'
                ? foundTargetNode.data?.eventType || EVENT_TYPE.JUMP
                : foundSourceNode.data?.eventType || EVENT_TYPE.JUMP
            )
          }

          setIncomingConnection({
            ...incomingConnection,
            active: true,
            validTarget: valid && handleType === 'source',
            validSource: valid && handleType === 'target'
          })

          composerDispatch({
            type:
              COMPOSER_ACTION_TYPE.SET_SELECTED_SCENE_MAP_CONNECT_START_DATA,
            selectedSceneMapConnectStartData: composer.selectedSceneMapConnectStartData
              ? {
                  ...composer.selectedSceneMapConnectStartData,
                  targetNodeId: valid ? event.id : null,
                  inputId: valid && isInputEvent ? event.input || null : null,
                  choiceId:
                    valid && isMultiChoiceEvent
                      ? composer.selectedSceneMapConnectStartData.choiceId ||
                        null
                      : composer.selectedSceneMapConnectStartData.choiceId ||
                        null
                }
              : null
          })
        }
      }

      return valid
    },
    [
      event,
      isPassthroughEvent,
      isMultiChoiceEvent,
      isInputEvent,
      composer.selectedSceneMapConnectStartData
    ]
  )

  useEffect(() => {
    logger.info(`EventNode->choicesByEventRef->useEffect`)

    if (choicesByEventRef) {
      setChoices(
        // @ts-ignore
        choicesByEventRef
          .filter(
            (choice): choice is Choice => choice && choice.id !== undefined
          )
          .map((choice) => {
            if (!choice.id)
              throw new Error('Unable to generate handle. Missing choice ID.')

            return {
              id: choice.id,
              title: choice.title,
              handle: (
                <ChoiceSourceHandle
                  choiceId={choice.id}
                  scenePaths={scenePaths}
                />
              )
            }
          })
      )
    }
  }, [choicesByEventRef, event?.choices, scenePaths])

  useEffect(() => {
    async function removePassthroughNode() {
      if (event?.id && choices.length > 0) {
        const foundPaths = await api().paths.getPassthroughPathsByEventRef(
          data.studioId,
          data.eventId
        )

        await Promise.all([
          foundPaths.map(async (foundPath) => {
            foundPath?.id &&
              (await api().paths.removePath(data.studioId, foundPath.id))
          })
        ])
      }

      updateNodeInternals(data.eventId)
    }

    removePassthroughNode()
  }, [choices])

  useEffect(() => {
    logger.info(
      `EventNode->composer.selectedComponentEditorSceneViewChoice->useEffect->${composer.selectedSceneMapChoice}`
    )
  }, [composer.selectedSceneMapChoice])

  useEffect(() => {
    logger.info(`EventNode->useEffect->selectedChoice: ${data.selectedChoice}`)
  }, [data.selectedChoice])

  useEffect(() => {
    logger.info(
      `EventNode->useEffect->composer.selectedSceneMapConnectStartData`
    )

    if (!composer.selectedSceneMapConnectStartData) {
      setIncomingConnection({
        active: false,
        validTarget: false,
        validSource: false
      })

      return
    }
  }, [composer.selectedSceneMapConnectStartData])

  // useEffect(() => {
  //   const { choiceId } = composer.selectedSceneMapConnectStartData || {}

  //   choiceId && validateConnection()
  // }, [composer.selectedSceneMapConnectStartData?.choiceId])

  return (
    <div
      className={styles.EventNode}
      key={data.eventId}
      id={data.eventId}
      onMouseEnter={validateConnection}
    >
      {event && (
        <div
          className={`es-scene-map__connection-cover
         es-scene-map__event-node ${
           event.choices.length > 0 &&
           composer.selectedSceneMapConnectStartData?.handleType === 'target'
             ? 'es-scene-map__event-node-multi-choice'
             : ''
         } ${
            // isPassthroughEvent &&
            incomingConnection.active && incomingConnection.validTarget
              ? 'es-scene-map__connection-valid-target'
              : ''
          } ${
            incomingConnection.active && !incomingConnection.validTarget
              ? 'es-scene-map__connection-invalid-target'
              : ''
          } ${
            // isPassthroughEvent &&
            incomingConnection.active && incomingConnection.validSource
              ? 'es-scene-map__connection-valid-source'
              : ''
          } ${
            // isPassthroughEvent &&
            incomingConnection.active && !incomingConnection.validSource
              ? 'es-scene-map__connection-invalid-source'
              : ''
          } ${
            // (isPassthroughEvent || event?.type === EVENT_TYPE.INPUT) &&
            incomingConnection.active &&
            (incomingConnection.validSource || incomingConnection.validTarget)
              ? 'es-scene-map__connection-valid'
              : ''
          }`}
        />
      )}

      {event?.id && (
        <>
          <div>
            <EventTargetHandle eventId={event.id} scenePaths={scenePaths} />

            <div>
              <NodeTitle studioId={data.studioId} event={event} />
            </div>

            {choices.length === 0 && event.type !== EVENT_TYPE.INPUT && (
              <EventSourceHandle eventId={event.id} scenePaths={scenePaths} />
            )}
          </div>

          <div
            className={styles.eventContentWrapper}
            style={{
              borderBottomLeftRadius:
                (composer.selectedSceneMapEvent === event.id &&
                  composer.selectedWorldOutlineElement.id === event.sceneId) ||
                event.choices.length > 0 ||
                event.type === EVENT_TYPE.INPUT
                  ? '0px'
                  : '5px',
              borderBottomRightRadius:
                (composer.selectedSceneMapEvent === event.id &&
                  composer.selectedWorldOutlineElement.id === event.sceneId) ||
                event.choices.length > 0 ||
                event.type === EVENT_TYPE.INPUT
                  ? '0px'
                  : '5px',
              borderBottom:
                event.choices.length > 0 || event.input
                  ? '1px solid hsl(0, 0%, 10%)'
                  : 'none'
            }}
          >
            <EventPersonaPane
              studioId={data.studioId}
              worldId={event.worldId}
              persona={event.persona}
            />

            <EventSnippet
              worldId={event.worldId}
              studioId={data.studioId}
              eventId={event.id}
              content={event.content}
              onEditPassage={(eventId) => data.onEditEvent(eventId)}
            />

            {event.characters.length > 0 && (
              <EventCharacterRefGrid
                studioId={data.studioId}
                characterIds={
                  event.persona?.[0]
                    ? event.characters.filter((id) => id !== event.persona?.[0])
                    : event.characters
                }
              />
            )}
          </div>

          {event.type === EVENT_TYPE.CHOICE && (
            <>
              <div
                className={`${styles.choices} ${
                  composer.selectedSceneMapEvent === event.id &&
                  event.sceneId === composer.selectedWorldOutlineElement.id
                    ? ''
                    : styles.bottomRadius
                }`}
              >
                {choices
                  .sort(
                    (a, b) =>
                      event.choices.findIndex((choiceId) => a.id === choiceId) -
                      event.choices.findIndex((choiceId) => b.id === choiceId)
                  )
                  .map(
                    (choice, index) =>
                      choice.id && (
                        <ChoiceRow
                          key={choice.id}
                          studioId={data.studioId}
                          sceneId={event.sceneId}
                          choiceId={choice.id}
                          title={choice.title}
                          order={[index, choices.length]}
                          showDivider={choices.length - 1 !== index}
                          handle={choice.handle}
                          selected={data.selectedChoice === choice.id}
                          onSelect={(eventId, choiceId) => {
                            logger.info(
                              `EventNode->onClick: choice: ${choiceId}`
                            )

                            composer.selectedSceneMapEvent !== eventId &&
                              setSelectedElement([
                                cloneDeep(
                                  events.find(
                                    (eventNode) => eventNode.id === eventId
                                  )
                                )
                              ]) &&
                              composerDispatch({
                                type:
                                  COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                                selectedSceneMapEvent: eventId
                              })

                            composer.selectedSceneMapEvent === eventId &&
                              data.onChoiceSelect(eventId, choiceId)
                          }}
                          onReorder={async (eventId, choiceId, newPosition) => {
                            logger.info(
                              `ChoiceRow->onReorder->eventId: ${eventId} choiceId: ${choiceId} newPosition: ${newPosition}`
                            )

                            const clonedChoiceRefs = cloneDeep(
                                event.choices || []
                              ),
                              foundChoiceRefIndex = clonedChoiceRefs.findIndex(
                                (choiceRef) => choiceRef == choiceId
                              )

                            clonedChoiceRefs.splice(foundChoiceRefIndex, 1)
                            clonedChoiceRefs.splice(newPosition, 0, choiceId)

                            await api().events.saveChoiceRefsToEvent(
                              data.studioId,
                              data.eventId,
                              clonedChoiceRefs
                            )
                          }}
                          onDelete={async (choiceId, outgoingPaths) => {
                            composer.selectedSceneMapChoice === choice.id &&
                              composerDispatch({
                                type:
                                  COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE,
                                selectedSceneMapChoice: null
                              })

                            const clonedChoices = cloneDeep(choices),
                              foundChoiceIndex = clonedChoices.findIndex(
                                (clonedChoice) => clonedChoice.id === choiceId
                              )

                            if (foundChoiceIndex !== -1) {
                              try {
                                await Promise.all(
                                  outgoingPaths.map(async (outgoingPath) => {
                                    if (!outgoingPath.id)
                                      throw new Error(
                                        'Unable to remove path. Missing ID'
                                      )

                                    await api().paths.removePath(
                                      data.studioId,
                                      outgoingPath.id
                                    )
                                  })
                                )

                                await api().choices.removeChoice(
                                  data.studioId,
                                  clonedChoices[foundChoiceIndex].id
                                )

                                clonedChoices.splice(foundChoiceIndex, 1)

                                await api().events.saveChoiceRefsToEvent(
                                  data.studioId,
                                  data.eventId,
                                  clonedChoices.map(
                                    (clonedChoice) => clonedChoice.id
                                  )
                                )
                              } catch (error) {
                                if (error instanceof Error)
                                  throw new Error(error.message)
                              }
                            }
                          }}
                          onValidateConnection={validateConnection}
                        />
                      )
                  )}
              </div>

              {composer.selectedSceneMapEvent === event.id &&
                event.sceneId === composer.selectedWorldOutlineElement.id && (
                  <div
                    className={`${styles.addChoiceButton} nodrag`}
                    onClick={async () => {
                      logger.info('EventNode->addChoiceButton->onClick')

                      if (
                        composer.selectedSceneMapEvent === event.id &&
                        event.choices
                      ) {
                        const choiceId = uuid()

                        try {
                          await api().events.saveChoiceRefsToEvent(
                            data.studioId,
                            data.eventId,
                            [...event.choices, choiceId]
                          )

                          await api().choices.saveChoice(data.studioId, {
                            id: choiceId,
                            worldId: event.worldId,
                            eventId: data.eventId,
                            title: 'Untitled Choice',
                            tags: []
                          })

                          data.onChoiceSelect(event.id, choiceId)
                        } catch (error) {
                          if (error instanceof Error)
                            throw new Error(error.message)
                        }
                      } else {
                        event.id &&
                          setSelectedElement([
                            cloneDeep(
                              events.find(
                                (eventNode) => eventNode.id === event.id
                              )
                            )
                          ]) &&
                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP,
                            selectedSceneMapJump: null
                          }) &&
                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT,
                            selectedSceneMapEvent: event.id
                          }) &&
                          composerDispatch({
                            type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE,
                            selectedSceneMapChoice: null
                          })
                      }
                    }}
                  >
                    <PlusOutlined />
                  </div>
                )}
            </>
          )}

          {event.type === EVENT_TYPE.INPUT && event.input && (
            <div
              className={`${styles.bottomRadius}`}
              style={{ background: 'hsla(0, 0%, 20%, 80%)' }}
            >
              <InputRow
                studioId={data.studioId}
                eventSceneId={data.sceneId}
                inputId={event.input}
                handle={
                  <InputSourceHandle
                    inputId={event.input}
                    scenePaths={scenePaths}
                  />
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(EventNode)
