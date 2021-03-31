import logger from '../../../lib/logger'

import React, { memo, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'

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

import { Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../../api'

const onConnect = (params: Connection | Edge) =>
  logger.info('handle onConnect', params)

const ChoiceRow: React.FC<{
  studioId: StudioId
  choiceId: ComponentId
  title: string
  handle: JSX.Element
  onDelete: (choiceId: ComponentId, outgoingRoutes: Route[]) => void
}> = ({ studioId, choiceId, title, handle, onDelete }) => {
  const outgoingRoutes = useRoutesByChoiceRef(studioId, choiceId)

  return (
    <>
      <div>
        <div>{title}</div>
        <div style={{ fontSize: 10 }}>{choiceId}</div>
        <Button
          onClick={() => {
            onDelete(choiceId, outgoingRoutes || [])
          }}
        >
          <DeleteOutlined />
        </Button>
      </div>
      {handle}
    </>
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
                style={{ top: 'auto', bottom: 'auto' }}
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
          <Handle
            type="target"
            id={passage.id}
            position={Position.Left}
            onConnect={onConnect}
          />
          <div>{passage.title}</div>
          <div style={{ fontSize: 10 }}>{passage.id}</div>

          <Button
            onClick={async () => {
              try {
                const choice = await api().choices.saveChoice(data.studioId, {
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

                if (choice.id) {
                  await api().passages.saveChoiceRefsToPassage(
                    data.studioId,
                    data.passageId,
                    [...passage.choices, choice.id]
                  )
                }
              } catch (error) {
                throw new Error(error)
              }
            }}
          >
            Add Choice
          </Button>

          {choices.map((choice) => {
            return (
              <>
                {choice.id && (
                  <ChoiceRow
                    key={choice.id}
                    studioId={data.studioId}
                    choiceId={choice.id}
                    title={choice.title}
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
                            clonedChoices.map((clonedChoice) => clonedChoice.id)
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
        </>
      ) : (
        <div>...</div>
      )}
    </div>
  )
}

export default memo(PassageNode)
