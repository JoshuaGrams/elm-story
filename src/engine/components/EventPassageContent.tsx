import React from 'react'
import reactStringReplace from 'react-string-replace'

import { VARIABLE_TYPE, EngineEventStateCollection } from '../types/0.5.0'

import {
  gameMethods,
  getProcessedTemplate,
  getTemplateExpressions,
  parseTemplateExpressions
} from '../lib/templates'

const processTemplateBlock = (
  template: string,
  state: EngineEventStateCollection
): string => {
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

  return getProcessedTemplate(
    template,
    expressions,
    parsedExpressions,
    variables,
    gameMethods
  )
}

const decorate = (processedTemplate: string) => {
  let matchExpressionCounter = 0

  return reactStringReplace(processedTemplate, /{([^}]+)}/g, (match) => {
    matchExpressionCounter++

    return match === 'esg-error' ? (
      <span
        className="es-engine-expression-error"
        key={`span-${matchExpressionCounter}-error`}
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
  const parsedContent: {
    type: 'paragraph'
    children: { text: string }[]
  }[] = JSON.parse(content)

  return (
    <>
      {parsedContent.map((descendant, index) => {
        return (
          <p key={`content-p-text-${index}`}>
            {decorate(processTemplateBlock(descendant.children[0].text, state))}
          </p>
        )
      })}

      {!parsedContent[0].children[0].text && parsedContent.length === 1 && (
        <div>Empty Passage.</div>
      )}
    </>
  )
})

EventPassageContent.displayName = 'EventPassageContent'

export default EventPassageContent
