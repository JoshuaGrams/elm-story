import logger from '../../../../lib/logger'
import isHotkey from 'is-hotkey'

import {
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

import { Dropdown, Menu } from 'antd'
import {
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined
} from '@ant-design/icons'

import Portal from '../../../Portal'
import CharacterMask from '../../../CharacterManager/CharacterMask'

import styles from './styles.module.less'

export type OnCharacterSelect = (
  character: Character | null,
  remove?: boolean
) => void

// [which menu (0 titles, 1 alias), [title menu index, alias menu index]]
type MenuType = 'TITLE' | 'ALIAS'

interface MenuSelection {
  type: MenuType
  selection: [number, number]
}

const CharacterTitleMenu: React.FC<{
  studioId: StudioId
  characters: Character[]
  currentSelection: number
  onCharacterSelect: OnCharacterSelect
  onRefDrillDown: (characterIndex: number) => void
}> = ({
  studioId,
  characters,
  currentSelection,
  onCharacterSelect,
  onRefDrillDown
}) => {
  return (
    <>
      {characters?.map(
        (character, index) =>
          character.id && (
            <div
              key={character.id}
              className={`character-select-menu-item ${styles.item} ${
                currentSelection === index ? styles.selected : ''
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

              <div className={styles.title} title={character.title}>
                {character.title}
              </div>

              <div
                className={`${styles.aliases}  ${
                  character.refs.length === 0 ? styles.disabled : ''
                }`}
                onMouseDown={(event) => {
                  event.stopPropagation()
                  event.preventDefault()

                  if (character.refs.length === 0) return

                  onRefDrillDown(index)
                }}
              >
                <RightOutlined />
              </div>
            </div>
          )
      )}
    </>
  )
}

const CharacterAliasMenu: React.FC<{
  character: Character
  onBack: () => void
}> = ({ character, onBack }) => {
  return (
    <>
      {character.id && (
        <div>
          <div>
            <LeftOutlined
              onMouseDown={(event) => {
                event.stopPropagation()
                event.preventDefault()

                onBack()
              }}
            />{' '}
            {character.title}
          </div>
          {character.refs.map((ref) => (
            <div key={ref[0]}>{ref[1]}</div>
          ))}
        </div>
      )}
    </>
  )
}

const CharacterSelectMenu: React.FC<{
  studioId: StudioId
  characters?: Character[]
  element: EventContentElement
  show: boolean
  filter: string
  inputRect: DOMRect | undefined
  menuSelection: MenuSelection
  elementCharacterData?: CharacterElementDetails
  onCharacterSelect: OnCharacterSelect
  onMenuSelection: (selection: MenuSelection) => void
}> = ({
  studioId,
  characters,
  show,
  inputRect,
  menuSelection,
  elementCharacterData,
  onCharacterSelect,
  onMenuSelection
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

    elements[menuSelection.selection[0]] &&
      elements[menuSelection.selection[0]].scrollIntoView({ block: 'end' })
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
              {characters && (
                <>
                  {menuSelection.type === 'TITLE' && (
                    <CharacterTitleMenu
                      studioId={studioId}
                      characters={characters}
                      currentSelection={menuSelection.selection[0]}
                      onCharacterSelect={onCharacterSelect}
                      onRefDrillDown={(characterIndex) => {
                        onMenuSelection({
                          type: 'ALIAS',
                          selection: [menuSelection.selection[0], 0]
                        })
                      }}
                    />
                  )}

                  {menuSelection.type === 'ALIAS' && (
                    <CharacterAliasMenu
                      character={characters[menuSelection.selection[0]]}
                      onBack={() => {
                        onMenuSelection({
                          type: 'TITLE',
                          selection: [menuSelection.selection[0], 0]
                        })
                      }}
                    />
                  )}
                </>
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
  onClick: (reset?: boolean) => void
  onRemove: () => void
}> = ({ element, character, elementCharacterData, onClick, onRemove }) => {
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
    <Dropdown
      disabled={character === undefined}
      overlay={
        <Menu>
          <Menu.Item onClick={onRemove}>Remove Reference</Menu.Item>
        </Menu>
      }
      trigger={['contextMenu']}
    >
      <span>
        {character !== null && elementCharacterData && (
          <>
            {character !== undefined ? (
              elementCharacterData[1] ? (
                getCharacterRef(character, elementCharacterData[1])
              ) : (
                <span style={{ cursor: 'pointer' }} onClick={() => onClick()}>
                  {character.title}
                </span>
              )
            ) : (
              <>
                <UserOutlined />
              </>
            )}
          </>
        )}

        {character === null && (
          <span style={{ background: 'red', cursor: 'pointer' }}>
            <UserOutlined onClick={() => onClick(true)} />
          </span>
        )}
      </span>
    </Dropdown>
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

  const [menuSelection, setMenuSelection] = useState<MenuSelection>({
    type: 'TITLE',
    selection: [0, 0]
  })

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    setFocused(true)

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

  const selectCharacter = useCallback((character: Character | null) => {
    setSelecting(false)

    setTimeout(() => onCharacterSelect(character), 0)
  }, [])

  useEffect(() => {
    if (inputRef.current && !selectedCharacter) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [inputRef.current])

  const resetMenuSelection = useCallback(() => {
    if (!selectedCharacter) return

    const foundCharacterIndex = characters
      ? characters.findIndex(
          (character) => selectedCharacter[0] === character?.id
        )
      : -1

    setMenuSelection({
      type: 'TITLE',
      selection: [foundCharacterIndex !== -1 ? foundCharacterIndex : 0, 0]
    })
  }, [selectedCharacter, characters])

  useEffect(() => {
    !selectedCharacter && setSelecting(true)
  }, [selectedCharacter])

  useEffect(() => {
    logger.info(`CharacterElementSelect->useEffect->selected:${selected}`)

    if (selectedCharacter) {
      resetMenuSelection()

      setSelecting(
        selected &&
          getElement(editor).element?.type === ELEMENT_FORMATS.CHARACTER
      )
    }
  }, [selected, selectedCharacter, character, editor])

  useEffect(() => {
    if (selecting && inputRef.current) {
      inputRef.current.focus()
      setCaretToEnd(inputRef.current)
    }
  }, [selecting, inputRef.current])

  useEffect(() => {
    const foundCharacterIndex = characters
      ? characters.findIndex((character) => {
          const filterLower = filter.toLowerCase(),
            characterTitleLower = character.title.toLowerCase()

          return (
            filterLower.charAt(0) === characterTitleLower.charAt(0) &&
            characterTitleLower.includes(filterLower)
          )
        })
      : -1

    foundCharacterIndex !== -1 &&
      setMenuSelection({ type: 'TITLE', selection: [foundCharacterIndex, 0] })
  }, [filter])

  useEffect(() => {
    focused && resetMenuSelection()
  }, [focused])

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

              characters &&
                selectCharacter(characters[menuSelection.selection[0]])

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
                menuSelection.selection[0] > 0 &&
                characters &&
                menuSelection.selection[0] <= characters.length - 1
              ) {
                setMenuSelection({
                  ...menuSelection,
                  selection: [menuSelection.selection[0] - 1, 0]
                })
                logger.info('move selection up')
              }
            }

            if (event.code === 'ArrowDown') {
              event.preventDefault()

              if (
                selecting &&
                menuSelection.selection[0] >= 0 &&
                characters &&
                menuSelection.selection[0] < characters.length - 1
              ) {
                setMenuSelection({
                  ...menuSelection,
                  selection: [menuSelection.selection[0] + 1, 0]
                })
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

            if (isHotkey('opt+ArrowRight', event)) {
              if (selectedCharacter && selecting) {
                event.preventDefault()

                characters &&
                  characters[menuSelection.selection[0]].refs.length > 0 &&
                  setMenuSelection({ ...menuSelection, type: 'ALIAS' })

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

            if (isHotkey('opt+ArrowLeft', event)) {
              if (selectedCharacter && selecting) {
                event.preventDefault()

                setMenuSelection({ ...menuSelection, type: 'TITLE' })

                console.log('move left')

                return
              }
            }
          }}
          onInput={() => {
            setFilter(inputRef.current?.textContent || '')
          }}
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
        menuSelection={menuSelection}
        elementCharacterData={selectedCharacter}
        onCharacterSelect={selectCharacter}
        onMenuSelection={(selection) => setMenuSelection(selection)}
      />

      {!selecting && (
        <SelectedCharacter
          element={element}
          character={character}
          elementCharacterData={selectedCharacter}
          onClick={() => {
            setSelecting(true)

            // TODO: this is only if designers decide they want ES to make this choice
            // See useEffect for selected to also adjust to match
            // !reset && setSelecting(true)
            // reset && onCharacterSelect(null)
          }}
          onRemove={() => {
            onCharacterSelect(null, true)
          }}
        />
      )}
    </>
  )
}

CharacterElementSelect.displayName = 'CharacterElementSelect'

export default CharacterElementSelect
