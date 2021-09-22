import logger from '../../lib/logger'

import { cloneDeep } from 'lodash-es'
import reactStringReplace from 'react-string-replace'

import {
  gameMethods,
  getProcessedTemplate,
  getTemplateExpressions,
  parseTemplateExpressions
} from '../../lib/templates'

import React, { useCallback, useContext, useEffect } from 'react'

import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  Condition,
  Effect,
  GameState,
  PASSAGE_TYPE,
  Route,
  SET_OPERATOR_TYPE,
  StudioId,
  VARIABLE_TYPE
} from '../../data/types'
import { CustomElement } from '../ComponentEditor/PassageView'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import {
  usePassage,
  useRouteConditionsByRouteRefs,
  useRoutesByPassageRef
} from '../../hooks'

import { Tooltip } from 'antd'

import ChoicesRenderer from './ChoicesRenderer'
import InputRenderer from './InputRenderer'

import api from '../../api'

export function isRouteOpen(
  gameState: GameState,
  conditions: Condition[]
): boolean {
  let isOpen = conditions.length === 0 ? true : false

  conditions.length > 0 &&
    conditions.map((condition) => {
      const currentValue =
        condition.compare[3] === VARIABLE_TYPE.NUMBER
          ? Number(gameState[condition.compare[0]].currentValue)
          : gameState[condition.compare[0]].currentValue

      const compareValue =
        condition.compare[3] === VARIABLE_TYPE.NUMBER
          ? Number(condition.compare[2])
          : condition.compare[2]

      switch (condition.compare[1]) {
        case COMPARE_OPERATOR_TYPE.EQ:
          isOpen = currentValue === compareValue
          break
        case COMPARE_OPERATOR_TYPE.GT:
          isOpen = currentValue > compareValue
          break
        case COMPARE_OPERATOR_TYPE.GTE:
          isOpen = currentValue >= compareValue
          break
        case COMPARE_OPERATOR_TYPE.LT:
          isOpen = currentValue < compareValue
          break
        case COMPARE_OPERATOR_TYPE.LTE:
          isOpen = currentValue <= compareValue
          break
        case COMPARE_OPERATOR_TYPE.NE:
          isOpen = currentValue !== compareValue
          break
        default:
          break
      }
    })

  return isOpen
}

