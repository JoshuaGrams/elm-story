import { Button } from 'antd'
import React, { memo, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

import {
  Handle,
  Position,
  NodeProps,
  Connection,
  Edge
} from 'react-flow-renderer'
import { ComponentId, StudioId } from '../../../data/types'

import { usePassage } from '../../../hooks'

import styles from './styles.module.less'
import { DeleteOutlined } from '@ant-design/icons'
import { cloneDeep } from 'lodash'

const onConnect = (params: Connection | Edge) =>
  console.log('handle onConnect', params)

const PassageNode: React.FC<NodeProps<{
  studioId: StudioId
  passageId: ComponentId
}>> = ({ data }) => {
  const passage = usePassage(data.studioId, data.passageId)

  const [choices, setChoices] = useState<
    { id: ComponentId; handle: JSX.Element }[]
  >([])

  useEffect(() => {
    console.log(choices)
  }, [choices])

  return (
    <div className={styles.passageNode}>
      {passage ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            onConnect={onConnect}
          />
          <div>{passage.title}</div>

          <Button
            onClick={() => {
              const choiceId = uuid()
              setChoices([
                ...choices,
                {
                  id: choiceId,
                  handle: (
                    <Handle
                      key={choiceId}
                      type="source"
                      style={{ top: 'auto', bottom: 'auto' }}
                      position={Position.Right}
                      id={`handle-${choiceId}`}
                    />
                  )
                }
              ])
            }}
          >
            Add Choice
          </Button>

          {choices.map((choice, index) => {
            return (
              <>
                <div>
                  Choice {index}{' '}
                  <Button
                    onClick={() => {
                      console.log(index)
                      const clonedChoices = cloneDeep(choices)

                      clonedChoices.splice(index, 1)

                      setChoices(clonedChoices)
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
