import React, { memo, useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'

import { Choice, ComponentId, StudioId } from '../../../data/types'

import { useChoicesByPassageRef, usePassage } from '../../../hooks'

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
  console.log('handle onConnect', params)

const PassageNode: React.FC<NodeProps<{
  studioId: StudioId
  passageId: ComponentId
}>> = ({ data }) => {
  const passage = usePassage(data.studioId, data.passageId),
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
                id={`handle-${choice.id}`}
              />
            )
          }))
      )
    }
  }, [choicesByPassageRef])

  return (
    <div className={styles.passageNode} key={passage?.id}>
      {passage ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            onConnect={onConnect}
          />
          <div>{passage.title}</div>

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

          {choices.map((choice, index) => {
            return (
              <>
                <div>
                  {choice.title}
                  <Button
                    onClick={async () => {
                      try {
                        const clonedChoices = cloneDeep(choices)

                        await api().choices.removeChoice(
                          data.studioId,
                          clonedChoices[index].id
                        )

                        clonedChoices.splice(index, 1)

                        await api().passages.saveChoiceRefsToPassage(
                          data.studioId,
                          data.passageId,
                          clonedChoices.map((clonedChoice) => clonedChoice.id)
                        )
                      } catch (error) {
                        throw new Error(error)
                      }
                    }}
                  >
                    <DeleteOutlined />
                  </Button>
                </div>

                {choice.handle}
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
