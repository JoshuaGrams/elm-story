import React, { useCallback, useContext, useEffect, useState } from 'react'

import {
  ComponentId,
  GameId,
  Input,
  Passage,
  PASSAGE_TYPE,
  StudioId
} from '../../../data/types'

import { useInput, usePassage, useVariables } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { Select } from 'antd'

import ComponentTitle from '../ComponentTitle'

import parentStyles from '../styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

const VariableSelectForInput: React.FC<{
  studioId: StudioId
  gameId: GameId
  inputId: ComponentId
}> = ({ studioId, gameId, inputId }) => {
  const input = useInput(studioId, inputId, [studioId, inputId]),
    variables = useVariables(studioId, gameId, [studioId, gameId])

  const changeInput = useCallback(
    async (variableId: ComponentId) => {
      if (input?.id)
        await api().inputs.saveVariableRefToInput(
          studioId,
          input.id,
          variableId
        )
    },
    [studioId, input?.id]
  )

  return (
    <>
      {variables && variables.length > 0 && (
        <>
          <Select
            className={`${styles.select} ${styles.inputVariable}`}
            style={{
              borderBottom: !input?.variableId
                ? '1px solid hsl(0, 0%, 15%)'
                : 'none'
            }}
            value={input?.variableId}
            placeholder={'Select Input Variable'}
            onChange={changeInput}
          >
            {variables.map(
              (variable) =>
                variable.id && (
                  <Select.Option value={variable.id} key={variable.id}>
                    {variable.title}
                  </Select.Option>
                )
            )}
          </Select>

          {!input?.variableId && (
            <div className={styles.warningMessage}>
              Variable selection is required for passage input.
            </div>
          )}
        </>
      )}

      {variables && variables.length === 0 && (
        <div className={styles.warningMessage}>
          At least 1 game variable is required for passage input.
        </div>
      )}
    </>
  )
}

const PassageType: React.FC<{
  studioId: StudioId
  passage: Passage
}> = ({ studioId, passage }) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  const [input, setInput] = useState<Input | undefined>(undefined)

  const changeType = useCallback(
    async (type: PASSAGE_TYPE) => {
      if (passage.id) {
        // Change to input
        if (
          passage.type === PASSAGE_TYPE.CHOICE &&
          type === PASSAGE_TYPE.INPUT
        ) {
          editor.selectedGameOutlineComponent.id === passage.sceneId &&
            editorDispatch({
              type:
                EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE,
              selectedComponentEditorSceneViewChoice: null
            })

          if (passage.choices)
            await Promise.all([
              passage.choices.map(
                async (choiceId) =>
                  await api().choices.removeChoice(studioId, choiceId)
              ),
              api().passages.saveChoiceRefsToPassage(studioId, passage.id, []),
              api().passages.savePassageType(
                studioId,
                passage.id,
                PASSAGE_TYPE.INPUT
              )
            ])

          const input = await api().inputs.saveInput(studioId, {
            gameId: passage.gameId,
            passageId: passage.id,
            tags: [],
            title: 'Untitled Input',
            variableId: undefined
          })

          input.id &&
            (await api().passages.savePassageInput(
              studioId,
              passage.id,
              input.id
            ))
        }

        // Change to choice
        if (
          passage.type === PASSAGE_TYPE.INPUT &&
          type === PASSAGE_TYPE.CHOICE
        ) {
          // It will be necessary to remove input and associated routes
          if (passage.input)
            await Promise.all([
              api().inputs.removeInput(studioId, passage.input),
              api().passages.savePassageInput(studioId, passage.id, undefined),
              api().passages.savePassageType(
                studioId,
                passage.id,
                PASSAGE_TYPE.CHOICE
              )
            ])
        }
      }
    },
    [studioId, passage.type, passage.choices]
  )

  useEffect(() => {
    async function getInput() {
      setInput(
        passage.input
          ? await api().inputs.getInput(studioId, passage.input)
          : undefined
      )
    }

    getInput()
  }, [passage.input])

  return (
    <div className={styles.PassageType}>
      <div className={styles.header}>Type</div>
      <Select
        value={passage.type}
        onChange={changeType}
        className={`${styles.select} ${
          passage.type === PASSAGE_TYPE.CHOICE ? styles.choice : ''
        }`}
      >
        <Select.Option value={PASSAGE_TYPE.CHOICE} key="choice">
          Choice
        </Select.Option>
        <Select.Option value={PASSAGE_TYPE.INPUT} key="input">
          Input
        </Select.Option>
      </Select>

      {passage.type === PASSAGE_TYPE.INPUT && input?.id && (
        <VariableSelectForInput
          studioId={studioId}
          gameId={passage.gameId}
          inputId={input.id}
        />
      )}
    </div>
  )
}

const PassageDetails: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId, [passageId])

  const { editorDispatch } = useContext(EditorContext)

  return (
    <>
      {passage && (
        <div
          className={`${parentStyles.componentDetailViewWrapper} ${styles.PassageDetails}`}
        >
          <div className={parentStyles.content}>
            <ComponentTitle
              title={passage.title}
              onUpdate={async (title) => {
                if (passage.id) {
                  await api().passages.savePassage(studioId, {
                    ...(await api().passages.getPassage(studioId, passage.id)),
                    title
                  })

                  editorDispatch({
                    type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                    renamedComponent: {
                      id: passage.id,
                      newTitle: title
                    }
                  })
                }
              }}
            />
            <div className={parentStyles.componentId}>{passage.id}</div>
            <PassageType studioId={studioId} passage={passage} />
          </div>
        </div>
      )}
    </>
  )
}

export default PassageDetails
