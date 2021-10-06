import React, { useContext } from 'react'
import reactStringReplace from 'react-string-replace'

import { VARIABLE_TYPE, EngineEventStateCollection } from '../types/0.5.0'
import {
  gameMethods,
  getProcessedTemplate,
  getTemplateExpressions,
  parseTemplateExpressions
} from '../lib/templates'

import { EngineContext } from '../contexts/EngineContext'

const processTemplateBlock = (
  template: string,
  state: EngineEventStateCollection
): [string, string[]] => {
  const expressions = getTemplateExpressions(template),
    variables: {
      [variableId: string]: { value: string; type: VARIABLE_TYPE }
    } = {}

  Object.entries(state).map((variable) => {
    const data = variable[1]

    variables[data.title] = {
      value: data.value,
      type: data.type
    }
  })

  const parsedExpressions = parseTemplateExpressions(
    expressions,
    variables,
    gameMethods
  )

  return [
    getProcessedTemplate(
      template,
      expressions,
      parsedExpressions,
      variables,
      gameMethods
    ),
    expressions
  ]
}

const decorate = (
  template: string,
  state: EngineEventStateCollection,
  highlightExpressions?: boolean
) => {
  const [processedTemplate, expressions] = processTemplateBlock(template, state)

  let matchExpressionCounter = 0

  return reactStringReplace(processedTemplate, /{([^}]+)}/g, (match) => {
    const matchedExpression = expressions[matchExpressionCounter]

    matchExpressionCounter++

    return highlightExpressions ? (
      <span
        className={match === 'esg-error' ? `expression-error` : `expression`}
        key={`expression-${matchExpressionCounter}`}
        title={matchedExpression}
      >
        {match === 'esg-error' ? 'ERROR' : match}
      </span>
    ) : match === 'esg-error' ? (
      <span
        className="expression-error"
        key={`expression-${matchExpressionCounter}`}
        title={matchedExpression}
      >
        ERROR
      </span>
    ) : (
      <span key={`span-${matchExpressionCounter}`}>{match}</span>
    )
  })
}

const EventPassageContent: React.FC<{
  content: string
  state: EngineEventStateCollection
}> = React.memo(({ content, state }) => {
  const { engine } = useContext(EngineContext)

  const parsedContent: {
    type: 'paragraph'
    children: { text: string }[]
  }[] = JSON.parse(content)

  return (
    <>
      {parsedContent.map((descendant, index) => {
        return (
          <p key={`content-p-text-${index}`}>
            {decorate(
              descendant.children[0].text,
              state,
              engine.devTools.highlightExpressions
            )}
          </p>
        )
      })}

      {!parsedContent[0].children[0].text && parsedContent.length === 1 && (
        <div className="engine-warning-message">Passage content required.</div>
      )}
    </>
  )
})

EventPassageContent.displayName = 'EventPassageContent'

export default EventPassageContent
