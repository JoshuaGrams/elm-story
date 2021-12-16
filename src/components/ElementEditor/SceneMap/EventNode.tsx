import logger from '../../../lib/logger'

import React, { memo, useContext, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import { v4 as uuid } from 'uuid'

import {
  useStoreState,
  useStoreActions,
  Node,
  useUpdateNodeInternals
} from 'react-flow-renderer'

import {
  Choice,
  ElementId,
  ELEMENT_TYPE,
  WorldId,
  EVENT_TYPE,
  Path,
  StudioId
} from '../../../data/types'

import {
  useChoice,
  useChoicesByEventRef,
  useEvent,
  usePathsByChoiceRef,
  usePathsBySceneRef
} from '../../../hooks'

import { Handle, Position, NodeProps, Connection } from 'react-flow-renderer'

import { Dropdown, Menu, Typography } from 'antd'
import {
  AlignLeftOutlined,
  BranchesOutlined,
  PlusOutlined
} from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../../api'
import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'
import VariableSelectForInput from '../../VariableSelectForInput'
import EventPersonaPane from './EventPersona'

interface MenuInfo {
  domEvent: React.MouseEvent<HTMLElement>
}

const ChoiceSourceHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  choiceId: ElementId
}> = ({ studioId, sceneId, choiceId }) => {
  // TODO: do we really need to get access to paths on every choice?
  const paths = usePathsBySceneRef(studioId, sceneId)

  return (
    <Handle
      key={choiceId}
      type="source"
      className={styles.choiceHandle}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Right}
      id={choiceId}
      isValidConnection={(connection: Connection): boolean => {
        logger.info('isValidConnection')

        if (
          paths &&
          !paths.find(
            (path) =>
              path.choiceId === connection.sourceHandle &&
              path.destinationId === connection.target
          )
        ) {
          logger.info(
            `Path possible from choice: ${connection.sourceHandle} to event: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate path not possible.')
          return false
        }
      }}
    />
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
  onDelete
}) => {
  const choice = useChoice(studioId, choiceId),
    outgoingPaths = usePathsByChoiceRef(studioId, choiceId)

  const { composer } = useContext(ComposerContext)

  const [renamingChoice, setRenamingChoice] = useState(false)

  function _onReorder(event: MenuInfo, newPosition: number) {
    event.domEvent.stopPropagation()

    choice?.eventId &&
      choice?.id &&
      onReorder(choice?.eventId, choice.id, newPosition)
  }

  useEffect(() => {
    setRenamingChoice(false)
  }, [title])

  return (
    <div
      className={`${styles.ChoiceRow} nodrag ${
        selected && styles.choiceSelected
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
      onDoubleClick={() => {
        !renamingChoice && setRenamingChoice(true)
      }}
    >
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
        <div>
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
          </Typography.Text>
        </div>
      </Dropdown>
      {handle}
    </div>
  )
}

ChoiceRow.displayName = 'ChoiceRow'

const InputSourceHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  inputId: ElementId
}> = ({ studioId, sceneId, inputId }) => {
  const paths = usePathsBySceneRef(studioId, sceneId)

  return (
    <Handle
      key={inputId}
      type="source"
      className={styles.inputHandle}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Right}
      id={inputId}
      isValidConnection={(connection: Connection): boolean => {
        logger.info('isValidConnection')

        if (
          paths &&
          !paths.find(
            (path) =>
              path.inputId === connection.sourceHandle &&
              path.destinationId === connection.target
          )
        ) {
          logger.info(
            `Path possible from input: ${connection.sourceHandle} to event: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate path not possible.')
          return false
        }
      }}
    />
  )
}

InputSourceHandle.displayName = 'InputSourceHandle'

const InputRow: React.FC<{
  studioId: StudioId
  worldId: WorldId
  inputId: ElementId
  handle: JSX.Element
}> = ({ studioId, worldId, inputId, handle }) => {
  return (
    <>
      <VariableSelectForInput
        studioId={studioId}
        worldId={worldId}
        inputId={inputId}
      />{' '}
      {handle}
    </>
  )
}

InputRow.displayName = 'InputRow'

const EventTargetHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  eventId: ElementId
}> = ({ studioId, sceneId, eventId }) => {
  // TODO: do we really need to get access to paths on every event?
  const paths = usePathsBySceneRef(studioId, sceneId)

  return (
    <Handle
      type="target"
      id={eventId}
      className={styles.passageTargetHandle}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Left}
      isValidConnection={(connection: Connection): boolean => {
        logger.info('isValidConnection')

        if (
          paths &&
          !paths.find(
            (path) =>
              path.choiceId === connection.sourceHandle &&
              path.destinationId === connection.target
          )
        ) {
          logger.info(
            `Path possible from choice: ${connection.sourceHandle} to event: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate path not possible.')
          return false
        }
      }}
    />
  )
}

EventTargetHandle.displayName = 'EventTargetHandle'

const EventSourceHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  eventId: ElementId
}> = ({ studioId, sceneId, eventId }) => {
  const events = usePathsBySceneRef(studioId, sceneId)

  return (
    <Handle
      key={eventId}
      type="source"
      className={styles.passageSourceHandle}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Right}
      id={eventId}
      isValidConnection={(connection: Connection): boolean => {
        logger.info('isValidConnection')

        if (
          events &&
          !events.find(
            (path) =>
              path.originId === connection.sourceHandle &&
              path.destinationId === connection.target
          )
        ) {
          logger.info(
            `Path possible from input: ${connection.sourceHandle} to event: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate path not possible.')
          return false
        }
      }}
    />
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
  >([])

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
                  studioId={data.studioId}
                  sceneId={data.sceneId}
                  choiceId={choice.id}
                />
              )
            }
          })
      )
    }
  }, [choicesByEventRef, event?.choices])

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

  return (
    <div className={styles.EventNode} key={data.eventId} id={data.eventId}>
      {event?.id && (
        <>
          <div>
            <EventTargetHandle
              studioId={data.studioId}
              sceneId={data.sceneId}
              eventId={event.id}
            />

            <div
              style={{
                overflow: 'hidden',
                borderBottomLeftRadius:
                  (composer.selectedSceneMapEvent === event.id &&
                    composer.selectedWorldOutlineElement.id ===
                      event.sceneId) ||
                  event.choices.length > 0 ||
                  event.type === EVENT_TYPE.INPUT
                    ? '0px'
                    : '5px',
                borderBottomRightRadius:
                  (composer.selectedSceneMapEvent === event.id &&
                    composer.selectedWorldOutlineElement.id ===
                      event.sceneId) ||
                  event.choices.length > 0 ||
                  event.type === EVENT_TYPE.INPUT
                    ? '0px'
                    : '5px'
              }}
            >
              <h1
                // TODO: make class list work in ContextMenu
                className="nodeEventHeader"
                data-component-id={event.id}
                onDoubleClick={() => event.id && data.onEditEvent(event.id)}
              >
                {/* #395 */}
                <AlignLeftOutlined
                  className={`${styles.headerIcon} ${
                    event.ending ? styles.warning : ''
                  }`}
                />

                {event.title}
              </h1>

              <EventPersonaPane
                studioId={data.studioId}
                worldId={event.worldId}
                persona={event.persona}
              />
            </div>

            {choices.length === 0 && event.type !== EVENT_TYPE.INPUT && (
              <EventSourceHandle
                studioId={data.studioId}
                sceneId={data.sceneId}
                eventId={event.id}
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
                                (passageNode) => passageNode.id === event.id
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
            <div className={`${styles.input} ${styles.bottomRadius}`}>
              <InputRow
                studioId={data.studioId}
                worldId={event.worldId}
                inputId={event.input}
                handle={
                  <InputSourceHandle
                    studioId={data.studioId}
                    sceneId={data.sceneId}
                    inputId={event.input}
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
