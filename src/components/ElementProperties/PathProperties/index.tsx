import logger from '../../../lib/logger'

import React, { useEffect, useState } from 'react'

import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  GameId,
  SET_OPERATOR_TYPE,
  StudioId,
  VARIABLE_TYPE
} from '../../../data/types'

import {
  useRouteEffectsByRouteRef,
  useRoute,
  useVariables,
  useRouteEffect,
  useVariable,
  useRouteConditionsByRouteRef,
  useRouteCondition
} from '../../../hooks'

import { Select } from 'antd'

import ComponentTitle from '../ElementTitle'
import ElementHelpButton from '../../ElementHelpButton'
import { VariableRow, VARIABLE_ROW_TYPE } from '../../StoryworldVariables'

import parentStyles from '../styles.module.less'
import storyworldVariableStyles from '../../StoryworldVariables/styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

const RouteConditionRow: React.FC<{
  studioId: StudioId
  conditionId: ComponentId
  variableId: ComponentId
}> = ({ studioId, conditionId, variableId }) => {
  const condition = useRouteCondition(studioId, conditionId, [
      studioId,
      conditionId
    ]),
    variable = useVariable(studioId, variableId, [studioId, variableId])

  const [ready, setReady] = useState(false),
    [conditionCompareOperatorType, setConditionCompareOperatorType] = useState<
      COMPARE_OPERATOR_TYPE | undefined
    >(undefined),
    [conditionValue, setConditionValue] = useState<string | undefined>(
      undefined
    )

  async function onRemoveCondition() {
    condition?.id &&
      (await api().conditions.removeCondition(studioId, condition.id))
  }

  useEffect(() => {
    logger.info(`RouteConditionRow->condition->useEffect`)

    condition &&
      !ready &&
      setConditionCompareOperatorType(condition.compare[1]) &&
      setConditionValue(condition.compare[2]) &&
      setReady(true)
  }, [condition])

  return (
    <>
      {condition && variable?.id && (
        <>
          <VariableRow
            studioId={studioId}
            variableId={variable.id}
            rowType={VARIABLE_ROW_TYPE.CONDITION}
            allowRename={false}
            allowTypeChange={false}
            allowCompareOperator={true}
            compareOperatorType={conditionCompareOperatorType}
            value={condition.compare[2] || undefined}
            onCompareOperatorTypeChange={async (
              newCompareOperatorType: COMPARE_OPERATOR_TYPE
            ) => {
              condition.id &&
                (await api().conditions.saveConditionCompareOperatorType(
                  studioId,
                  condition.id,
                  newCompareOperatorType
                ))

              setConditionCompareOperatorType(newCompareOperatorType)
            }}
            onChangeValue={async (newValue: string) => {
              condition.id &&
                (await api().conditions.saveConditionValue(
                  studioId,
                  condition.id,
                  newValue !== null ? `${newValue}` : ''
                ))

              setConditionValue(newValue)
            }}
            onDelete={onRemoveCondition}
          />

          {condition.compare[2] === variable.initialValue && (
            <div className={styles.defaultValueMsg}>
              Condition set to initial value.
            </div>
          )}
        </>
      )}
    </>
  )
}

const RouteEffectRow: React.FC<{
  studioId: StudioId
  effectId: ComponentId
  variableId: ComponentId
}> = ({ studioId, effectId, variableId }) => {
  const effect = useRouteEffect(studioId, effectId, [studioId, effectId]),
    variable = useVariable(studioId, variableId, [studioId, variableId])

  const [ready, setReady] = useState(false),
    [effectSetOperatorType, setEffectSetOperatorType] = useState<
      SET_OPERATOR_TYPE | undefined
    >(undefined),
    [effectValue, setEffectValue] = useState<string | undefined>(undefined)

  async function onRemoveEffect() {
    effect?.id && (await api().effects.removeEffect(studioId, effect.id))
  }

  useEffect(() => {
    logger.info(`RouteEffectRow->effect->useEffect`)

    effect &&
      !ready &&
      setEffectSetOperatorType(effect.set[1]) &&
      setEffectValue(effect.set[2]) &&
      setReady(true)
  }, [effect])

  return (
    <>
      {effect && variable?.id && (
        <>
          <VariableRow
            studioId={studioId}
            variableId={variable.id}
            rowType={VARIABLE_ROW_TYPE.EFFECT}
            allowRename={false}
            allowTypeChange={false}
            allowSetOperator={variable.type === VARIABLE_TYPE.NUMBER}
            setOperatorType={effectSetOperatorType}
            value={effect.set[2]}
            onSetOperatorTypeChange={async (
              newSetOperatorType: SET_OPERATOR_TYPE
            ) => {
              effect.id &&
                (await api().effects.saveEffectSetOperatorType(
                  studioId,
                  effect.id,
                  newSetOperatorType
                ))

              setEffectSetOperatorType(newSetOperatorType)
            }}
            onChangeValue={async (newValue: string) => {
              effect.id &&
                (await api().effects.saveEffectValue(
                  studioId,
                  effect.id,
                  newValue !== null ? `${newValue}` : ''
                ))

              setEffectValue(newValue)
            }}
            onDelete={onRemoveEffect}
          />

          {effect.set[2] === variable.initialValue && (
            <div className={styles.defaultValueMsg}>
              Effect set to initial value.
            </div>
          )}
        </>
      )}
    </>
  )
}

