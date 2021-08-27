import logger from '../../lib/logger'

import reactStringReplace from 'react-string-replace'

import {
  gameMethods,
  getProcessedTemplate,
  getTemplateExpressions,
  parseTemplateExpressions
} from '../../lib/templates'

import React, { useContext, useEffect } from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { usePassage, useRoutesByPassageRef } from '../../hooks'

import { Tooltip } from 'antd'

import ChoicesRenderer from './ChoicesRenderer'
import { CustomElement } from '../ComponentEditor/PassageView'

import api from '../../api'

const PassageContent: React.FC<{ title: string; content: string }> = ({
  title,
  content
}) => {
  const { engine } = useContext(EngineContext)

  const parsedContent: CustomElement[] = JSON.parse(content)

  function processTemplateBlock(template: string): string {
    const expressions = getTemplateExpressions(template),
      variables: { [variableId: string]: string } = {}

    Object.entries(engine.gameState).map((variable) => {
      const data = variable[1]

      variables[data.title] = data.currentValue
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
  }

  function decorate(template: string, processedTemplate: string) {
    const expressions = getTemplateExpressions(template)
    let matchExpressionCounter = 0

    return reactStringReplace(processedTemplate, /{([^}]+)}/g, (match) => {
      const matchedExpression = expressions[matchExpressionCounter]

      matchExpressionCounter++

      return (
        <Tooltip title={matchedExpression}>
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

    if (destinationType === COMPONENT_TYPE.PASSAGE) {
      engineDispatch({
        type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
        currentPassage: destinationId
      })
    }

    if (destinationType === COMPONENT_TYPE.JUMP) {
      const jump = await api().jumps.getJump(studioId, destinationId)

      engineDispatch({
        type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
        currentPassage: jump.route[1] || null
      })

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

  useEffect(() => {
    logger.info(`PassageRenderer->passage,passageId->useEffect`)

    // Passage has been removed.
    !passage &&
      passageId &&
      engine.currentPassage &&
      engineDispatch({
        type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
        currentPassage: null
      })
  }, [passage, passageId])

  return (
    <>
      {passage && routes && (
        <>
          <PassageContent title={passage.title} content={passage.content} />

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
    </>
  )
}

export default PassageRenderer
