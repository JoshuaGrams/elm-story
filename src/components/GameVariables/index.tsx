import logger from '../../lib/logger'

import React, { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash-es'

import { ComponentId, GameId, StudioId, VARIABLE_TYPE } from '../../data/types'

import { useVariable, useVariables } from '../../hooks'

import { Col, Form, Input, InputNumber, Row, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'

const { Option } = Select

export const VariableRow: React.FC<{
  studioId: StudioId
  variableId: ComponentId
  allowRename?: boolean
  allowTypeChange?: boolean
  value?: string
  onChangeValue?: (newValue: string) => void
  onDelete?: (variableId: ComponentId) => void
}> = ({
  studioId,
  variableId,
  allowRename = true,
  allowTypeChange = true,
  value,
  onChangeValue,
  onDelete
}) => {
  const variable = useVariable(studioId, variableId, [studioId, variableId]),
    [editVariableTitleForm] = Form.useForm(),
    [editVariableDefaultValueForm] = Form.useForm()

  const variableTitleInputRef = useRef<Input | null>(null),
    variableDefaultValueInputRef = useRef<Input | null>(null)

  const [variableTitle, setVariableTitle] = useState<string | undefined>(
      variable?.type
    ),
    [variableType, setVariableType] = useState<VARIABLE_TYPE | undefined>(
      variable?.type
    ),
    [variableDefaultValue, setVariableDefaultValue] = useState<
      string | undefined
    >(variable?.defaultValue)

  async function onVariableTitleChange(values: { title: string }) {
    logger.info(`VariableRow->onVariableTitleChange->${values.title}`)

    values.title.length === 0 && editVariableTitleForm.resetFields()

    variable?.id &&
      values.title.length > 0 &&
      values.title !== variableTitle &&
      (await api().variables.saveVariableTitle(
        studioId,
        variable.id,
        // remove all numbers and special characters
        values.title.replace(/\d+/g, '').replace(/[\W_]/g, '')
      ))
  }

  async function onVariableTypeChange(selectedVariableType: VARIABLE_TYPE) {
    logger.info(`VariableRow->onVariableTypeChange->${selectedVariableType}`)

    if (variable?.id && selectedVariableType !== variableType) {
      const relatedEffects = await api().effects.getEffectsByVariableRef(
        studioId,
        variable.id
      )

      await Promise.all(
        relatedEffects.map(
          async (relatedEffect) =>
            relatedEffect.id &&
            (await api().effects.saveEffectValue(
              studioId,
              relatedEffect.id,
              // TODO: Use better method that doesn't dupe DB code
              selectedVariableType === VARIABLE_TYPE.BOOLEAN ? 'false' : ''
            ))
        )
      )

      await api().variables.saveVariableType(
        studioId,
        variable.id,
        selectedVariableType
      )
    }
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

  async function onVariableDefaultValueChangeFromInput(changedValues: {
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
          changedValues.defaultValue === '' ||
          !changedValues.defaultValue
        ) {
          await api().variables.saveVariableDefaultValue(
            studioId,
            variable.id,
            changedValues.defaultValue
          )
        } else {
          editVariableDefaultValueForm.resetFields()
          variableDefaultValueInputRef.current?.focus()
        }
      }
    }
  }

  async function onRemoveVariable() {
    variable?.id &&
      (await api().variables.removeVariable(studioId, variable.id))
  }

  useEffect(() => {
    logger.info(`VariableRow->variable.title->${variable?.title}`)

    variable?.title && setVariableTitle(variable.title)

    editVariableTitleForm.resetFields()
  }, [variable?.title])

  useEffect(() => {
    logger.info(`VariableRow->variable.type->useEffect->${variable?.type}`)

    variable?.type && setVariableType(variable.type)

    editVariableDefaultValueForm.resetFields()
  }, [variable?.type])

  useEffect(() => {
    logger.info(`VariableRow->variable.defaultValue->${variable?.defaultValue}`)

    variable?.defaultValue && setVariableDefaultValue(variable.defaultValue)
  }, [variable?.defaultValue])

  return (
    <>
      {variable && (
        <>
          <Row className={styles.variableRow}>
            <Col className={styles.titleCol}>
              {allowRename && (
                <Form
                  form={editVariableTitleForm}
                  initialValues={{ title: variable.title }}
                  onFinish={onVariableTitleChange}
                  onBlur={() => {
                    variableTitleInputRef.current?.blur()
                    editVariableTitleForm.resetFields()
                  }}
                >
                  <Form.Item name="title">
                    <Input ref={variableTitleInputRef} spellCheck={false} />
                  </Form.Item>
                </Form>
              )}

              {!allowRename && (
                <span className={styles.variableTitle}>{variableTitle}</span>
              )}
            </Col>

            {allowTypeChange && (
              <Col className={styles.typeCol}>
                <Select value={variableType} onChange={onVariableTypeChange}>
                  <Option value={VARIABLE_TYPE.BOOLEAN}>Boolean</Option>
                  <Option value={VARIABLE_TYPE.STRING}>String</Option>
                  <Option value={VARIABLE_TYPE.NUMBER}>Number</Option>
                </Select>
              </Col>
            )}

            <Col
              className={styles.defaultValueCol}
              style={{ width: !allowTypeChange ? '60%' : '' }}
            >
              {variable.type === VARIABLE_TYPE.BOOLEAN && (
                <Select
                  value={value || variableDefaultValue}
                  onChange={onChangeValue || onDefaultValueChangeFromSelect}
                >
                  <Option value={'true'}>True</Option>
                  <Option value={'false'}>False</Option>
                </Select>
              )}

              {(variable.type === VARIABLE_TYPE.STRING ||
                variable.type === VARIABLE_TYPE.NUMBER) && (
                <Form
                  form={editVariableDefaultValueForm}
                  initialValues={{ defaultValue: variable.defaultValue }}
                  onValuesChange={debounce(
                    onChangeValue
                      ? (changedValues: { defaultValue: string }) => {
                          onChangeValue(changedValues.defaultValue)
                        }
                      : onVariableDefaultValueChangeFromInput,
                    100
                  )}
                  onFinish={() => variableDefaultValueInputRef.current?.blur()}
                >
                  {variable.type === VARIABLE_TYPE.STRING && (
                    <Form.Item name="defaultValue">
                      <Input
                        placeholder="Undefined"
                        ref={variableDefaultValueInputRef}
                      />
                    </Form.Item>
                  )}

                  {variable.type === VARIABLE_TYPE.NUMBER && (
                    <Form.Item name="defaultValue">
                      <InputNumber
                        placeholder="Undefined"
                        ref={variableDefaultValueInputRef}
                      />
                    </Form.Item>
                  )}
                </Form>
              )}
            </Col>

            <Col
              className={`${styles.deleteVariableCol} ${styles.deleteCell}`}
              onClick={
                onDelete
                  ? () => variable.id && onDelete(variable.id)
                  : onRemoveVariable
              }
            >
              <DeleteOutlined style={{ fontSize: 12 }} />
            </Col>
          </Row>
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

  return (
    <div className={styles.GameVariables}>
      <div className={styles.variableTable}>
        <Row className={styles.headerRow}>
          <Col className={`${styles.titleCol} ${styles.titleHeader}`}>
            Title
          </Col>
          <Col className={`${styles.typeCol} ${styles.typeHeader}`}>Type</Col>
          <Col
            className={`${styles.defaultValueCol} ${styles.defaultValueHeader}`}
          >
            Default
          </Col>
          <Col className={`${styles.deleteVariableCol}`} />
        </Row>

        <div className={styles.variableRows}>
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
        </div>
      </div>
    </div>
  )
}

export default GameVariables