const RouteDetails: React.FC<{
  studioId: StudioId
  gameId: GameId
  routeId: ComponentId
}> = ({ studioId, gameId, routeId }) => {
  const route = useRoute(studioId, routeId, [studioId, routeId]),
    conditions = useRouteConditionsByRouteRef(studioId, routeId, [
      studioId,
      routeId
    ]),
    effects = useRouteEffectsByRouteRef(studioId, routeId, [studioId, routeId]),
    variables = useVariables(studioId, gameId, [studioId, gameId, effects])

  async function onNewCondition(variableId: ComponentId) {
    const foundVariable = variables?.find(
      (variable) => variable.id === variableId
    )

    route?.gameId &&
      foundVariable?.id &&
      (await api().conditions.saveCondition(studioId, {
        gameId: route.gameId,
        routeId,
        variableId: foundVariable.id,
        title: 'Untitled Condition',
        compare: [
          foundVariable.id,
          COMPARE_OPERATOR_TYPE.EQ,
          foundVariable.initialValue,
          foundVariable.type
        ],
        tags: []
      }))
  }

  async function onNewEffect(variableId: ComponentId) {
    const foundVariable = variables?.find(
      (variable) => variable.id === variableId
    )

    route?.gameId &&
      foundVariable?.id &&
      (await api().effects.saveEffect(studioId, {
        gameId: route.gameId,
        routeId,
        variableId: foundVariable.id,
        title: 'Untitled Effect',
        set: [
          foundVariable.id,
          SET_OPERATOR_TYPE.ASSIGN,
          foundVariable.initialValue
        ],
        tags: []
      }))
  }

  useEffect(() => {
    logger.info(variables)
  }, [variables])

  useEffect(() => {
    logger.info(effects)
  }, [effects])

  return (
    <>
      {route && (
        <div
          className={`${parentStyles.componentDetailViewWrapper} ${styles.RouteDetails}`}
        >
          <div className={parentStyles.content}>
            <ComponentTitle
              title={route.title}
              onUpdate={async (title) =>
                route.id &&
                (await api().routes.saveRoute(studioId, {
                  ...(await api().routes.getRoute(studioId, route.id)),
                  title
                }))
              }
            />
            <div className={parentStyles.componentId}>{route.id}</div>

            {/* ROUTE CONDITIONS */}
            <div className={styles.routeFeature}>
              <div className={styles.featureHeader}>
                Conditions <ElementHelpButton type={COMPONENT_TYPE.CONDITION} />
              </div>

              <div className={styles.featureList}>
                <>
                  {conditions && variables && variables.length > 0 && (
                    <Select
                      value="Select New Condition..."
                      className={`${styles.select} ${
                        conditions.length === 0 ? styles.noConditions : ''
                      }`}
                      onChange={onNewCondition}
                    >
                      {variables
                        .filter(
                          (variable) =>
                            conditions.length === 0 ||
                            !conditions.find(
                              (condition) =>
                                condition.variableId === variable.id
                            )
                        )
                        .map(
                          (variable) =>
                            variable.id && (
                              <Select.Option
                                value={variable.id}
                                key={variable.id}
                              >
                                {variable.title}
                              </Select.Option>
                            )
                        )}
                    </Select>
                  )}

                  {variables && variables.length === 0 && (
                    <div className={styles.noVariables}>
                      At least 1 game variable is required to create a
                      condition.
                    </div>
                  )}

                  {conditions && (
                    <div className={storyworldVariableStyles.variableRows}>
                      {conditions.map(
                        (condition) =>
                          condition.id && (
                            <RouteConditionRow
                              studioId={studioId}
                              conditionId={condition.id}
                              variableId={condition.compare[0]}
                              key={condition.id}
                            />
                          )
                      )}
                    </div>
                  )}
                </>
              </div>
            </div>

            {/* ROUTE EFFECTS */}
            <div className={styles.routeFeature}>
              <div className={styles.featureHeader}>
                Effects <ElementHelpButton type={COMPONENT_TYPE.EFFECT} />
              </div>

              <div className={styles.featureList}>
                <>
                  {effects && variables && variables.length > 0 && (
                    <Select
                      value="Select New Effect..."
                      className={`${styles.select} ${
                        effects.length === 0 ? styles.noEffects : ''
                      }`}
                      onChange={onNewEffect}
                    >
                      {variables
                        .filter(
                          (variable) =>
                            effects.length === 0 ||
                            !effects.find(
                              (effect) => effect.variableId === variable.id
                            )
                        )
                        .map(
                          (variable) =>
                            variable.id && (
                              <Select.Option
                                value={variable.id}
                                key={variable.id}
                              >
                                {variable.title}
                              </Select.Option>
                            )
                        )}
                    </Select>
                  )}

                  {variables && variables.length === 0 && (
                    <div className={styles.noVariables}>
                      At least 1 game variable is required to create an effect.
                    </div>
                  )}
                </>

                {effects && (
                  <div className={storyworldVariableStyles.variableRows}>
                    {effects.map(
                      (effect) =>
                        effect.id && (
                          <RouteEffectRow
                            studioId={studioId}
                            effectId={effect.id}
                            variableId={effect.set[0]}
                            key={effect.id}
                          />
                        )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RouteDetails
