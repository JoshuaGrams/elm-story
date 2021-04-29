import logger from '../../lib/logger'

import React, { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash-es'

import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  GameId,
  SET_OPERATOR_TYPE,
  StudioId,
  VARIABLE_TYPE
} from '../../data/types'

import { useVariable, useVariables } from '../../hooks'

import { Col, Form, Input, InputNumber, Row, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'

export enum VARIABLE_ROW_TYPE {
  VARIABLE = 'VARIABLE',
  CONDITION = 'CONDITION',
  EFFECT = 'EFFECT'
}

const { Option } = Select

export const VariableRow: React.FC<{
  studioId: StudioId
  variableId: ComponentId
  rowType?: VARIABLE_ROW_TYPE
  allowRename?: boolean
  allowTypeChange?: boolean
  allowCompareOperator?: boolean
  allowSetOperator?: boolean
  value?: string
  compareOperatorType?: COMPARE_OPERATOR_TYPE
  setOperatorType?: SET_OPERATOR_TYPE
  onChangeValue?: (newValue: string) => void
  onCompareOperatorTypeChange?: (
    newCompareOperatorType: COMPARE_OPERATOR_TYPE
  ) => void
  onSetOperatorTypeChange?: (newSetOperatorType: SET_OPERATOR_TYPE) => void
  onDelete?: (variableId: ComponentId) => void
}> = ({
  studioId,
  variableId,
  rowType = VARIABLE_ROW_TYPE.VARIABLE,
  allowRename = true,
  allowTypeChange = true,
  allowCompareOperator = false,
  allowSetOperator = false,
  value,
  compareOperatorType,
  setOperatorType,
  onCompareOperatorTypeChange,
  onSetOperatorTypeChange,
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
    >(variable?.initialValue)

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
      const relatedConditions = await api().conditions.getConditionsByVariableRef(
          studioId,
          variable.id
        ),
        relatedEffects = await api().effects.getEffectsByVariableRef(
          studioId,
          variable.id
        )

      await Promise.all([
        relatedConditions.map(async (relatedCondition) => {
          if (relatedCondition.id) {
            const condition = await api().conditions.getCondition(
              studioId,
              relatedCondition.id
            )

            await api().conditions.saveCondition(studioId, {
              ...condition,
              compare: [
                condition.compare[0],
                COMPARE_OPERATOR_TYPE.EQ,
                selectedVariableType === VARIABLE_TYPE.BOOLEAN ? 'false' : '',
                selectedVariableType
              ]
            })
          }
        }),
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
      ])

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
    initialValue: string
  }) {
    logger.info(
      `VariableRow->onDefaultValueChangeFromInput->${changedValues.initialValue}`
    )

    if (variable?.id && changedValues.initialValue !== variableDefaultValue) {
      variableType === VARIABLE_TYPE.STRING &&
        (await api().variables.saveVariableDefaultValue(
          studioId,
          variable.id,
          changedValues.initialValue
        ))

      if (variableType === VARIABLE_TYPE.NUMBER) {
        if (
          typeof changedValues.initialValue === 'number' ||
          changedValues.initialValue === '' ||
          !changedValues.initialValue
        ) {
          await api().variables.saveVariableDefaultValue(
            studioId,
            variable.id,
            `${changedValues.initialValue}`
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
    logger.info(`VariableRow->variable.initialValue->${variable?.initialValue}`)

    variable?.initialValue && setVariableDefaultValue(variable.initialValue)
  }, [variable?.initialValue])

  useEffect(() => {
    logger.info(`VariableRow->value->useEffect->${value}`)

    // if (value) {
    // editVariableDefaultValueForm.resetFields()
    // variableDefaultValueInputRef.current?.focus()
    // }
  }, [value])

  return (
    <>
      {variable && (
        <>
          <Row className={styles.variableRow}>
            <Col
              className={styles.titleCol}
              style={{
                width:
                  rowType !== VARIABLE_ROW_TYPE.VARIABLE &&
                  (variableType === VARIABLE_TYPE.BOOLEAN ||
                    variableType === VARIABLE_TYPE.STRING)
                    ? '65%'
                    : ''
              }}
            >
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

            {rowType === VARIABLE_ROW_TYPE.CONDITION &&
              variableType !== VARIABLE_TYPE.BOOLEAN &&
              variableType !== VARIABLE_TYPE.STRING && (
                <Col className={styles.typeCol}>
                  <Select
                    value={compareOperatorType}
                    onChange={onCompareOperatorTypeChange}
                  >
                    <Option value={COMPARE_OPERATOR_TYPE.EQ}>
                      {COMPARE_OPERATOR_TYPE.EQ}
                    </Option>
                    <Option value={COMPARE_OPERATOR_TYPE.NE}>
                      {COMPARE_OPERATOR_TYPE.NE}
                    </Option>
                    <Option value={COMPARE_OPERATOR_TYPE.GTE}>
                      {COMPARE_OPERATOR_TYPE.GTE}
                    </Option>
                    <Option value={COMPARE_OPERATOR_TYPE.GT}>
                      {COMPARE_OPERATOR_TYPE.GT}
                    </Option>
                    <Option value={COMPARE_OPERATOR_TYPE.LTE}>
                      {COMPARE_OPERATOR_TYPE.LTE}
                    </Option>
                    <Option value={COMPARE_OPERATOR_TYPE.LT}>
                      {COMPARE_OPERATOR_TYPE.LT}
                    </Option>
                  </Select>
                </Col>
              )}

            {allowSetOperator && (
              <Col className={styles.typeCol}>
                <Select
                  value={setOperatorType}
                  onChange={onSetOperatorTypeChange}
                >
                  <Option value={SET_OPERATOR_TYPE.ASSIGN}>
                    {SET_OPERATOR_TYPE.ASSIGN}
                  </Option>
                  <Option value={SET_OPERATOR_TYPE.ADD}>
                    {SET_OPERATOR_TYPE.ADD}
                  </Option>
                  <Option value={SET_OPERATOR_TYPE.SUBTRACT}>
                    {SET_OPERATOR_TYPE.SUBTRACT}
                  </Option>
                  <Option value={SET_OPERATOR_TYPE.MULTIPLY}>
                    {SET_OPERATOR_TYPE.MULTIPLY}
                  </Option>
                  <Option value={SET_OPERATOR_TYPE.DIVIDE}>
                    {SET_OPERATOR_TYPE.DIVIDE}
                  </Option>
                </Select>
              </Col>
            )}

            <Col className={styles.defaultValueCol}>
              {variable.type === VARIABLE_TYPE.BOOLEAN && (
                <Select
                  value={value || variableDefaultValue}
                  onChange={onChangeValue || onDefaultValueChangeFromSelect}
                >
                  <Option value={'true'}>true</Option>
                  <Option value={'false'}>false</Option>
                </Select>
              )}

              {(variable.type === VARIABLE_TYPE.STRING ||
                variable.type === VARIABLE_TYPE.NUMBER) && (
                <Form
                  form={editVariableDefaultValueForm}
                  initialValues={{
                    initialValue:
                      rowType === VARIABLE_ROW_TYPE.VARIABLE
                        ? variable.initialValue
                        : value || undefined
                  }}
                  onValuesChange={debounce(
                    onChangeValue
                      ? (changedValues: { initialValue: string }) => {
                          onChangeValue(changedValues.initialValue)
                        }
                      : onVariableDefaultValueChangeFromInput,
                    100
                  )}
                  onFinish={() => variableDefaultValueInputRef.current?.blur()}
                >
                  {variable.type === VARIABLE_TYPE.STRING && (
                    <Form.Item name="initialValue">
                      <Input
                        placeholder="Undefined"
                        ref={variableDefaultValueInputRef}
                      />
                    </Form.Item>
                  )}

                  {variable.type === VARIABLE_TYPE.NUMBER && (
                    <Form.Item name="initialValue">
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
            Initial
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
