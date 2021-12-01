import React, { useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'

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
  VARIABLE_TYPE
} from '../../../data/types'

import { useVariables } from '../../../hooks'

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

const PassageSnippet: React.FC<{
  studioId: StudioId
  worldId: WorldId
  content: string
  onEditPassage: () => void
}> = ({ studioId, worldId, content, onEditPassage }) => {
  const variables = useVariables(studioId, worldId, [])

  const [initialGameState, setInitialGameState] = useState<
    WorldState | undefined
  >(undefined)

  const parsedContent: {
    type: 'paragraph'
    children: { text: string }[]
  }[] = JSON.parse(content)

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

      setInitialGameState(updatedInitialGameState)
    }
  }, [variables])

  return (
    <div className={styles.PassageSnippet} onDoubleClick={onEditPassage}>
      {initialGameState && parsedContent[0].children[0].text && (
        <>
          <p>
            {decorate(parsedContent[0].children[0].text, initialGameState)}
            {parsedContent.length > 1 && (
              <span className={styles.moreContent}> ...</span>
            )}
          </p>
        </>
      )}
    </div>
  )
}

PassageSnippet.displayName = 'PassageSnippet'

export default PassageSnippet
