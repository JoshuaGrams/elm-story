import React, { useCallback, useContext, useEffect } from 'react'

import {
  ComponentId,
  Passage,
  PASSAGE_TYPE,
  StudioId
} from '../../../data/types'

import {
  useChoicesByPassageRef,
  usePassage,
  useRoutePassthroughsByPassageRef
} from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { Checkbox, Select } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import ComponentTitle from '../ComponentTitle'

import parentStyles from '../styles.module.less'
import styles from './styles.module.less'

import api from '../../../api'

const PassageType: React.FC<{
  studioId: StudioId
  passage: Passage
}> = React.memo(({ studioId, passage }) => {
  const { editor, editorDispatch } = useContext(EditorContext)

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

          await api().passages.switchPassageFromChoiceToInputType(
            studioId,
            passage
          )
        }

        // Change to choice
        if (
          passage.type === PASSAGE_TYPE.INPUT &&
          type === PASSAGE_TYPE.CHOICE
        ) {
          // It will be necessary to remove input and associated routes
          if (passage.input)
            await api().passages.switchPassageFromInputToChoiceType(
              studioId,
              passage
            )
        }
      }
    },
    [studioId, passage.type, passage.choices]
  )

  return (
    <div className={styles.PassageType}>
      <div className={styles.header}>Type</div>
      <Select
        value={passage.type}
        onChange={changeType}
        className={styles.select}
      >
        <Select.Option value={PASSAGE_TYPE.CHOICE} key="choice">
          Choice
        </Select.Option>
        <Select.Option value={PASSAGE_TYPE.INPUT} key="input">
          Input
        </Select.Option>
      </Select>
    </div>
  )
})

PassageType.displayName = 'PassageType'

const PassageEndToggle: React.FC<{
  studioId: StudioId
  passage: Passage
}> = React.memo(({ studioId, passage }) => {
  const { editor } = useContext(EditorContext)

  const choices = useChoicesByPassageRef(studioId, passage.id, [passage]),
    routePassthroughs = useRoutePassthroughsByPassageRef(studioId, passage.id, [
      passage
    ])

  const toggleGameEnd = async (event: CheckboxChangeEvent) => {
    passage.id &&
      (await api().passages.setPassageGameEnd(
        studioId,
        passage.id,
        event.target.checked
      ))
  }

  useEffect(() => {
    async function disableGameEnd() {
      passage.id &&
        (await api().passages.setPassageGameEnd(studioId, passage.id, false))
    }

    if (
      ((choices && choices.length > 0) ||
        (routePassthroughs && routePassthroughs.length > 0) ||
        passage.type === PASSAGE_TYPE.INPUT) &&
      passage.gameOver &&
      editor.selectedComponentEditorSceneViewPassage === passage.id
    ) {
      disableGameEnd()
    }
  }, [choices, routePassthroughs, passage.type])

  return (
    <div className={styles.PassageEndToggle}>
      <Checkbox
        onChange={toggleGameEnd}
        checked={passage.gameOver}
        disabled={
          (choices && choices.length > 0) ||
          (routePassthroughs && routePassthroughs.length > 0) ||
          passage.type === PASSAGE_TYPE.INPUT
        }
      >
        Entering Passage Ends Game
      </Checkbox>
    </div>
  )
})

PassageEndToggle.displayName = 'PassageEndToggle'

const PassageDetails: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = React.memo(({ studioId, passageId }) => {
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

            {passage.id && (
              <PassageEndToggle studioId={studioId} passage={passage} />
            )}
          </div>
        </div>
      )}
    </>
  )
})

PassageDetails.displayName = 'PassageDetails'

export default PassageDetails
