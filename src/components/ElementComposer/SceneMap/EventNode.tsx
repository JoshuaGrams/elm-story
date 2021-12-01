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
  useRoutesByChoiceRef,
  useRoutesBySceneRef
} from '../../../hooks'

import { Handle, Position, NodeProps, Connection } from 'react-flow-renderer'

import { Dropdown, Menu, Typography } from 'antd'
import {
  AlignLeftOutlined,
  BranchesOutlined,
  PlusOutlined,
  VerticalLeftOutlined
} from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../../api'
import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'
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
  // TODO: do we really need to get access to routes on every choice?
  const routes = useRoutesBySceneRef(studioId, sceneId)

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
          routes &&
          !routes.find(
            (route) =>
              route.choiceId === connection.sourceHandle &&
              route.destinationId === connection.target
          )
        ) {
          logger.info(
            `Route possible from choice: ${connection.sourceHandle} to passage: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate route not possible.')
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
  onSelect: (passageId: ElementId, choiceId: ElementId) => void
  onReorder: (
    passageId: ElementId,
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
    outgoingRoutes = useRoutesByChoiceRef(studioId, choiceId)

  const { editor } = useContext(EditorContext)

  const [renamingChoice, setRenamingChoice] = useState(false)

  function _onReorder(event: MenuInfo, newPosition: number) {
    event.domEvent.stopPropagation()

    choice?.passageId &&
      choice?.id &&
      onReorder(choice?.passageId, choice.id, newPosition)
  }

  useEffect(() => {
    setRenamingChoice(false)
  }, [title])

  return (
    <div
      className={`${styles.ChoiceRow} nodrag ${
        selected && styles.choiceSelected
      } ${
        sceneId !== editor.selectedWorldOutlineElement.id && !showDivider
          ? styles.bottomRadius
          : ''
      }`}
      style={{
        borderBottom: showDivider ? '1px solid hsl(0, 0%, 15%)' : 'none'
      }}
      onMouseDown={() =>
        !renamingChoice &&
        choice?.passageId &&
        choice?.id &&
        onSelect(choice.passageId, choice.id)
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

                onDelete(choiceId, outgoingRoutes || [])
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

const InputSoureHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  inputId: ElementId
}> = ({ studioId, sceneId, inputId }) => {
  const routes = useRoutesBySceneRef(studioId, sceneId)

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
          routes &&
          !routes.find(
            (route) =>
              route.inputId === connection.sourceHandle &&
              route.destinationId === connection.target
          )
        ) {
          logger.info(
            `Route possible from input: ${connection.sourceHandle} to passage: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate route not possible.')
          return false
        }
      }}
    />
  )
}

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

const PassageTargetHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  passageId: ElementId
}> = ({ studioId, sceneId, passageId }) => {
  // TODO: do we really need to get access to routes on every passage?
  const routes = useRoutesBySceneRef(studioId, sceneId)

  return (
    <Handle
      type="target"
      id={passageId}
      className={styles.passageTargetHandle}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Left}
      isValidConnection={(connection: Connection): boolean => {
        logger.info('isValidConnection')

        if (
          routes &&
          !routes.find(
            (route) =>
              route.choiceId === connection.sourceHandle &&
              route.destinationId === connection.target
          )
        ) {
          logger.info(
            `Route possible from choice: ${connection.sourceHandle} to passage: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate route not possible.')
          return false
        }
      }}
    />
  )
}

const PassageSoureHandle: React.FC<{
  studioId: StudioId
  sceneId: ElementId
  passageId: ElementId
}> = ({ studioId, sceneId, passageId }) => {
  const routes = useRoutesBySceneRef(studioId, sceneId)

  return (
    <Handle
      key={passageId}
      type="source"
      className={styles.passageSourceHandle}
      style={{ top: '50%', bottom: '50%' }}
      position={Position.Right}
      id={passageId}
      isValidConnection={(connection: Connection): boolean => {
        logger.info('isValidConnection')

        if (
          routes &&
          !routes.find(
            (route) =>
              route.originId === connection.sourceHandle &&
              route.destinationId === connection.target
          )
        ) {
          logger.info(
            `Route possible from input: ${connection.sourceHandle} to passage: ${connection.target}`
          )
          return true
        } else {
          logger.info('Duplicate route not possible.')
          return false
        }
      }}
    />
  )
}

const EventNode: React.FC<NodeProps<{
  studioId: StudioId
  sceneId: ElementId
  passageId: ElementId
  selectedChoice: ElementId | null
  onEditPassage: (passageId: ElementId) => void
  onChoiceSelect: (passageId: ElementId, choiceId: ElementId | null) => void
  type: ELEMENT_TYPE
}>> = ({ data }) => {
  const event = useEvent(data.studioId, data.passageId),
    choicesByEventRef = useChoicesByEventRef(data.studioId, data.passageId)

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

  const { editor, editorDispatch } = useContext(EditorContext)

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
        const foundRoutes = await api().routes.getPassthroughRoutesByPassageRef(
          data.studioId,
          data.passageId
        )

        await Promise.all([
          foundRoutes.map(async (foundRoute) => {
            foundRoute?.id &&
              (await api().routes.removeRoute(data.studioId, foundRoute.id))
          })
        ])
      }

      updateNodeInternals(data.passageId)
    }

    removePassthroughNode()
  }, [choices])

  useEffect(() => {
    logger.info(
      `EventNode->editor.selectedComponentEditorSceneViewChoice->useEffect->${editor.selectedComponentEditorSceneViewChoice}`
    )
  }, [editor.selectedComponentEditorSceneViewChoice])

  useEffect(() => {
    logger.info(`EventNode->useEffect->selectedChoice: ${data.selectedChoice}`)
  }, [data.selectedChoice])

  return (
    <div className={styles.EventNode} key={data.passageId} id={data.passageId}>
      {event?.id && (
        <>
          <div>
            <PassageTargetHandle
              studioId={data.studioId}
              sceneId={data.sceneId}
              passageId={event.id}
            />

            <div
              style={{
                overflow: 'hidden',
                borderBottomLeftRadius:
                  (editor.selectedComponentEditorSceneViewEvent === event.id &&
                    editor.selectedWorldOutlineElement.id === event.sceneId) ||
                  event.choices.length > 0 ||
                  event.type === EVENT_TYPE.INPUT
                    ? '0px'
                    : '5px',
                borderBottomRightRadius:
                  (editor.selectedComponentEditorSceneViewEvent === event.id &&
                    editor.selectedWorldOutlineElement.id === event.sceneId) ||
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
                onDoubleClick={() => event.id && data.onEditPassage(event.id)}
              >
                {/* #395 */}
                {event.ending ? (
                  <VerticalLeftOutlined
                    className={`${styles.headerIcon} ${styles.warning}`}
                  />
                ) : (
                  <AlignLeftOutlined className={styles.headerIcon} />
                )}

                {event.title}
              </h1>

              <EventPersonaPane
                studioId={data.studioId}
                worldId={event.worldId}
                persona={event.persona}
              />
            </div>

            {choices.length === 0 && event.type !== EVENT_TYPE.INPUT && (
              <PassageSoureHandle
                studioId={data.studioId}
                sceneId={data.sceneId}
                passageId={event.id}
              />
            )}
          </div>

          {event.type === EVENT_TYPE.CHOICE && (
            <>
              <div
                className={`${styles.choices} ${
                  editor.selectedComponentEditorSceneViewEvent === event.id &&
                  event.sceneId === editor.selectedWorldOutlineElement.id
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
                          onSelect={(passageId, choiceId) => {
                            logger.info(
                              `EventNode->onClick: choice: ${choiceId}`
                            )

                            editor.selectedComponentEditorSceneViewEvent !==
                              passageId &&
                              setSelectedElement([
                                cloneDeep(
                                  events.find(
                                    (passageNode) =>
                                      passageNode.id === passageId
                                  )
                                )
                              ]) &&
                              editorDispatch({
                                type:
                                  EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_EVENT,
                                selectedElementEditorSceneViewEvent: passageId
                              })

                            editor.selectedComponentEditorSceneViewEvent ===
                              passageId &&
                              data.onChoiceSelect(passageId, choiceId)
                          }}
                          onReorder={async (
                            passageId,
                            choiceId,
                            newPosition
                          ) => {
                            logger.info(
                              `ChoiceRow->onReorder->passageId: ${passageId} choiceId: ${choiceId} newPosition: ${newPosition}`
                            )

                            const clonedChoiceRefs = cloneDeep(
                                event.choices || []
                              ),
                              foundChoiceRefIndex = clonedChoiceRefs.findIndex(
                                (choiceRef) => choiceRef == choiceId
                              )

                            clonedChoiceRefs.splice(foundChoiceRefIndex, 1)
                            clonedChoiceRefs.splice(newPosition, 0, choiceId)

                            await api().events.saveChoiceRefsToPassage(
                              data.studioId,
                              data.passageId,
                              clonedChoiceRefs
                            )
                          }}
                          onDelete={async (choiceId, outgoingRoutes) => {
                            editor.selectedComponentEditorSceneViewChoice ===
                              choice.id &&
                              editorDispatch({
                                type:
                                  EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
                                selectedComponentEditorSceneViewChoice: null
                              })

                            const clonedChoices = cloneDeep(choices),
                              foundChoiceIndex = clonedChoices.findIndex(
                                (clonedChoice) => clonedChoice.id === choiceId
                              )

                            if (foundChoiceIndex !== -1) {
                              try {
                                await Promise.all(
                                  outgoingRoutes.map(async (outgoingRoute) => {
                                    if (!outgoingRoute.id)
                                      throw new Error(
                                        'Unable to remove route. Missing ID'
                                      )

                                    await api().routes.removeRoute(
                                      data.studioId,
                                      outgoingRoute.id
                                    )
                                  })
                                )

                                await api().choices.removeChoice(
                                  data.studioId,
                                  clonedChoices[foundChoiceIndex].id
                                )

                                clonedChoices.splice(foundChoiceIndex, 1)

                                await api().events.saveChoiceRefsToPassage(
                                  data.studioId,
                                  data.passageId,
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

              {editor.selectedComponentEditorSceneViewEvent === event.id &&
                event.sceneId === editor.selectedWorldOutlineElement.id && (
                  <div
                    className={`${styles.addChoiceButton} nodrag`}
                    onClick={async () => {
                      logger.info('EventNode->addChoiceButton->onClick')

                      if (
                        editor.selectedComponentEditorSceneViewEvent ===
                          event.id &&
                        event.choices
                      ) {
                        const choiceId = uuid()

                        try {
                          await api().events.saveChoiceRefsToPassage(
                            data.studioId,
                            data.passageId,
                            [...event.choices, choiceId]
                          )

                          await api().choices.saveChoice(data.studioId, {
                            id: choiceId,
                            worldId: event.worldId,
                            passageId: data.passageId,
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
                          editorDispatch({
                            type:
                              EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
                            selectedComponentEditorSceneViewJump: null
                          }) &&
                          editorDispatch({
                            type:
                              EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_EVENT,
                            selectedElementEditorSceneViewEvent: event.id
                          }) &&
                          editorDispatch({
                            type:
                              EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
                            selectedComponentEditorSceneViewChoice: null
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
                  <InputSoureHandle
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
