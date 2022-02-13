import { eventContentToEventStreamContent } from '../lib/serialization'
import { flattenEventContent, getCharactersIdsFromEventContent } from '../lib'
import { useLiveQuery } from 'dexie-react-hooks'
import { LibraryDatabase } from '../lib/db'

import React, { useContext, useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'
import parseToHTML, { Element } from 'html-react-parser'

import {
  VARIABLE_TYPE,
  EngineLiveEventStateCollection,
  EventCharacterPersona,
  StudioId,
  WorldId,
  ElementId
} from '../types'
import {
  gameMethods,
  getProcessedTemplate,
  getTemplateExpressions,
  parseTemplateExpressions
} from '../lib/templates'

import { EngineContext } from '../contexts/EngineContext'

import EventCharacterReference from './EventCharacterReference'
import EventImage from './EventImage'

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

    return highlightExpressions
      ? // prettier-ignore
        `<span className="${match === 'esg-error' ? `expression-error` : `expression`}" key="${`expression-${matchExpressionCounter}`}" title="${matchedExpression}">${match === 'esg-error' ? 'ERROR' : match}</span>`
      : match === 'esg-error'
      ? // prettier-ignore
        `<span className="expression-error" key="${`expression-${matchExpressionCounter}`}" title="${matchedExpression}">ERROR</span>`
      : //prettier-ignore
        `<span key="${`span-${matchExpressionCounter}`}">${match}</span>`
  })
}

const useCharacters = (studioId: StudioId, characterIds: ElementId[]) => {
  const characters = useLiveQuery(async () => {
    return await Promise.all(
      characterIds.map((id) => new LibraryDatabase(studioId).characters.get(id))
    )
  }, [flattenEventContent])

  return characters
}

const EventContent: React.FC<{
  studioId: StudioId
  worldId: WorldId
  eventId: ElementId
  content: string
  persona?: EventCharacterPersona
  state: EngineLiveEventStateCollection
}> = React.memo(({ studioId, worldId, eventId, content, persona, state }) => {
  // elmstorygames/feedback#245
  const parsedContentAsJSON = JSON.parse(content),
    referencedCharacterIds = getCharactersIdsFromEventContent(
      parsedContentAsJSON
    )

  const characters = useCharacters(studioId, referencedCharacterIds)

  const { engine } = useContext(EngineContext)

  const [parsedContent, setParsedContent] = useState<
    string | JSX.Element | JSX.Element[]
  >('')

  useEffect(() => {
    async function serializeAndParseContent() {
      if (!content || !characters) return

      const serializedContent = await eventContentToEventStreamContent(
        studioId,
        worldId,
        parsedContentAsJSON,
        engine.isComposer
      )

      setParsedContent(
        parseToHTML(
          decorate(
            serializedContent.text,
            state,
            engine.devTools.highlightExpressions
          ).join(''),
          {
            replace: (node) => {
              if (node instanceof Element && node.attribs) {
                if (node.attribs['data-type'] === 'img') {
                  return (
                    <EventImage
                      eventId={eventId}
                      assetId={node.attribs['data-asset-id']}
                    />
                  )
                }
              }

              return node
            }
          }
        )
      )
    }

    serializeAndParseContent()
  }, [content, characters])

  return (
    <div>
      {persona && <EventCharacterReference persona={persona} />}

      {/* If we wanted to render an image above the persona */}
      {/* {serializedContent?.startingElement &&
        parseToHTML(serializedContent?.startingElement)} */}

      {parsedContent}
    </div>
  )
})

EventContent.displayName = 'EventContent'

export default EventContent
