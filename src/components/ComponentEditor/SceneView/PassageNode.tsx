import logger from '../../../lib/logger'

import React, { memo, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import { v4 as uuid } from 'uuid'

import { Choice, ComponentId, Route, StudioId } from '../../../data/types'

import {
  useChoicesByPassageRef,
  usePassage,
  useRoutesByPassageRef,
  useRoutesByChoiceRef
} from '../../../hooks'

import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  colors
} from 'unique-names-generator'

import {
  Handle,
  Position,
  NodeProps,
  Connection,
  Edge
} from 'react-flow-renderer'

import { Button, Divider, Dropdown, Menu } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../../api'

const onConnect = (params: Connection | Edge) =>
  logger.info('handle onConnect', params)

const ChoiceRow: React.FC<{
  studioId: StudioId
  choiceId: ComponentId
  title: string
  showDivider: boolean
  handle: JSX.Element
  onDelete: (choiceId: ComponentId, outgoingRoutes: Route[]) => void
}> = ({ studioId, choiceId, title, showDivider = true, handle, onDelete }) => {
  const outgoingRoutes = useRoutesByChoiceRef(studioId, choiceId)

  return (
    <div
      className={`${styles.choiceRow} nodrag`}
      style={{
        borderBottom: showDivider ? '1px solid hsl(0, 0%, 0%)' : 'none'
      }}
    >
      <Dropdown
        trigger={['contextMenu']}
        overlay={
          <Menu>
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
          <div>{title}</div>
        </div>
      </Dropdown>
      {handle}
    </div>
  )
}

const PassageNode: React.FC<NodeProps<{
  studioId: StudioId
  passageId: ComponentId
}>> = ({ data }) => {
  const passage = usePassage(data.studioId, data.passageId),
    incomingRoutes = useRoutesByPassageRef(data.studioId, data.passageId),
    choicesByPassageRef = useChoicesByPassageRef(data.studioId, data.passageId)

  const [choices, setChoices] = useState<
    { id: ComponentId; title: string; handle: JSX.Element }[]
  >([])

  useEffect(() => {
    if (choicesByPassageRef) {
      setChoices(
        // @ts-ignore
        choicesByPassageRef
          .filter(
            (choice): choice is Choice => choice && choice.id !== undefined
          )
          .map((choice) => ({
            id: choice.id,
            title: choice.title,
            handle: (
              <Handle
                key={choice.id}
                type="source"
                className={styles.choiceHandle}
                style={{ top: '50%', bottom: '50%' }}
                position={Position.Right}
                id={choice.id}
                isValidConnection={(connection: Connection) => {
                  logger.info('isValidConnection')
                  console.log(connection)
                  console.log(incomingRoutes)
                  return true
                }}
              />
            )
          }))
      )
    }
  }, [choicesByPassageRef])

  useEffect(() => {
    logger.info('useEffect: incomingRoutes')
    console.log(incomingRoutes)
  }, [incomingRoutes])

  return (
    <div className={styles.passageNode} key={passage?.id}>
      {passage ? (
        <>
          <div>
            <Handle
              type="target"
              id={passage.id}
              style={{ top: '50%', bottom: '50%' }}
              position={Position.Left}
              onConnect={onConnect}
            />
            <h1>{passage.title}</h1>
          </div>

          <div className={styles.choices}>
            {choices
              .sort(
                (a, b) =>
                  passage.choices.findIndex((choiceId) => a.id === choiceId) -
                  passage.choices.findIndex((choiceId) => b.id === choiceId)
              )
              .map((choice, index) => {
                return (
                  <>
                    {choice.id && (
                      <ChoiceRow
                        key={choice.id}
                        studioId={data.studioId}
                        choiceId={choice.id}
                        title={choice.title}
                        showDivider={choices.length - 1 !== index}
                        handle={choice.handle}
                        onDelete={async (choiceId, outgoingRoutes) => {
                          try {
                            const clonedChoices = cloneDeep(choices),
                              foundChoiceIndex = clonedChoices.findIndex(
                                (clonedChoice) => clonedChoice.id === choiceId
                              )

                            if (foundChoiceIndex !== -1) {
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
                            }
                          } catch (error) {
                            throw new Error(error)
                          }
                        }}
                      />
                    )}
                  </>
                )
              })}
          </div>

          <Button
            className={`${styles.addChoiceButton} nodrag`}
            size="small"
            type="text"
            onClick={async () => {
              try {
                const choiceId = uuid()

                await api().passages.saveChoiceRefsToPassage(
                  data.studioId,
                  data.passageId,
                  [...passage.choices, choiceId]
                )

                await api().choices.saveChoice(data.studioId, {
                  id: choiceId,
                  gameId: passage.gameId,
                  passageId: data.passageId,
                  title: uniqueNamesGenerator({
                    dictionaries: [adjectives, animals, colors],
                    separator: ' ',
                    length: 2
                  }),
                  goto: [],
                  conditions: [],
                  tags: []
                })
              } catch (error) {
                throw new Error(error)
              }
            }}
          >
            <PlusOutlined />
          </Button>
        </>
      ) : (
        <div>...</div>
      )}
    </div>
  )
}

export default memo(PassageNode)
