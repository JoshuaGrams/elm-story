import logger from '../../lib/logger'

import React, { useEffect, useState } from 'react'
import { debounce } from 'lodash-es'

import { ComponentId, GameId, StudioId, VARIABLE_TYPE } from '../../data/types'

import { useVariable, useVariables } from '../../hooks'

import { Input, Select } from 'antd'

import styles from './styles.module.less'

import api from '../../api'

const { Option } = Select

const VariableRow: React.FC<{
  studioId: StudioId
  variableId: ComponentId
}> = ({ studioId, variableId }) => {
  const variable = useVariable(studioId, variableId, [studioId, variableId])

  const [variableType, setVariableType] = useState<VARIABLE_TYPE | undefined>(
      variable?.type
    ),
    [variableDefaultValue, setVariableDefaultValue] = useState<
      string | undefined
    >(variable?.defaultValue)

  async function onVariableTypeChange(selectedVariableType: VARIABLE_TYPE) {
    logger.info(`VariableRow->onVariableTypeChange->${selectedVariableType}`)

    variable?.id &&
      selectedVariableType !== variableType &&
      (await api().variables.saveVariableType(
        studioId,
        variable.id,
        selectedVariableType
      ))
  }

  async function onDefaultValueChangeFromSelect(
    newVariableDefaultValue: string
  ) {
    logger.info(
      `VariableRow->onDefaultValueChangeFromSelect->${newVariableDefaultValue}`
    )

    variable?.id &&
      newVariableDefaultValue !== variableDefaultValue &&
      (await api().variables.saveVariableDefaultValue(
        studioId,
        variable.id,
        newVariableDefaultValue
      ))
  }

  async function onDefaultValueChangeFromInput(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    logger.info(
      `VariableRow->onDefaultValueChangeFromInput->${event.target.value}`
    )

    variable?.id &&
      event.target.value !== variableDefaultValue &&
      (await api().variables.saveVariableDefaultValue(
        studioId,
        variable.id,
        event.target.value
      ))
  }

  useEffect(() => {
    logger.info(`VariableRow->variable.defaultValue->${variable?.defaultValue}`)

    variable?.defaultValue && setVariableDefaultValue(variable.defaultValue)
  }, [variable?.defaultValue])

  useEffect(() => {
    logger.info(`VariableRow->variable.type->useEffect->${variable?.type}`)

    variable?.type && setVariableType(variable.type)
  }, [variable?.type])

  return (
    <>
      {variable && (
        <>
          <div>{variable.title}</div>
          <div>{variable.id}</div>

          <Select value={variableType} onChange={onVariableTypeChange}>
            <Option value={VARIABLE_TYPE.BOOLEAN}>Boolean</Option>
            <Option value={VARIABLE_TYPE.STRING}>String</Option>
            <Option value={VARIABLE_TYPE.NUMBER}>Number</Option>
          </Select>

          {variable.type === VARIABLE_TYPE.BOOLEAN && (
            <Select
              value={variableDefaultValue}
              onChange={onDefaultValueChangeFromSelect}
            >
              <Option value={'true'}>True</Option>
              <Option value={'false'}>False</Option>
            </Select>
          )}

          {(variable.type === VARIABLE_TYPE.STRING ||
            variable.type === VARIABLE_TYPE.NUMBER) && (
            <Input
              onChange={debounce(onDefaultValueChangeFromInput, 500)}
              placeholder="Undefined"
            />
          )}
        </>
      )}
    </>
  )
}

const GameVariables: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  const variables = useVariables(studioId, gameId, [studioId, gameId])

  async function onAddVariable() {
    await api().variables.saveVariable(studioId, {
      gameId,
      title: 'Untitled Variable',
      type: VARIABLE_TYPE.BOOLEAN,
      defaultValue: 'false',
      tags: []
    })
  }

  return (
    <div className={styles.GameVariables}>
      {variables &&
        variables.map(
          (variable) =>
            variable.id && (
              <VariableRow
                key={variable.id}
                studioId={studioId}
                variableId={variable.id}
              />
            )
        )}

      <div className={styles.addVariableButton} onClick={onAddVariable}>
        Add Variable
      </div>
    </div>
  )
}

export default GameVariables
