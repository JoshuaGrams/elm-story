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
  ElementId,
  EngineCharacterData
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
import EventCharacterElement from './EventCharacterElement'
import {
  CharacterElementStyleTypes,
  CharacterElementTransformType,
  EventContentNode
} from '../types/eventContentTypes'

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
  const characters = useLiveQuery(
    async () => {
      const characters = await Promise.all(
        characterIds.map((id) =>
          new LibraryDatabase(studioId).characters.get(id)
        )
      )

      return characters.filter(
        (character): character is EngineCharacterData => character !== undefined
      )
    },
    [flattenEventContent],
    undefined
  )

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
  const { engine } = useContext(EngineContext)

  let parsedContentAsJSON: EventContentNode[],
    referencedCharacterIds,
    characters

  // #PWA: also for local testing
  if (engine.isComposer) {
    // elmstorygames/feedback#245
    parsedContentAsJSON = JSON.parse(content)

    referencedCharacterIds = getCharactersIdsFromEventContent(
      parsedContentAsJSON
    )

    characters = useCharacters(studioId, referencedCharacterIds)
  }

  const [parsedContent, setParsedContent] = useState<
    string | JSX.Element | JSX.Element[]
  >('')

  useEffect(() => {
    async function serializeAndParseContent() {
      if (!content) return

      // #PWA: use this for local dev as well
      if (engine.isComposer && parsedContentAsJSON) {
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
                    const assetId =
                      node.attribs['data-asset-id'] === 'undefined'
                        ? undefined
                        : node.attribs['data-asset-id']
                    return <EventImage eventId={eventId} assetId={assetId} />
                  }

                  if (node.attribs['data-type'] === 'character') {
                    const characterId =
                        node.attribs['data-character-id'] === 'undefined'
                          ? undefined
                          : node.attribs['data-character-id'],
                      aliasId =
                        node.attribs['data-character-alias-id'] === 'undefined'
                          ? undefined
                          : node.attribs['data-character-alias-id'],
                      transform =
                        node.attribs['data-character-ref-transform'] ===
                        'undefined'
                          ? undefined
                          : node.attribs['data-character-ref-transform'],
                      styles =
                        node.attribs['data-character-ref-styles'] ===
                        'undefined'
                          ? undefined
                          : node.attribs['data-character-ref-styles'].split(',')

                    return (
                      <EventCharacterElement
                        studioId={studioId}
                        characterId={characterId}
                        aliasId={aliasId}
                        transform={
                          transform as CharacterElementTransformType | undefined
                        }
                        styles={
                          styles as CharacterElementStyleTypes | undefined
                        }
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

      // #PWA: disable full block for local dev
      if (!engine.isComposer) {
        setParsedContent(
          parseToHTML(
            decorate(content, state, engine.devTools.highlightExpressions).join(
              ''
            )
            // TODO: only if we are lazy loading images, better to show empty space
            // {
            //   replace: (node) => {
            //     if (node instanceof Element && node.attribs) {
            //       if (node.attribs['data-type'] === 'img') {
            //         const assetId =
            //           node.attribs['data-asset-id'] === 'undefined'
            //             ? undefined
            //             : node.attribs['data-asset-id']
            //         return <EventImage eventId={eventId} assetId={assetId} />
            //       }
            //     }

            //     return
            //   }
            // }
          )
        )
      }
    }

    serializeAndParseContent()
  }, [content, characters, engine.devTools])

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
