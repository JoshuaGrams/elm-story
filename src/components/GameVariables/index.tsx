import logger from '../../lib/logger'

import React, { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash-es'

import { ComponentId, GameId, StudioId, VARIABLE_TYPE } from '../../data/types'

import { useVariable, useVariables } from '../../hooks'

import { Form, Input, InputNumber, Select } from 'antd'

import styles from './styles.module.less'

import api from '../../api'

import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} from 'unique-names-generator'

const { Option } = Select

const VariableRow: React.FC<{
  studioId: StudioId
  variableId: ComponentId
}> = ({ studioId, variableId }) => {
  const variable = useVariable(studioId, variableId, [studioId, variableId]),
    [editDefaultValueForm] = Form.useForm()

  const defaultValueInputRef = useRef<Input | null>(null)

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

  async function onDefaultValueChangeFromInput(changedValues: {
    defaultValue: string
  }) {
    logger.info(
      `VariableRow->onDefaultValueChangeFromInput->${changedValues.defaultValue}`
    )

    if (variable?.id && changedValues.defaultValue !== variableDefaultValue) {
      variableType === VARIABLE_TYPE.STRING &&
        (await api().variables.saveVariableDefaultValue(
          studioId,
          variable.id,
          changedValues.defaultValue
        ))

      if (variableType === VARIABLE_TYPE.NUMBER) {
        if (
          typeof changedValues.defaultValue === 'number' ||
          changedValues.defaultValue === ''
        ) {
          await api().variables.saveVariableDefaultValue(
            studioId,
            variable.id,
            changedValues.defaultValue
          )
        } else {
          editDefaultValueForm.resetFields()
          defaultValueInputRef.current?.focus()
        }
      }
    }
  }

  useEffect(() => {
    logger.info(`VariableRow->variable.defaultValue->${variable?.defaultValue}`)

    variable?.defaultValue && setVariableDefaultValue(variable.defaultValue)
  }, [variable?.defaultValue])

  useEffect(() => {
    logger.info(`VariableRow->variable.type->useEffect->${variable?.type}`)

    variable?.type && setVariableType(variable.type)

    editDefaultValueForm.resetFields()
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
            <Form
              form={editDefaultValueForm}
              initialValues={{ defaultValue: variable.defaultValue }}
              onValuesChange={debounce(onDefaultValueChangeFromInput, 100)}
              onFinish={() => defaultValueInputRef.current?.blur()}
            >
              {variable.type === VARIABLE_TYPE.STRING && (
                <Form.Item name="defaultValue">
                  <Input placeholder="Undefined" ref={defaultValueInputRef} />
                </Form.Item>
              )}

              {variable.type === VARIABLE_TYPE.NUMBER && (
                <Form.Item name="defaultValue">
                  <InputNumber
                    placeholder="Undefined"
                    ref={defaultValueInputRef}
                  />
                </Form.Item>
              )}
            </Form>
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
    const uniqueNames = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      length: 3
    })

    await api().variables.saveVariable(studioId, {
      gameId,
      title: uniqueNames
        .split('_')
        .map((uniqueName, index) => {
          return index === 0
            ? uniqueName
            : `${uniqueName.charAt(0).toUpperCase()}${uniqueName.substr(
                1,
                uniqueName.length - 1
              )}`
        })
        .join(''),
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