export async function processEffectsByRoute(
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
          case SET_OPERATOR_TYPE.MULTIPLY:
            newGameState[effect.variableId].currentValue = `${
              Number(newGameState[effect.variableId].currentValue) *
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

export const SelectedRouteHandler: React.FC<{
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

const PassageContent: React.FC<{ title: string; content: string }> = ({
  title,
  content
}) => {
  const { engine } = useContext(EngineContext)

  const parsedContent: CustomElement[] = JSON.parse(content)

  const processTemplateBlock = useCallback(
    (template: string): string => {
      const expressions = getTemplateExpressions(template),
        variables: {
          [variableId: string]: { value: string; type: VARIABLE_TYPE }
        } = {}

      Object.entries(engine.gameState).map((variable) => {
        const data = variable[1]

        variables[data.title] = {
          value: data.currentValue,
          type: data.type
        }
      })

      const parsedExpressions = parseTemplateExpressions(
        expressions,
        variables,
        gameMethods
      )

      return getProcessedTemplate(
        template,
        expressions,
        parsedExpressions,
        variables,
        gameMethods
      )
    },
    [engine.gameState]
  )

  function decorate(template: string, processedTemplate: string) {
    const expressions = getTemplateExpressions(template)
    let matchExpressionCounter = 0

    return reactStringReplace(processedTemplate, /{([^}]+)}/g, (match) => {
      const matchedExpression = expressions[matchExpressionCounter]

      matchExpressionCounter++

      return engine.highlightExpressions ? (
        <Tooltip
          title={matchedExpression}
          key={`tooltip-${matchExpressionCounter}`}
        >
          <span
            className={
              match === 'esg-error'
                ? `es-engine-expression-error`
                : `es-engine-expression-result`
            }
          >
            {match === 'esg-error' ? 'ERROR' : match}
          </span>
        </Tooltip>
      ) : match === 'esg-error' ? (
        <Tooltip
          title={matchedExpression}
          key={`tooltip-${matchExpressionCounter}`}
        >
          <span className="es-engine-expression-error">ERROR</span>
        </Tooltip>
      ) : (
        <span key={`span-${matchExpressionCounter}`}>{match}</span>
      )
    })
  }

  return (
    <>
      {parsedContent.length > 0 && !parsedContent[0].children[0].text && (
        <div className="es-engine-passage-no-content">{`Passage "${title}" is missing content.`}</div>
      )}

      {parsedContent.length > 0 &&
        parsedContent[0].children[0].text &&
        parsedContent.map((descendant: CustomElement, index: number) => (
          <p
            className={`${'es-engine-passage-p'} ${
              !descendant.children[0].text ? 'es-engine-passage-p-empty' : ''
            }`}
            key={`p-${index}`}
          >
            {descendant.children[0].text ? (
              decorate(
                descendant.children[0].text,
                processTemplateBlock(descendant.children[0].text)
              )
            ) : (
              <>&#65279;</>
            )}
          </p>
        ))}
    </>
  )
}

const PassageRenderer: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId, [studioId, passageId]),
    routes = useRoutesByPassageRef(studioId, passageId, [studioId, passageId])

  const { engine, engineDispatch } = useContext(EngineContext)

  async function navigate(
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) {
    if (destinationType === COMPONENT_TYPE.PASSAGE) {
      engineDispatch({
        type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
        currentPassage: destinationId
      })
    }

    if (destinationType === COMPONENT_TYPE.JUMP) {
      const jump = await api().jumps.getJump(studioId, destinationId)

      if (jump.route[0] && !jump.route[1]) {
        const scene = await api().scenes.getScene(studioId, jump.route[0])

        engineDispatch({
          type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
          currentPassage:
            scene && scene.children[0] ? scene.children[0][1] : null
        })
      }

      if (jump.route[1]) {
        engineDispatch({
          type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
          currentPassage: jump.route[1]
        })
      }

      engineDispatch({
        type: ENGINE_ACTION_TYPE.SCENE_CURRENT,
        currentScene: jump.route[0] || null
      })
    }

    engineDispatch({
      type: ENGINE_ACTION_TYPE.SCROLL_TO,
      scrollTo: { top: 0, left: 0 }
    })
  }

  async function onChoice(
    choiceId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) {
    logger.info(
      `PassageRenderer->onChoice->${choiceId}
      destinationId: ${destinationId}
      destinationType: ${destinationType}`
    )

    navigate(destinationId, destinationType)
  }

  async function onInput(
    inputId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) {
    logger.info(
      `PassageRenderer->onInput->${inputId}
        destinationId: ${destinationId}
        destinationType: ${destinationType}`
    )

    navigate(destinationId, destinationType)
  }

  return (
    <>
      {passage && routes && engine.currentPassage && (
        <>
          <PassageContent title={passage.title} content={passage.content} />

          {passage.type === PASSAGE_TYPE.CHOICE && (
            <>
              {passage.choices.length === 0 && (
                <div className="es-engine-game-over-message">The End</div>
              )}

              {passage.choices.length > 0 && (
                <ChoicesRenderer
                  studioId={studioId}
                  passageId={passageId}
                  order={passage.choices}
                  onChoice={onChoice}
                />
              )}
            </>
          )}

          {passage.type === PASSAGE_TYPE.INPUT && passage.input && (
            <InputRenderer
              studioId={studioId}
              inputId={passage.input}
              onInput={onInput}
            />
          )}
        </>
      )}
    </>
  )
}

export default PassageRenderer
