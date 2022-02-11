import React, { useContext, useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'
import parseToHTML from 'html-react-parser'

import {
  VARIABLE_TYPE,
  EngineLiveEventStateCollection,
  EventCharacterPersona,
  StudioId,
  WorldId
} from '../types'
import {
  gameMethods,
  getProcessedTemplate,
  getTemplateExpressions,
  parseTemplateExpressions
} from '../lib/templates'

import { EngineContext } from '../contexts/EngineContext'

import EventCharacterReference from './EventCharacterReference'
import { eventContentToEventStreamContent } from '../lib/serialization'

const processTemplateBlock = (
  template: string,
  state: EngineLiveEventStateCollection
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
  state: EngineLiveEventStateCollection,
  highlightExpressions?: boolean
) => {
  const [processedTemplate, expressions] = processTemplateBlock(template, state)

  let matchExpressionCounter = 0

  return reactStringReplace(processedTemplate, /{([^}]+)}/g, (match) => {
    const matchedExpression = expressions[matchExpressionCounter]

    matchExpressionCounter++

    return highlightExpressions ? (
      `<span
        className="${match === 'esg-error' ? `expression-error` : `expression`}"
        key="${`expression-${matchExpressionCounter}`}"
        title="${matchedExpression}"
      >
        ${match === 'esg-error' ? 'ERROR' : match}
      </span>`
    ) : match === 'esg-error' ? (
      <span
        className="expression-error"
        key={`expression-${matchExpressionCounter}`}
        title={matchedExpression}
      >
        ERROR
      </span>
    ) : (
      `<span key="${`span-${matchExpressionCounter}`}">${match}</span>`
    )
  })
}

const EventContent: React.FC<{
  studioId: StudioId
  worldId: WorldId
  content: string
  persona?: EventCharacterPersona
  state: EngineLiveEventStateCollection
}> = React.memo(({ studioId, worldId, content, persona, state }) => {
  const { engine } = useContext(EngineContext)

  const [serializedContent, setSerializedContent] = useState<{
    startingElement?: string
    text: string
  } | null>(null)

  useEffect(() => {
    async function serializeContent() {
      setSerializedContent(
        await eventContentToEventStreamContent(studioId, worldId, content)
      )
    }

    serializeContent()
  }, [content])

  return (
    <div>
      {serializedContent?.startingElement &&
        parseToHTML(serializedContent?.startingElement)}

      {serializedContent &&
        parseToHTML(
          decorate(
            serializedContent.text,
            state,
            engine.devTools.highlightExpressions
          ).join('')
        )}
    </div>
  )
})

EventContent.displayName = 'EventContent'

export default EventContent
