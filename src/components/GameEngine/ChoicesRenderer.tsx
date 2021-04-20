import logger from '../../lib/logger'

import { cloneDeep } from 'lodash'

import React, { useContext, useEffect, useState } from 'react'

import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  Condition,
  Effect,
  GameState,
  Route,
  SET_OPERATOR_TYPE,
  StudioId
} from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import {
  useChoice,
  useChoicesByPassageRef,
  useRoutesByChoiceRef,
  useRouteConditionsByRouteRefs
} from '../../hooks'
import api from '../../api'

function isRouteOpen(gameState: GameState, conditions: Condition[]): boolean {
  let isOpen = conditions.length === 0 ? true : false

  conditions.length > 0 &&
    conditions.map((condition) => {
      const currentValue = gameState[condition.compare[0]].currentValue

      switch (condition.compare[1]) {
        case COMPARE_OPERATOR_TYPE.EQ:
          // TODO: All values in compare[2] should be string #131
          isOpen = currentValue === `${condition.compare[2]}`
          break
        case COMPARE_OPERATOR_TYPE.GT:
          isOpen = currentValue > condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.GTE:
          isOpen = currentValue >= condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.LT:
          isOpen = currentValue < condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.LTE:
          isOpen = currentValue <= condition.compare[2]
          break
        case COMPARE_OPERATOR_TYPE.NE:
          isOpen = currentValue !== condition.compare[2]
          break
        default:
          break
      }
    })

  return isOpen
}

async function processEffectsByRoute(
  studioId: StudioId,
  gameState: GameState,
  routeId: ComponentId
): Promise<GameState | null> {
  const effects = (await api().effects.getEffectsByRouteRef(
    studioId,
    routeId
  )) as Effect[]

  if (effects.length > 0) {
    const newGameState = cloneDeep(gameState)

    effects.map((effect) => {
      if (effect.id && newGameState[effect.variableId]) {
        switch (effect.set[1]) {
          case SET_OPERATOR_TYPE.ASSIGN:
            newGameState[effect.variableId].currentValue = effect.set[2]
            break
          case SET_OPERATOR_TYPE.ADD:
            newGameState[effect.variableId].currentValue = `${
              Number(newGameState[effect.variableId].currentValue) +
              Number(effect.set[2])
            }`
            break
          case SET_OPERATOR_TYPE.SUBTRACT:
            newGameState[effect.variableId].currentValue = `${
              Number(newGameState[effect.variableId].currentValue) -
              Number(effect.set[2])
            }`
            break
          case SET_OPERATOR_TYPE.DIVIDE:
            newGameState[effect.variableId].currentValue = `${
              Number(newGameState[effect.variableId].currentValue) /
              Number(effect.set[2])
            }`
            break
          default:
            break
        }
      }
    })

    return newGameState
  } else {
    return null
  }
}

const SelectedRouteHandler: React.FC<{
  studioId: StudioId
  routes: Route[]
  onSelectedRoute: (routeId: ComponentId | undefined) => void
}> = ({ studioId, routes, onSelectedRoute }) => {
  const conditionsByRoutes = useRouteConditionsByRouteRefs(
    studioId,
    routes.map((route) => route.id as ComponentId),
    [studioId, routes]
  )

  const { engine } = useContext(EngineContext)

  useEffect(() => {
    logger.info(
      `SelectedRouteHandler->conditionsByRoutes,engine.gameState->useEffect`
    )

    const openRoutes: ComponentId[] = []

    if (conditionsByRoutes) {
      routes.map((route) => {
        route.id &&
          isRouteOpen(
            cloneDeep(engine.gameState),
            conditionsByRoutes.filter(
              (condition) => condition.routeId === route.id
            )
          ) &&
          openRoutes.push(route.id)
      })

      openRoutes.length > 0
        ? onSelectedRoute(openRoutes[(openRoutes.length * Math.random()) | 0])
        : onSelectedRoute(undefined)
    }
  }, [conditionsByRoutes, routes, engine.gameState])

  return null
}

const ChoiceButtonRenderer: React.FC<{
  studioId: StudioId
  choiceId: ComponentId
  onChoice: (
    choiceId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) => void
}> = ({ studioId, choiceId, onChoice }) => {
  const choice = useChoice(studioId, choiceId, [studioId, choiceId]),
    routes = useRoutesByChoiceRef(studioId, choiceId, [studioId, choiceId])

  const { engine, engineDispatch } = useContext(EngineContext)

  const [selectedRoute, setSelectedRoute] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    logger.info(
      `ChoiceButtonRenderer->selectedRoute->useEffect:${selectedRoute}`
    )
  }, [selectedRoute])

  return (
    <>
      {choice?.id && routes && (
        <>
          <SelectedRouteHandler
            studioId={studioId}
            routes={routes}
            onSelectedRoute={(routeId: ComponentId | undefined) =>
              setSelectedRoute(routeId)
            }
          />

          <a
            className="choice-button"
            onClick={
              selectedRoute
                ? async () => {
                    if (choice.id) {
                      const foundRoute = routes.find(
                        (route) => route.id === selectedRoute
                      )

                      if (foundRoute?.id) {
                        const newGameState = await processEffectsByRoute(
                          studioId,
                          engine.gameState,
                          foundRoute.id
                        )

                        newGameState &&
                          engineDispatch({
                            type: ENGINE_ACTION_TYPE.GAME_STATE,
                            gameState: newGameState
                          })

                        // TODO: Choice may point to multiple passages and jumps.
                        // Track, calculate probability. For now, we'll go to the first. #111
                        onChoice(
                          choice.id,
                          foundRoute.destinationId,
                          foundRoute.destinationType
                        )
                      }
                    }
                  }
                : () => null
            }
          >
            {choice.title} {!selectedRoute && <span>(No Route)</span>}
          </a>
        </>
      )}
    </>
  )
}

const ChoicesRenderer: React.FC<{
  studioId: StudioId
  passageId: ComponentId
  order: string[]
  onChoice: (
    choiceId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) => void
}> = ({ studioId, passageId, order, onChoice }) => {
  const choices = useChoicesByPassageRef(studioId, passageId, [
    studioId,
    passageId
  ])

  return (
    <>
      {choices && (
        <div className="choices-container">
          {choices
            .sort(
              (a, b) =>
                order.findIndex((choiceRef) => a.id === choiceRef) -
                order.findIndex((choiceRef) => b.id === choiceRef)
            )
            .map(
              (choice) =>
                choice.id && (
                  <ChoiceButtonRenderer
                    key={choice.id}
                    studioId={studioId}
                    choiceId={choice.id}
                    onChoice={onChoice}
                  />
                )
            )}
        </div>
      )}
    </>
  )
}

export default ChoicesRenderer
