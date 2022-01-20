import logger from '../../../../lib/logger'

import {
  getCaretPosition,
  getCharacterRef
} from '../../../../lib/contentEditor'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  Character,
  CHARACTER_MASK_TYPE,
  StudioId,
  WorldId
} from '../../../../data/types'
import {
  CharacterElement,
  CharacterElementDetails,
  EventContentElement
} from '../../../../data/eventContentTypes'

import { useCharacter, useCharacters } from '../../../../hooks'

import { ReactEditor, useSlate } from 'slate-react'
import { Transforms } from 'slate'

import { UserOutlined } from '@ant-design/icons'

import Portal from '../../../Portal'
import CharacterMask from '../../../CharacterManager/CharacterMask'

import styles from './styles.module.less'

export type OnCharacterSelect = (character: Character) => void

const CharacterSelectMenu: React.FC<{
  studioId: StudioId
  worldId: WorldId
  element: EventContentElement
  show: boolean
  inputRect: DOMRect | undefined
  onCharacterSelect: OnCharacterSelect
}> = ({ studioId, worldId, show, inputRect, onCharacterSelect }) => {
  const characterSelectMenuRef = useRef<HTMLDivElement>(null)

  const characters = useCharacters(studioId, worldId, [])

  useEffect(() => {
    if (!characterSelectMenuRef.current) return

    if (show) {
      if (inputRect) {
        characterSelectMenuRef.current.style.top = `${inputRect.bottom + 6}px`
        characterSelectMenuRef.current.style.left = `${inputRect.left}px`
        characterSelectMenuRef.current.style.opacity = '1'
      }
    }

    if (!show) {
      characterSelectMenuRef.current.style.opacity = '0'
    }
  }, [show, characterSelectMenuRef.current])

  return (
    <>
      {show && (
        <Portal>
          <div
            ref={characterSelectMenuRef}
            className="event-content-character-select-menu"
          >
            <div className={styles.characters}>
              {characters?.map(
                (character) =>
                  character.id && (
                    <div
                      key={character.id}
                      className={styles.item}
                      onMouseDown={(event) => {
                        event.preventDefault()

                        onCharacterSelect(character)
                      }}
                    >
                      <CharacterMask
                        studioId={studioId}
                        worldId={character.worldId}
                        characterId={character.id}
                        type={CHARACTER_MASK_TYPE.NEUTRAL}
                        overlay={false}
                        aspectRatio="4/5"
                        active
                        assetId={
                          character.masks.find(
                            (mask) => mask.type === CHARACTER_MASK_TYPE.NEUTRAL
                          )?.assetId
                        }
                      />
                      <div className={styles.title}>{character.title}</div>
                    </div>
                  )
              )}
            </div>

            <div
              className={styles.displayFormat}
              onMouseDown={(event) => event.preventDefault()}
            >
              Display Format
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

const SelectedCharacter: React.FC<{
  studioId: StudioId
  element: CharacterElement
  selectedCharacter: CharacterElementDetails
}> = ({ studioId, element, selectedCharacter }) => {
  const character = useCharacter(studioId, selectedCharacter[0], [])

  const editor = useSlate()

  useEffect(() => {
    if (character?.id) {
      const refs = character.refs.map((ref) => ref[1])

      if (
        selectedCharacter[1] &&
        !refs.includes(selectedCharacter[1]) &&
        selectedCharacter[1] !== character.title
      ) {
        const characterElementPath = ReactEditor.findPath(editor, element)

        Transforms.setNodes(
          editor,
          {
            character: [selectedCharacter[0], null, selectedCharacter[2]]
          },
          { at: characterElementPath }
        )
      }
    }
  }, [character])

  return (
    <>
      {character !== null && (
        <>
          {character !== undefined ? (
            selectedCharacter[1] ? (
              getCharacterRef(character, selectedCharacter[1])
            ) : (
              <span style={{ cursor: 'pointer' }}>{character.title}</span>
            )
          ) : (
            <>
              <UserOutlined />
            </>
          )}
        </>
      )}

      {character === null && (
        <span style={{ background: 'red' }}>
          <UserOutlined />
        </span>
      )}
    </>
  )
}

const CharacterElementSelect: React.FC<{
  studioId: StudioId
  worldId: WorldId
  element: CharacterElement
  selectedCharacter?: CharacterElementDetails
  onCharacterSelect: OnCharacterSelect
}> = ({ studioId, worldId, element, selectedCharacter, onCharacterSelect }) => {
  const editor = useSlate()

  const inputRef = useRef<HTMLSpanElement>(null)

  const [selecting, setSelecting] = useState(false),
    [filter, setFilter] = useState(''),
    [focused, setFocused] = useState(false),
    [caretPosition, setCaretPosition] = useState(0)

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    event.preventDefault()

    if (!filter && selecting) {
      removeElement()
      logger.info('remove character element')
    }
  }

  const removeElement = useCallback(() => {
    const elementPath = ReactEditor.findPath(editor, element)

    Transforms.select(editor, elementPath)

    Transforms.removeNodes(editor, {
      at: elementPath
    })

    ReactEditor.focus(editor)
    Transforms.move(editor)
  }, [editor, element])

  useEffect(() => {
    if (inputRef.current && !selectedCharacter) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [inputRef.current])

  useEffect(() => {
    !selectedCharacter && setSelecting(true)
  }, [selectedCharacter])

  return (
    <>
      {!selectedCharacter && (
        <span
          contentEditable="true"
          suppressContentEditableWarning
          className={`${styles.CharacterSelect}`}
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Select character..."
          onSelect={() =>
            inputRef?.current &&
            setCaretPosition(getCaretPosition(inputRef.current))
          }
          onKeyDown={(event) => {
            if (event.code === 'Escape') {
              if (!filter && !selectedCharacter) {
                inputRef.current?.blur()
              }

              return
            }

            if (event.code === 'Enter') {
              event.preventDefault()

              if (!filter && !selectedCharacter) {
                inputRef.current?.blur()
              }

              return
            }

            if (event.code === 'Backspace' && !filter && !selectedCharacter) {
              event.preventDefault()

              inputRef.current?.blur()

              return
            }

            if (event.code === 'ArrowUp') {
              event.preventDefault()

              logger.info('move selection up')
            }

            if (event.code === 'ArrowDown') {
              event.preventDefault()

              logger.info('move selection down')
            }

            if (event.code === 'ArrowRight') {
              if (
                (!filter || caretPosition === filter.length) &&
                !selectedCharacter
              ) {
                event.preventDefault()

                inputRef.current?.blur()

                return
              }
            }

            if (event.code === 'ArrowLeft') {
              if (
                (!filter || (caretPosition === 0 && filter.length > 0)) &&
                !selectedCharacter
              ) {
                event.preventDefault()

                inputRef.current?.blur()

                return
              }
            }
          }}
          onInput={() => setFilter(inputRef.current?.textContent || '')}
        />
      )}

      <CharacterSelectMenu
        studioId={studioId}
        worldId={worldId}
        show={selecting && focused}
        inputRect={inputRef.current?.getBoundingClientRect()}
        element={element}
        onCharacterSelect={(character) => {
          setSelecting(false)

          setTimeout(() => onCharacterSelect(character), 0)
        }}
      />

      {selectedCharacter && (
        <SelectedCharacter
          studioId={studioId}
          element={element}
          selectedCharacter={selectedCharacter}
        />
      )}
    </>
  )
}

CharacterElementSelect.displayName = 'CharacterElementSelect'

export default CharacterElementSelect
