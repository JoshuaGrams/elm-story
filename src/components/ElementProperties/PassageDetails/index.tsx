import React, { useCallback, useContext, useEffect, useState } from 'react'

import {
  Character,
  CHARACTER_MASK_TYPE,
  ComponentId,
  EventPersona,
  GameId,
  Passage,
  PASSAGE_TYPE,
  StudioId
} from '../../../data/types'

import {
  useCharacters,
  useChoicesByPassageRef,
  usePassage,
  useRoutePassthroughsByPassageRef
} from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { Checkbox, Select, Divider, Button } from 'antd'
import { RollbackOutlined } from '@ant-design/icons'
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

const Persona: React.FC<{
  studioId: StudioId
  gameId: GameId
  passage: Passage
}> = React.memo(({ studioId, gameId, passage }) => {
  const characters = useCharacters(studioId, gameId, [passage.id])

  const [persona, setPersona] = useState<EventPersona | undefined>(
      passage.persona
    ),
    [selectedCharacter, setSelectedCharacter] = useState<Character | undefined>(
      undefined
    )

  const savePersonaCharacter = useCallback(
    async (characterId: ComponentId | undefined) => {
      const newPersona: EventPersona | undefined = characterId
        ? [characterId, CHARACTER_MASK_TYPE.NEUTRAL, undefined]
        : undefined

      await api().passages.savePassage(studioId, {
        ...passage,
        persona: newPersona
      })

      setPersona(newPersona)
    },
    [passage, persona]
  )

  const savePersonaMask = useCallback(
    async (maskType: CHARACTER_MASK_TYPE | undefined) => {
      const newPersona: EventPersona | undefined =
        maskType && persona ? [persona[0], maskType, persona[2]] : undefined

      await api().passages.savePassage(studioId, {
        ...passage,
        persona: newPersona
      })

      setPersona(newPersona)
    },
    [passage, persona]
  )

  const savePersonaReference = useCallback(
    async (reference?: string) => {
      const newPersona: EventPersona | undefined = persona
        ? [persona[0], persona[1], reference]
        : undefined

      await api().passages.savePassage(studioId, {
        ...passage,
        persona: newPersona
      })

      setPersona(newPersona)
    },
    [passage, persona]
  )

  useEffect(() => setPersona(passage.persona), [passage.id])

  useEffect(
    () =>
      persona &&
      setSelectedCharacter(
        characters?.find((character) => character.id === persona[0])
      ),
    [characters, persona]
  )

  useEffect(() => {
    if (selectedCharacter && persona?.[2]) {
      const foundRef = selectedCharacter.refs.find(
        (ref) =>
          (ref[0] && ref[0] === persona[2]) ||
          (!ref[0] && ref[1] === persona[2])
      )

      // reference has been removed
      !foundRef && savePersonaReference(undefined)
    }
  }, [selectedCharacter])

  return (
    <div className={styles.EventPersona}>
      <div className={styles.header}>Persona</div>

      {characters && (
        <div className={styles.contentWrapper}>
          {characters.length === 0 && (
            <div className={styles.noCharacters}>
              At least 1 story character is required to compose event persona.
            </div>
          )}

          {characters.length > 0 && (
            <>
              <Divider>
                <h2>Character</h2>
              </Divider>

              <div className={styles.selectWrapper}>
                <Select
                  value={persona?.[0]}
                  placeholder="Select character..."
                  onChange={savePersonaCharacter}
                >
                  {characters.map(
                    (character) =>
                      character.id && (
                        <Select.Option value={character.id} key={character.id}>
                          {character.title}
                        </Select.Option>
                      )
                  )}
                </Select>

                {persona?.[0] && (
                  <Button className={styles.rollBackBtn}>
                    <RollbackOutlined
                      onClick={() => savePersonaCharacter(undefined)}
                    />
                  </Button>
                )}
              </div>
            </>
          )}

          {persona?.[0] && selectedCharacter && (
            <>
              {selectedCharacter.refs.length > 0 && (
                <>
                  <Divider>
                    <h2>Reference</h2>
                  </Divider>
                  <div className={styles.selectWrapper}>
                    <Select
                      value={
                        selectedCharacter?.id === persona?.[0]
                          ? persona?.[2]
                          : undefined
                      }
                      placeholder={
                        selectedCharacter?.id === persona?.[0]
                          ? 'Select reference...'
                          : ''
                      }
                      onChange={savePersonaReference}
                    >
                      {selectedCharacter.refs.map((ref) => (
                        <Select.Option
                          value={ref[0] || ref[1]}
                          key={ref[0] || ref[1]}
                        >
                          {ref[1]}
                        </Select.Option>
                      ))}
                    </Select>

                    {persona?.[2] && (
                      <Button className={styles.rollBackBtn}>
                        <RollbackOutlined
                          onClick={() => savePersonaReference(undefined)}
                        />
                      </Button>
                    )}
                  </div>
                </>
              )}

              <Divider>
                <h2>Mask</h2>
              </Divider>

              <div className={styles.selectWrapper}>
                <Select value={persona?.[1]} onChange={savePersonaMask}>
                  {selectedCharacter?.masks.map((mask) => (
                    <Select.Option value={mask.type} key={mask.type}>
                      {mask.type}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})

Persona.displayName = 'EventPersona'

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

    // TODO: it might be necessary to check choices in the future #397
    if (
      ((choices && choices.length > 0) ||
        passage.type === PASSAGE_TYPE.INPUT) &&
      passage.gameOver &&
      editor.selectedComponentEditorSceneViewPassage === passage.id
    ) {
      disableGameEnd()
    }
  }, [choices, passage.type])

  return (
    <div className={styles.PassageEndToggle}>
      <Checkbox
        onChange={toggleGameEnd}
        checked={passage.gameOver}
        disabled={
          (!choices && !routePassthroughs) ||
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

            {passage.id && (
              <PassageEndToggle studioId={studioId} passage={passage} />
            )}

            <PassageType studioId={studioId} passage={passage} />

            <Persona
              studioId={studioId}
              gameId={passage.gameId}
              passage={passage}
            />
          </div>
        </div>
      )}
    </>
  )
})

PassageDetails.displayName = 'PassageDetails'

export default PassageDetails
