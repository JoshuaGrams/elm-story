import logger from '../../../../lib/logger'

import {
  getActiveElementType,
  getCaretPosition,
  getCharacterRef,
  getElement,
  setCaretToEnd
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
  ELEMENT_FORMATS,
  EventContentElement
} from '../../../../data/eventContentTypes'

import { useCharacter, useCharacters } from '../../../../hooks'

import { ReactEditor, useSelected, useSlate } from 'slate-react'
import { Transforms } from 'slate'

import { UserOutlined } from '@ant-design/icons'

import Portal from '../../../Portal'
import CharacterMask from '../../../CharacterManager/CharacterMask'

import styles from './styles.module.less'
import isHotkey from 'is-hotkey'

export type OnCharacterSelect = (character: Character) => void

const CharacterSelectMenu: React.FC<{
  studioId: StudioId
  characters?: Character[]
  element: EventContentElement
  show: boolean
  filter: string
  inputRect: DOMRect | undefined
  menuSelectionIndex: number
  onCharacterSelect: OnCharacterSelect
}> = ({
  studioId,
  characters,
  show,
  inputRect,
  menuSelectionIndex,
  onCharacterSelect
}) => {
  const characterSelectMenuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const elements = document.getElementsByClassName(
      'character-select-menu-item '
    )

    elements[menuSelectionIndex] &&
      elements[menuSelectionIndex].scrollIntoView({ block: 'end' })
  })

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
                (character, index) =>
                  character.id && (
                    <div
                      key={character.id}
                      className={`character-select-menu-item ${styles.item} ${
                        menuSelectionIndex === index ? styles.selected : ''
                      }`}
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
  element: CharacterElement
  character: Character | null | undefined // null = character doesn't exist
  elementCharacterData?: CharacterElementDetails
}> = ({ element, character, elementCharacterData }) => {
  const editor = useSlate()

  useEffect(() => {
    if (!elementCharacterData) return

    if (character?.id) {
      const refs = character.refs.map((ref) => ref[1])

      if (
        elementCharacterData[1] &&
        !refs.includes(elementCharacterData[1]) &&
        elementCharacterData[1] !== character.title
      ) {
        const characterElementPath = ReactEditor.findPath(editor, element)

        Transforms.setNodes(
          editor,
          {
            character: [elementCharacterData[0], null, elementCharacterData[2]]
          },
          { at: characterElementPath }
        )
      }
    }
  }, [character])

  return (
    <>
      {character !== null && elementCharacterData && (
        <>
          {character !== undefined ? (
            elementCharacterData[1] ? (
              getCharacterRef(character, elementCharacterData[1])
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
  const editor = useSlate(),
    selected = useSelected()

  const inputRef = useRef<HTMLSpanElement>(null)

  const character = useCharacter(studioId, selectedCharacter?.[0], [
      selectedCharacter
    ]),
    characters = useCharacters(studioId, worldId, [])

  const [selecting, setSelecting] = useState(false),
    [filter, setFilter] = useState(''),
    [focused, setFocused] = useState(false),
    [caretPosition, setCaretPosition] = useState(0)

  const [menuSelectionIndex, setMenuSelectionIndex] = useState(0)

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    setSelecting(false)

    event.preventDefault()

    if (!selectedCharacter) {
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

  const selectCharacter = useCallback((character: Character) => {
    setSelecting(false)

    setTimeout(() => onCharacterSelect(character), 0)
  }, [])

  useEffect(() => {
    if (inputRef.current && !selectedCharacter) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [inputRef.current])

  useEffect(() => {
    !selectedCharacter && setSelecting(true)
  }, [selectedCharacter])

  useEffect(() => {
    logger.info(`CharacterElementSelect->useEffect->selected:${selected}`)

    selectedCharacter &&
      setSelecting(
        selected &&
          character !== null &&
          getElement(editor).element?.type === ELEMENT_FORMATS.CHARACTER
      )
  }, [selected, selectedCharacter, character, editor])

  useEffect(() => {
    if (selecting && inputRef.current) {
      inputRef.current.focus()
      setCaretToEnd(inputRef.current)
    }

    if (!selecting) {
      setMenuSelectionIndex(0)
    }
  }, [selecting, inputRef.current])

  useEffect(() => {
    console.log(menuSelectionIndex)
  }, [menuSelectionIndex])

  return (
    <>
      {selecting && (
        <span
          contentEditable={true}
          suppressContentEditableWarning
          className={`${styles.CharacterSelect}`}
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Select character..."
          spellCheck={false}
          onSelect={() =>
            inputRef?.current &&
            setCaretPosition(getCaretPosition(inputRef.current))
          }
          onKeyDown={(event) => {
            console.log(event.code)
            if (event.code === 'Escape') {
              if (!filter && !selectedCharacter) {
                inputRef.current?.blur()
              }

              return
            }

            if (event.code === 'Enter') {
              event.preventDefault()

              characters && selectCharacter(characters[menuSelectionIndex])

              return
            }

            if (event.code === 'Backspace' && !filter && !selectedCharacter) {
              event.preventDefault()

              inputRef.current?.blur()

              return
            }

            if (event.code === 'ArrowUp') {
              event.preventDefault()

              if (
                selecting &&
                menuSelectionIndex > 0 &&
                characters &&
                menuSelectionIndex <= characters.length - 1
              ) {
                setMenuSelectionIndex(menuSelectionIndex - 1)
                logger.info('move selection up')
              }
            }

            if (event.code === 'ArrowDown') {
              event.preventDefault()

              if (
                selecting &&
                menuSelectionIndex >= 0 &&
                characters &&
                menuSelectionIndex < characters.length - 1
              ) {
                setMenuSelectionIndex(menuSelectionIndex + 1)
                logger.info('move selection up')
              }
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

            if (isHotkey('opt+arrowright', event)) {
              if (selectedCharacter && selecting) {
                event.preventDefault()

                console.log('move right')

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

            if (isHotkey('opt+arrowleft', event)) {
              if (selectedCharacter && selecting) {
                event.preventDefault()

                console.log('move left')

                return
              }
            }
          }}
          onInput={() => setFilter(inputRef.current?.textContent || '')}
        >
          {character?.title || ''}
        </span>
      )}

      <CharacterSelectMenu
        studioId={studioId}
        characters={characters}
        show={selecting}
        filter={filter}
        inputRect={inputRef.current?.getBoundingClientRect()}
        element={element}
        menuSelectionIndex={menuSelectionIndex}
        onCharacterSelect={selectCharacter}
      />

      {!selecting && (
        <SelectedCharacter
          element={element}
          character={character}
          elementCharacterData={selectedCharacter}
        />
      )}
    </>
  )
}

CharacterElementSelect.displayName = 'CharacterElementSelect'

export default CharacterElementSelect
