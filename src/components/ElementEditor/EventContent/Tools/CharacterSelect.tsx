import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  Character,
  CHARACTER_MASK_TYPE,
  StudioId,
  WorldId
} from '../../../../data/types'

import { useCharacters } from '../../../../hooks'

import { Input, Select } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import Portal from '../../../Portal'

import styles from './styles.module.less'
import CharacterMask from '../../../CharacterManager/CharacterMask'
import { getCaretPosition } from '../../../../lib/contentEditor'

export type OnCharacterSelect = (character: Character) => void

const CharacterSelect: React.FC<{
  studioId: StudioId
  worldId: WorldId
  onCharacterSelect: OnCharacterSelect
}> = ({ studioId, worldId, onCharacterSelect }) => {
  const inputRef = useRef<HTMLSpanElement>(null),
    characterSelectMenuRef = useRef<HTMLDivElement>(null)

  const characters = useCharacters(studioId, worldId, [])

  const [filter, setFilter] = useState(''),
    [focused, setFocused] = useState(false),
    [caretPosition, setCaretPosition] = useState(0)

  const toggleMenu = useCallback(() => {
    if (!characterSelectMenuRef.current) return

    if (focused) {
      const rect = inputRef.current?.getBoundingClientRect()

      if (rect) {
        characterSelectMenuRef.current.style.display = 'block'
        characterSelectMenuRef.current.style.top = `${rect.bottom + 6}px`
        characterSelectMenuRef.current.style.left = `${rect.left}px`
        characterSelectMenuRef.current.style.opacity = '1'
      }
    }

    if (!focused) {
      // setTimeout(
      //   () => (characterSelectMenuRef.current.style.display = 'none'),
      //   200
      // )
      characterSelectMenuRef.current.style.opacity = '0'
    }
  }, [focused, inputRef.current, characterSelectMenuRef.current])

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    event.preventDefault()

    if (!inputRef.current?.textContent) {
      console.log('remove character element')
    }
  }

  const saveCaretIndex = () => {
    if (!inputRef.current) return

    setCaretPosition(getCaretPosition(inputRef.current))
  }

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [inputRef.current])

  useEffect(() => {
    toggleMenu()
  }, [focused])

  useEffect(() => {
    console.log(characters)
  }, [characters])

  return (
    <>
      <span
        contentEditable="true"
        suppressContentEditableWarning
        className={`${styles.CharacterSelect} ${
          !characters ? styles.disabled : ''
        }`}
        ref={inputRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Select character..."
        onSelect={() => saveCaretIndex()}
        onKeyDown={(event) => {
          console.log(event.code)

          if (event.code === 'Enter') {
            event.preventDefault()

            inputRef.current?.blur()
          }

          if (
            event.code === 'Backspace' &&
            inputRef.current?.textContent?.length === 0
          ) {
            event.preventDefault()

            inputRef.current?.blur()
          }

          if (event.code === 'ArrowUp') {
            event.preventDefault()

            console.log('move selection up')
          }

          if (event.code === 'ArrowDown') {
            event.preventDefault()

            console.log('move selection down')
          }

          if (event.code === 'ArrowRight') {
            if (filter.length === 0 || caretPosition === filter.length) {
              console.log(
                'move caret out to the right and remove element if character not selected'
              )

              return
            }
          }

          if (event.code === 'ArrowLeft') {
            if (
              filter.length === 0 ||
              (caretPosition === 0 && filter.length > 0)
            ) {
              console.log(
                'move caret out to the left and remove element if character not selected'
              )

              return
            }
          }
        }}
        onInput={() => setFilter(inputRef.current?.textContent || '')}
      />

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
                    onClick={() => onCharacterSelect(character)}
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

          <div className={styles.displayFormat}>Display Format</div>
        </div>
      </Portal>
    </>
  )
}

CharacterSelect.displayName = 'CharacterSelect'

export default CharacterSelect
