import React, { useCallback } from 'react'

import { ElementId, WorldId, StudioId } from '../../data/types'

import { useInput, useVariables } from '../../hooks'

import { Select } from 'antd'

import styles from './styles.module.less'

import api from '../../api'

const VariableSelectForInput: React.FC<{
  studioId: StudioId
  worldId: WorldId
  inputId: ElementId
}> = ({ studioId, worldId, inputId }) => {
  const input = useInput(studioId, inputId, [studioId, inputId]),
    variables = useVariables(studioId, worldId, [studioId, worldId])

  const changeInput = useCallback(
    async (variableId: ElementId) => {
      if (input?.id)
        await api().inputs.saveVariableRefToInput(
          studioId,
          input.id,
          variableId
        )
    },
    [studioId, input?.id]
  )

  return (
    <div className={styles.VariableSelectForInput}>
      {variables && variables.length > 0 && (
        <>
          <Select
            className={`${styles.select} ${styles.inputVariable}`}
            style={{
              borderBottom: !input?.variableId
                ? '1px solid hsl(0, 0%, 15%)'
                : 'none'
            }}
            value={input?.variableId}
            placeholder={'Select Input Variable'}
            onChange={changeInput}
          >
            {variables.map(
              (variable) =>
                variable.id && (
                  <Select.Option value={variable.id} key={variable.id}>
                    {variable.title}
                  </Select.Option>
                )
            )}
          </Select>

          {!input?.variableId && (
            <div className="warningMessage">
              Variable selection is required for event input.
            </div>
          )}
        </>
      )}

      {variables && variables.length === 0 && (
        <div className="warningMessage">
          At least 1 world variable is required for event input.
        </div>
      )}
    </div>
  )
}

export default VariableSelectForInput
