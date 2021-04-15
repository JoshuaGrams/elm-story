import logger from '../../../lib/logger'

import React, { useEffect, useState } from 'react'

import {
  ComponentId,
  GameId,
  SET_OPERATOR,
  StudioId
} from '../../../data/types'

import {
  useRouteEffectsByRouteRef,
  useRoute,
  useVariables,
  useRouteEffect,
  useVariable
} from '../../../hooks'

import { Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import ComponentTitle from '../ComponentTitle'
import { VariableRow } from '../../GameVariables'

import parentStyles from '../styles.module.less'
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
    [effectValue, setEffectValue] = useState<string | undefined>(undefined)

  async function onRemoveEffect() {
    effect?.id && (await api().effects.removeEffect(studioId, effect.id))
  }

  useEffect(() => {
    logger.info(`RouteEffectRow->effect->useEffect`)

    effect && !ready && setEffectValue(effect.set[2]) && setReady(true)
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
            allowDelete={false}
            value={effectValue}
            onChangeValue={async (newValue: string) => {
              effect.id &&
                (await api().effects.saveEffectValue(
                  studioId,
                  effect.id,
                  newValue
                ))

              setEffectValue(newValue)
            }}
          />
          <DeleteOutlined onClick={onRemoveEffect} />

          {effectValue === variable.defaultValue && (
            <div>Effect set to default value.</div>
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
        title: 'Untitled Effect',
        set: [
          foundVariable.id,
          SET_OPERATOR.ASSIGN,
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
                {variables && (
                  <Select
                    value="Select New Effect..."
                    className={styles.newEffectSelect}
                    onChange={onNewEffect}
                  >
                    {variables
                      .filter(
                        (variable) =>
                          effects?.length === 0 ||
                          effects?.find(
                            (effect) => effect.set[0] !== variable?.id
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

                {effects &&
                  effects.map(
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RouteDetails
