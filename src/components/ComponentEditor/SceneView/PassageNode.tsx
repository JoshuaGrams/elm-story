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
  ComponentId,
  COMPONENT_TYPE,
  GameId,
  PASSAGE_TYPE,
  Route,
  StudioId
} from '../../../data/types'

import {
  useChoice,
  useChoicesByPassageRef,
  usePassage,
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

interface MenuInfo {
  domEvent: React.MouseEvent<HTMLElement>
}

const ChoiceSourceHandle: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
  choiceId: ComponentId
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
  sceneId: ComponentId
  choiceId: ComponentId
  title: string
  order: [number, number] // [position, total]
  showDivider: boolean
  handle: JSX.Element
  selected: boolean
  onSelect: (passageId: ComponentId, choiceId: ComponentId) => void
  onReorder: (
    passageId: ComponentId,
    choiceId: ComponentId,
    newPosition: number
  ) => void
  onDelete: (choiceId: ComponentId, outgoingRoutes: Route[]) => void
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
        sceneId !== editor.selectedGameOutlineComponent.id && !showDivider
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
                if (title === newTitle) {
                  setRenamingChoice(false)
                } else {
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
  sceneId: ComponentId
  inputId: ComponentId
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
  gameId: GameId
  inputId: ComponentId
  handle: JSX.Element
}> = ({ studioId, gameId, inputId, handle }) => {
  return (
    <>
      <VariableSelectForInput
        studioId={studioId}
        gameId={gameId}
        inputId={inputId}
      />{' '}
      {handle}
    </>
  )
}

const PassageTargetHandle: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
  passageId: ComponentId
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
  sceneId: ComponentId
  passageId: ComponentId
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

const PassageNode: React.FC<NodeProps<{
  studioId: StudioId
  sceneId: ComponentId
  passageId: ComponentId
  selectedChoice: ComponentId | null
  onEditPassage: (passageId: ComponentId) => void
  onChoiceSelect: (passageId: ComponentId, choiceId: ComponentId | null) => void
  type: COMPONENT_TYPE
}>> = ({ data }) => {
  const passage = usePassage(data.studioId, data.passageId),
    choicesByPassageRef = useChoicesByPassageRef(data.studioId, data.passageId)

  const updateNodeInternals = useUpdateNodeInternals()

  const passages = useStoreState((state) =>
      state.nodes.filter(
        (node: Node<{ type: COMPONENT_TYPE }>) =>
          node?.data?.type === COMPONENT_TYPE.PASSAGE
      )
    ),
    setSelectedElement = useStoreActions(
      (actions) => actions.setSelectedElements
    )

  const { editor, editorDispatch } = useContext(EditorContext)

  const [choices, setChoices] = useState<
    { id: ComponentId; title: string; handle: JSX.Element }[]
  >([])

  useEffect(() => {
    logger.info(`PassageNode->choicesByPassageRef->useEffect`)

    if (choicesByPassageRef) {
      setChoices(
        // @ts-ignore
        choicesByPassageRef
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
  }, [choicesByPassageRef, passage?.choices])

  useEffect(() => {
    async function removePassthroughNode() {
      if (passage?.id && choices.length > 0) {
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
      `PassageNode->editor.selectedComponentEditorSceneViewChoice->useEffect->${editor.selectedComponentEditorSceneViewChoice}`
    )
  }, [editor.selectedComponentEditorSceneViewChoice])

  useEffect(() => {
    logger.info(
      `PassageNode->useEffect->selectedChoice: ${data.selectedChoice}`
    )
  }, [data.selectedChoice])

  return (
    <div
      className={styles.PassageNode}
      key={data.passageId}
      id={data.passageId}
    >
      {passage?.id && (
        <>
          <div>
            <PassageTargetHandle
              studioId={data.studioId}
              sceneId={data.sceneId}
              passageId={passage.id}
            />

            <h1
              // TODO: make class list work in ContextMenu
              className="nodePassageHeader"
              style={{
                borderBottomLeftRadius:
                  (editor.selectedComponentEditorSceneViewPassage ===
                    passage.id &&
                    editor.selectedGameOutlineComponent.id ===
                      passage.sceneId) ||
                  passage.choices.length > 0 ||
                  passage.type === PASSAGE_TYPE.INPUT
                    ? '0px'
                    : '5px',
                borderBottomRightRadius:
                  (editor.selectedComponentEditorSceneViewPassage ===
                    passage.id &&
                    editor.selectedGameOutlineComponent.id ===
                      passage.sceneId) ||
                  passage.choices.length > 0 ||
                  passage.type === PASSAGE_TYPE.INPUT
                    ? '0px'
                    : '5px'
              }}
              data-component-id={passage.id}
              onDoubleClick={() => passage.id && data.onEditPassage(passage.id)}
            >
              {/* #395 */}
              {passage.gameOver ? (
                <VerticalLeftOutlined
                  className={`${styles.headerIcon} ${styles.warning}`}
                />
              ) : (
                <AlignLeftOutlined className={styles.headerIcon} />
              )}
              {passage.title}
            </h1>

            {choices.length === 0 && passage.type !== PASSAGE_TYPE.INPUT && (
              <PassageSoureHandle
                studioId={data.studioId}
                sceneId={data.sceneId}
                passageId={passage.id}
              />
            )}
          </div>

          {passage.type === PASSAGE_TYPE.CHOICE && (
            <>
              <div
                className={`${styles.choices} ${
                  editor.selectedComponentEditorSceneViewPassage ===
                    passage.id &&
                  passage.sceneId === editor.selectedGameOutlineComponent.id
                    ? ''
                    : styles.bottomRadius
                }`}
              >
                {choices
                  .sort(
                    (a, b) =>
                      passage.choices.findIndex(
                        (choiceId) => a.id === choiceId
                      ) -
                      passage.choices.findIndex((choiceId) => b.id === choiceId)
                  )
                  .map(
                    (choice, index) =>
                      choice.id && (
                        <ChoiceRow
                          key={choice.id}
                          studioId={data.studioId}
                          sceneId={passage.sceneId}
                          choiceId={choice.id}
                          title={choice.title}
                          order={[index, choices.length]}
                          showDivider={choices.length - 1 !== index}
                          handle={choice.handle}
                          selected={data.selectedChoice === choice.id}
                          onSelect={(passageId, choiceId) => {
                            logger.info(
                              `PassageNode->onClick: choice: ${choiceId}`
                            )

                            editor.selectedComponentEditorSceneViewPassage !==
                              passageId &&
                              setSelectedElement([
                                cloneDeep(
                                  passages.find(
                                    (passageNode) =>
                                      passageNode.id === passageId
                                  )
                                )
                              ]) &&
                              editorDispatch({
                                type:
                                  EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                                selectedComponentEditorSceneViewPassage: passageId
                              })

                            editor.selectedComponentEditorSceneViewPassage ===
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
                                passage.choices || []
                              ),
                              foundChoiceRefIndex = clonedChoiceRefs.findIndex(
                                (choiceRef) => choiceRef == choiceId
                              )

                            clonedChoiceRefs.splice(foundChoiceRefIndex, 1)
                            clonedChoiceRefs.splice(newPosition, 0, choiceId)

                            await api().passages.saveChoiceRefsToPassage(
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

                                await api().passages.saveChoiceRefsToPassage(
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

              {editor.selectedComponentEditorSceneViewPassage === passage.id &&
                passage.sceneId === editor.selectedGameOutlineComponent.id && (
                  <div
                    className={`${styles.addChoiceButton} nodrag`}
                    onClick={async () => {
                      logger.info('PassageNode->addChoiceButton->onClick')

                      if (
                        editor.selectedComponentEditorSceneViewPassage ===
                          passage.id &&
                        passage.choices
                      ) {
                        const choiceId = uuid()

                        try {
                          await api().passages.saveChoiceRefsToPassage(
                            data.studioId,
                            data.passageId,
                            [...passage.choices, choiceId]
                          )

                          await api().choices.saveChoice(data.studioId, {
                            id: choiceId,
                            gameId: passage.gameId,
                            passageId: data.passageId,
                            title: 'Untitled Choice',
                            tags: []
                          })

                          data.onChoiceSelect(passage.id, choiceId)
                        } catch (error) {
                          if (error instanceof Error)
                            throw new Error(error.message)
                        }
                      } else {
                        passage.id &&
                          setSelectedElement([
                            cloneDeep(
                              passages.find(
                                (passageNode) => passageNode.id === passage.id
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
                              EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                            selectedComponentEditorSceneViewPassage: passage.id
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

          {passage.type === PASSAGE_TYPE.INPUT && passage.input && (
            <div className={`${styles.input} ${styles.bottomRadius}`}>
              <InputRow
                studioId={data.studioId}
                gameId={passage.gameId}
                inputId={passage.input}
                handle={
                  <InputSoureHandle
                    studioId={data.studioId}
                    sceneId={data.sceneId}
                    inputId={passage.input}
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

export default memo(PassageNode)
