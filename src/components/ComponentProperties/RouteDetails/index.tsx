import logger from '../../../lib/logger'

import React, { useEffect, useState } from 'react'

import {
  ComponentId,
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
  useVariable
} from '../../../hooks'

import { Select } from 'antd'

import ComponentTitle from '../ComponentTitle'
import { VariableRow } from '../../GameVariables'

import parentStyles from '../styles.module.less'
import gameVariablesStyles from '../../GameVariables/styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

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
            allowRename={false}
            allowTypeChange={false}
            allowSetOperator={variable.type === VARIABLE_TYPE.NUMBER}
            setOperatorType={effectSetOperatorType}
            value={effectValue || effect.set[2]}
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
                  newValue
                ))

              setEffectValue(newValue)
            }}
            onDelete={onRemoveEffect}
          />

          {effectValue === variable.defaultValue && (
            <div className={styles.effectDefaultValueMsg}>
              Effect set to default value.
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
    effects = useRouteEffectsByRouteRef(studioId, routeId, [studioId, routeId]),
    variables = useVariables(studioId, gameId, [studioId, gameId, effects])

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
          foundVariable.defaultValue
        ],
        tags: []
      }))
  }

  useEffect(() => {
    console.log(variables)
  }, [variables])

  useEffect(() => {
    console.log(effects)
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

            <div className={styles.routeEffects}>
              <div className={styles.header}>Effects</div>

              <div className={styles.effectsList}>
                <>
                  {effects && variables && variables.length > 0 && (
                    <Select
                      value="Select New Effect..."
                      className={`${styles.newEffectSelect} ${
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
                      At least 1 game variable is required to create a route
                      effect.
                    </div>
                  )}
                </>

                {effects && (
                  <div className={gameVariablesStyles.variableRows}>
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
