import React, { useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'
import parseToHTML, { Element } from 'html-react-parser'
import { useDebouncedCallback } from 'use-debounce'

import {
  gameMethods,
  getProcessedTemplate,
  getTemplateExpressions,
  parseTemplateExpressions
} from '../../../../engine/src/lib/templates'
import {
  StudioId,
  WorldId,
  WorldState,
  VARIABLE_TYPE,
  ElementId
} from '../../../data/types'

import { useCharacters, useVariables } from '../../../hooks'

import { Spin } from 'antd'
import { FormOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons'

import { eventContentToPreview } from '../../../lib/serialization'

import styles from './styles.module.less'

const processTemplateBlock = (
  template: string,
  state: WorldState
): [string, string[]] => {
  const expressions = getTemplateExpressions(template),
    variables: {
      [variableId: string]: { value: string; type: VARIABLE_TYPE }
    } = {}

  Object.entries(state).map((variable) => {
    const data = variable[1]

    variables[data.title] = {
      value: data.initialValue,
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

const decorate = (template: string, state: WorldState) => {
  const [processedTemplate, expressions] = processTemplateBlock(template, state)

  let matchExpressionCounter = 0

  return reactStringReplace(processedTemplate, /{([^}]+)}/g, (match) => {
    const matchedExpression = expressions[matchExpressionCounter]

    matchExpressionCounter++

    return `<span
        className="
          ${match === 'esg-error' ? styles.expressionError : styles.expression}
        "
        key="expression-${matchExpressionCounter}"
        title="Expression: ${matchedExpression}"
      >${match === 'esg-error' ? 'ERROR' : match}</span>`
  })
}

const EventSnippet: React.FC<{
  studioId: StudioId
  worldId: WorldId
  eventId: ElementId
  content: string
  flatBottom: boolean
  onEditPassage: (eventId: ElementId) => void
}> = ({ studioId, worldId, eventId, content, flatBottom, onEditPassage }) => {
  const variables = useVariables(studioId, worldId, []),
    characters = useCharacters(studioId, worldId, [])

  const [initialWorldState, setInitialWorldState] = useState<
      WorldState | undefined
    >(undefined),
    // undefined is loading, null is missing
    [contentPreview, setContentPreview] = useState<string | undefined | null>(
      undefined
    )

  const debouncedContentPreview = useDebouncedCallback(
    async (content, state) => {
      let newContentPreview =
        (await eventContentToPreview(studioId, worldId, content)).text || null

      if (newContentPreview) {
        newContentPreview = decorate(newContentPreview, state).join('')
      }

      setContentPreview(newContentPreview)
    },
    1000,
    { leading: true }
  )

  useEffect(() => {
    if (variables) {
      const updatedInitialGameState: WorldState = {}

      variables.map(({ id, initialValue, title, type }) => {
        if (id)
          updatedInitialGameState[id] = {
            currentValue: initialValue,
            initialValue,
            title,
            type
          }
      })

      setInitialWorldState(updatedInitialGameState)
    }
  }, [variables])

  useEffect(() => {
    initialWorldState &&
      characters &&
      debouncedContentPreview(content, initialWorldState)
  }, [content, initialWorldState, characters])

  return (
    <>
      {initialWorldState && (
        <div
          className={styles.EventSnippet}
          style={{
            borderBottomLeftRadius: flatBottom ? '0px' : '5px',
            borderBottomRightRadius: flatBottom ? '0px' : '5px'
          }}
          onDoubleClick={() => onEditPassage(eventId)}
        >
          <div
            className={`${styles.edit} nodrag`}
            onClick={() => onEditPassage(eventId)}
          >
            <FormOutlined />
          </div>
          <div
            className={`${styles.content}`}
            style={{
              borderBottomLeftRadius: flatBottom ? '0px' : '5px',
              borderBottomRightRadius: flatBottom ? '0px' : '5px'
            }}
          >
            {contentPreview &&
              parseToHTML(contentPreview, {
                replace: (node) => {
                  if (node instanceof Element && node.attribs) {
                    if (node.attribs['data-type'] === 'missing-character') {
                      const characterId =
                        node.attribs['data-character-id'] === 'undefined'
                          ? undefined
                          : node.attribs['data-character-id']
                      return (
                        <span
                          title={`Character ${characterId} not found...`}
                          style={{ background: 'var(--warning-color)' }}
                        >
                          <UserOutlined />
                        </span>
                      )
                    }
                  }

                  return node
                }
              })}

            {contentPreview === undefined && (
              <div className={styles.loadingContent}>
                <Spin
                  indicator={
                    <LoadingOutlined
                      className={styles.spin}
                      style={{ fontSize: 24 }}
                      spin
                    />
                  }
                />
              </div>
            )}

            {contentPreview === null && (
              <div className={styles.missingContent}>
                Double-click here to edit event content...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

EventSnippet.displayName = 'EventSnippet'

export default EventSnippet
