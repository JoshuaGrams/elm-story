import React, { useCallback, useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'
import parseToHTML from 'html-react-parser'
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

import { useVariables } from '../../../hooks'

import { FormOutlined } from '@ant-design/icons'

import styles from './styles.module.less'
import { eventContentToPreview } from '../../../lib/serialization'
import { debounce } from 'lodash'

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

    return (
      <span
        className={
          match === 'esg-error' ? styles.expressionError : styles.expression
        }
        key={`expression-${matchExpressionCounter}`}
        title={matchedExpression}
      >
        {match === 'esg-error' ? 'ERROR' : match}
      </span>
    )
  })
}

const EventSnippet: React.FC<{
  studioId: StudioId
  worldId: WorldId
  eventId: ElementId
  content: string
  onEditPassage: (eventId: ElementId) => void
}> = ({ studioId, worldId, eventId, content, onEditPassage }) => {
  const variables = useVariables(studioId, worldId, [])

  const [initialWorldState, setInitialWorldState] = useState<
      WorldState | undefined
    >(undefined),
    [contentPreview, setContentPreview] = useState<string | undefined>(
      undefined
    )

  const parsedContent: {
    type: 'paragraph'
    children: { text: string }[]
  }[] = JSON.parse(content)

  const debouncedContentPreview = useDebouncedCallback(async (content) => {
    setContentPreview(
      (await eventContentToPreview(studioId, content)).text || undefined
    )
  }, 1000)

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

  const test = useCallback(async () => {
    console.log('test2')
    debounce(
      () => {
        console.log('test')
        setContentPreview(
          'plop'
          // (await eventContentToPreview(studioId, content)).text || undefined
        )
      },
      1000,
      { leading: true }
    )
  }, [content])

  useEffect(() => {
    debouncedContentPreview(content)
  }, [content])

  useEffect(() => {
    console.log(contentPreview)
  }, [contentPreview])

  return (
    <>
      {initialWorldState && (
        <div
          className={styles.EventSnippet}
          onDoubleClick={() => onEditPassage(eventId)}
        >
          <div
            className={`${styles.edit} nodrag`}
            onClick={() => onEditPassage(eventId)}
          >
            <FormOutlined />
          </div>
          <div className={`${styles.content} nodrag`}>
            {contentPreview && parseToHTML(contentPreview)}

            {!contentPreview && !debouncedContentPreview.isPending() && (
              <p className={styles.missingContent}>Missing content...</p>
            )}
          </div>

          {/* {parsedContent[0].children[0].text && (
            <p>
              {decorate(
                parsedContent[0].children[0].text.substring(0, 100),
                initialWorldState
              )}
              {parsedContent[0].children[0].text.length > 100 && '...'}{' '}
            </p>
          )}

          {!parsedContent[0].children[0].text && parsedContent.length === 1 && (
            <p className={styles.missingContent}>Missing content...</p>
          )} */}
        </div>
      )}
    </>
  )
}

EventSnippet.displayName = 'EventSnippet'

export default EventSnippet
