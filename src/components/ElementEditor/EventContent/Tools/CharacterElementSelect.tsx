import logger from '../../../../lib/logger'
import isHotkey from 'is-hotkey'

import { createGenericCharacter } from '../../../../lib/characters'

import {
  formatCharacterRefDisplay,
  getCaretPosition,
  getCharacterAliasOrTitle,
  getElement,
  setCaretToEnd
} from '../../../../lib/contentEditor'

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

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

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../../contexts/ComposerContext'

import { ReactEditor, useSelected, useSlate } from 'slate-react'
import { Transforms } from 'slate'

import { Button, Dropdown, Menu, Popover } from 'antd'
import { LeftOutlined, RightOutlined, UserOutlined } from '@ant-design/icons'

import Portal from '../../../Portal'
import CharacterMask from '../../../CharacterManager/CharacterMask'

import styles from './styles.module.less'

export type OnCharacterSelect = (
  character: CharacterElementDetails | null,
  remove?: boolean
) => void

// [which menu, [title menu index, alias menu index]]
type MenuType = 'TITLE' | 'ALIAS' | 'FORMAT'

interface MenuSelection {
  type: MenuType
  selection: [number, number]
}

const scrollMenuItemIntoView = (elementClassName: string, index: number) => {
  const elements = document.getElementsByClassName(elementClassName)

  elements[index] && elements[index].scrollIntoView({ block: 'end' })
}

const CharacterTitleMenu: React.FC<{
  studioId: StudioId
  characters: Character[]
  currentSelection: number
  elementCharacterData?: CharacterElementDetails
  onCharacterSelect: OnCharacterSelect
  onRefDrillDown: (characterIndex: number) => void
}> = ({
  studioId,
  characters,
  currentSelection,
  elementCharacterData,
  onCharacterSelect,
  onRefDrillDown
}) => {
  useEffect(() =>
    scrollMenuItemIntoView('character-select-menu-title-item', currentSelection)
  )

  return (
    <div className={styles.CharacterTitleMenu}>
      {characters?.map(
        (character, index) =>
          character.id && (
            <div
              key={character.id}
              className={`character-select-menu-title-item ${styles.item} ${
                currentSelection === index ? styles.selected : ''
              }`}
              onMouseDown={(event) => {
                event.preventDefault()

                character.id &&
                  onCharacterSelect({
                    character_id: character.id,
                    format: elementCharacterData?.format || 'cap'
                  })
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
                {formatCharacterRefDisplay(
                  character.title,
                  elementCharacterData?.format
                )}
              </div>

              <div
                className={`${styles.aliasesDrillDown}  ${
                  character.refs.length === 0 ? styles.disabled : ''
                }`}
                onMouseDown={(event) => {
                  if (character.refs.length === 0) return

                  event.stopPropagation()
                  event.preventDefault()

                  onRefDrillDown(index)
                }}
              >
                <RightOutlined />
              </div>
            </div>
          )
      )}
    </div>
  )
}

CharacterTitleMenu.displayName = 'CharacterTitleMenu'

const CharacterAliasMenu: React.FC<{
  character: Character
  currentSelection: number
  elementCharacterData?: CharacterElementDetails
  onCharacterSelect: OnCharacterSelect
  onBack: () => void
}> = ({
  character,
  currentSelection,
  elementCharacterData,
  onCharacterSelect,
  onBack
}) => {
  useEffect(() =>
    scrollMenuItemIntoView('character-select-menu-alias-item', currentSelection)
  )

  return (
    <div className={styles.CharacterAliasMenu}>
      {character.id && (
        <>
          <div
            className={styles.titleBar}
            onMouseDown={(event) => {
              event.stopPropagation()
              event.preventDefault()

              onBack()
            }}
          >
            <LeftOutlined className={styles.back} />
            <span className={styles.title}>{character.title}</span>
          </div>

          <div>
            {character.refs.map((ref, index) => (
              <div
                key={ref[0]}
                className={`character-select-menu-alias-item ${styles.item} ${
                  currentSelection === index ? styles.selected : ''
                }`}
                style={{
                  gridTemplateColumns: 'auto'
                }}
                onMouseDown={(event) => {
                  event.preventDefault()

                  character.id &&
                    onCharacterSelect({
                      character_id: character.id,
                      alias_id: character.refs[index][0],
                      format: elementCharacterData?.format || 'cap'
                    })
                }}
              >
                <div className={styles.alias}>
                  {formatCharacterRefDisplay(
                    ref[1],
                    elementCharacterData?.format
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

CharacterAliasMenu.displayName = 'CharacterAliasMenu'

const DisplayFormat: React.FC<{
  elementCharacterData?: CharacterElementDetails
  onCharacterSelect: OnCharacterSelect
}> = ({ onCharacterSelect, elementCharacterData }) => {
  return (
    <div
      className={styles.DisplayFormat}
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className={styles.options}>
        <div
          className={
            elementCharacterData?.format === 'cap' ? styles.active : ''
          }
          onMouseDown={(event) => {
            event.preventDefault()

            onCharacterSelect({ ...elementCharacterData, format: 'cap' })
          }}
        >
          Cap
        </div>{' '}
        <div
          className={
            elementCharacterData?.format === 'lower' ? styles.active : ''
          }
          onMouseDown={() =>
            onCharacterSelect({ ...elementCharacterData, format: 'lower' })
          }
        >
          lower
        </div>{' '}
        <div
          className={
            elementCharacterData?.format === 'upper' ? styles.active : ''
          }
          onMouseDown={() =>
            onCharacterSelect({ ...elementCharacterData, format: 'upper' })
          }
        >
          UPPER
        </div>
      </div>
    </div>
  )
}

DisplayFormat.displayName = 'DisplayFormat'

const CharacterSelectMenu: React.FC<{
  studioId: StudioId
  worldId: WorldId
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
  worldId,
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
    // elmstorygames/feedback#211
    async function createCharacter() {
      await createGenericCharacter(studioId, worldId)
    }

    if (characters?.length === 0 && show) createCharacter()
  }, [characters, show])

  return (
    <>
      {show && (
        <Portal>
          <div
            ref={characterSelectMenuRef}
            className="event-content-character-select-menu"
          >
            <div className={styles.menus}>
              {characters && (
                <>
                  {menuSelection.type === 'TITLE' && (
                    <CharacterTitleMenu
                      studioId={studioId}
                      characters={characters}
                      currentSelection={menuSelection.selection[0]}
                      elementCharacterData={elementCharacterData}
                      onCharacterSelect={onCharacterSelect}
                      onRefDrillDown={(characterIndex) => {
                        onMenuSelection({
                          type: 'ALIAS',
                          selection: [
                            characterIndex,
                            menuSelection.selection[1]
                          ]
                        })
                      }}
                    />
                  )}

                  {menuSelection.type === 'ALIAS' && (
                    <CharacterAliasMenu
                      character={characters[menuSelection.selection[0]]}
                      currentSelection={menuSelection.selection[1]}
                      elementCharacterData={elementCharacterData}
                      onCharacterSelect={onCharacterSelect}
                      onBack={() => {
                        onMenuSelection({
                          type: 'TITLE',
                          selection: menuSelection.selection
                        })
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {elementCharacterData && (
              <DisplayFormat
                elementCharacterData={elementCharacterData}
                onCharacterSelect={onCharacterSelect}
              />
            )}
          </div>
        </Portal>
      )}
    </>
  )
}

const SelectedCharacter: React.FC<{
  studioId: StudioId
  element: CharacterElement
  character: Character | null | undefined // null = character doesn't exist
  elementCharacterData?: CharacterElementDetails
  onClick: (reset?: boolean) => void
  onRemove: () => void
}> = ({
  studioId,
  element,
  character,
  elementCharacterData,
  onClick,
  onRemove
}) => {
  // const editor = useSlate()

  const { composer, composerDispatch } = useContext(ComposerContext)

  const aliasOrTitle =
    character && elementCharacterData
      ? getCharacterAliasOrTitle(character, elementCharacterData.alias_id)
      : undefined

  const [popoverVisible, setPopoverVisible] = useState(false)

  // TODO: we don't want to change designer's data unless this gets requested enough
  // note we would also need to do this when character title or ref is removed and
  // event content editor is not open
  // useEffect(() => {
  //   if (!elementCharacterData) return

  //   if (character?.id) {
  //     const foundAlias = character.refs.find(
  //       (ref) => ref[0] === elementCharacterData.alias_id
  //     )

  //     if (elementCharacterData.alias_id && !foundAlias) {
  //       const characterElementPath = ReactEditor.findPath(editor, element)

  //       Transforms.setNodes(
  //         editor,
  //         {
  //           character_id: elementCharacterData.character_id,
  //           alias_id: undefined,
  //           format: elementCharacterData.format
  //         },
  //         { at: characterElementPath }
  //       )
  //     }
  //   }
  // }, [character])

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
      <Popover
        style={{ margin: 0, padding: 0 }}
        overlayClassName="es-character-element-select__popover"
        visible={popoverVisible}
        onVisibleChange={(visible) => setPopoverVisible(visible)}
        content={
          <div
            className={styles.container}
            // elmstorygames/feedback#213
            style={{ display: character ? 'grid' : 'block' }}
            onClick={() => {
              setPopoverVisible(false)

              // elmstorygames/feedback#213
              if (!character) {
                onRemove()
                return
              }

              character?.id &&
                composerDispatch({
                  type: COMPOSER_ACTION_TYPE.OPEN_CHARACTER_MODAL,
                  characterId: character.id
                })
            }}
          >
            {character?.id && (
              <>
                <CharacterMask
                  studioId={studioId}
                  worldId={character.worldId}
                  characterId={character.id}
                  type={CHARACTER_MASK_TYPE.NEUTRAL}
                  overlay={false}
                  fill
                  aspectRatio="4/5"
                  active
                  assetId={
                    character.masks.find(
                      (mask) => mask.type === CHARACTER_MASK_TYPE.NEUTRAL
                    )?.assetId
                  }
                />

                <div className={styles.title}>{character.title}</div>
              </>
            )}

            {/* elmstorygames/feedback#213 */}
            {!character && (
              <div className={`${styles.title} ${styles.notFound}`}>
                Character <code>{element.character_id}</code> not found...
              </div>
            )}
          </div>
        }
        destroyTooltipOnHide
      >
        <span>
          {character !== null && elementCharacterData?.character_id && (
            <>
              {character !== undefined && aliasOrTitle && (
                <span style={{ cursor: 'pointer' }} onClick={() => onClick()}>
                  {formatCharacterRefDisplay(
                    aliasOrTitle,
                    elementCharacterData.format
                  )}
                </span>
              )}
            </>
          )}

          {(character === null ||
            (character !== undefined &&
              elementCharacterData?.alias_id &&
              aliasOrTitle === null)) && (
            <span style={{ background: 'red', cursor: 'pointer' }}>
              <UserOutlined onClick={() => onClick(true)} />
            </span>
          )}
        </span>
      </Popover>
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

  const character = useCharacter(studioId, selectedCharacter?.character_id, [
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

  const selectCharacter = (character: CharacterElementDetails | null) => {
    setSelecting(false)

    setTimeout(() => onCharacterSelect(character), 100)
  }

  useEffect(() => {
    if (inputRef.current && !selectedCharacter) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [inputRef.current])

  const resetMenuSelection = useCallback(() => {
    if (!selectedCharacter) return

    const foundCharacterIndex = characters
        ? characters.findIndex(
            (character) => selectedCharacter.character_id === character?.id
          )
        : -1,
      foundAliasIndex = characters
        ? characters[foundCharacterIndex]?.refs.findIndex(
            (ref) => selectedCharacter.alias_id === ref[0]
          )
        : -1

    setMenuSelection({
      type: 'TITLE',
      selection: [
        foundCharacterIndex !== -1 ? foundCharacterIndex : 0,
        foundAliasIndex !== -1 ? foundAliasIndex : 0
      ]
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
    if (menuSelection.type === 'TITLE') {
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

      if (foundCharacterIndex !== -1) {
        setMenuSelection({
          type: 'TITLE',
          selection: [foundCharacterIndex, 0]
        })
      }
    }

    if (menuSelection.type === 'ALIAS') {
      const foundAliasIndex = characters
        ? characters[menuSelection.selection[0]].refs.findIndex((ref) => {
            const filterLower = filter.toLowerCase(),
              characterAliasLower = ref[1].toLocaleLowerCase()

            return (
              filterLower.charAt(0) === characterAliasLower.charAt(0) &&
              characterAliasLower.includes(filterLower)
            )
          })
        : -1

      if (foundAliasIndex !== -1) {
        setMenuSelection({
          type: 'ALIAS',
          selection: [menuSelection.selection[0], foundAliasIndex]
        })
      }
    }
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
            if (event.code === 'Escape') {
              if (!filter && !selectedCharacter) {
                inputRef.current?.blur()
              }

              return
            }

            if (event.code === 'Enter') {
              event.preventDefault()

              if (characters) {
                const character = characters[menuSelection.selection[0]]

                if (character?.id) {
                  if (menuSelection.type === 'TITLE') {
                    selectCharacter({
                      character_id: character.id,
                      format: selectedCharacter?.format || 'cap'
                    })
                  }

                  if (menuSelection.type === 'ALIAS') {
                    selectCharacter({
                      character_id: character.id,
                      alias_id: character.refs[menuSelection.selection[1]][0],
                      format: selectedCharacter?.format || 'cap'
                    })
                  }
                }
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

              if (selecting) {
                if (
                  menuSelection.type === 'TITLE' &&
                  menuSelection.selection[0] > 0 &&
                  characters &&
                  menuSelection.selection[0] <= characters.length - 1
                ) {
                  logger.info('move title selection up')

                  setMenuSelection({
                    ...menuSelection,
                    selection: [menuSelection.selection[0] - 1, 0]
                  })
                }

                if (
                  menuSelection.type === 'ALIAS' &&
                  menuSelection.selection[1] > 0 &&
                  characters &&
                  menuSelection.selection[1] <=
                    characters[menuSelection.selection[0]].refs.length - 1
                ) {
                  logger.info('move alias selection up')

                  setMenuSelection({
                    ...menuSelection,
                    selection: [
                      menuSelection.selection[0],
                      menuSelection.selection[1] - 1
                    ]
                  })
                }
              }
            }

            if (event.code === 'ArrowDown') {
              event.preventDefault()

              if (selecting) {
                if (
                  menuSelection.type === 'TITLE' &&
                  menuSelection.selection[0] >= 0 &&
                  characters &&
                  menuSelection.selection[0] < characters.length - 1
                ) {
                  logger.info('move title selection up')

                  setMenuSelection({
                    ...menuSelection,
                    selection: [menuSelection.selection[0] + 1, 0]
                  })
                }

                if (
                  menuSelection.type === 'ALIAS' &&
                  menuSelection.selection[1] >= 0 &&
                  characters &&
                  menuSelection.selection[1] <
                    characters[menuSelection.selection[0]].refs.length - 1
                ) {
                  logger.info('move alias selection up')

                  setMenuSelection({
                    ...menuSelection,
                    selection: [
                      menuSelection.selection[0],
                      menuSelection.selection[1] + 1
                    ]
                  })
                }
              }
            }

            // must come before ArrowRight
            if (isHotkey('opt+ArrowRight', event)) {
              if (selecting) {
                event.preventDefault()

                characters &&
                  characters[menuSelection.selection[0]].refs.length > 0 &&
                  setMenuSelection({ ...menuSelection, type: 'ALIAS' })

                return
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

            // must come before ArrowLeft
            if (isHotkey('opt+ArrowLeft', event)) {
              if (selecting) {
                event.preventDefault()

                setMenuSelection({ ...menuSelection, type: 'TITLE' })

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
          onInput={() => {
            setFilter(inputRef.current?.textContent || '')
          }}
        >
          {character && selectedCharacter
            ? formatCharacterRefDisplay(
                getCharacterAliasOrTitle(
                  character,
                  selectedCharacter?.alias_id
                ) || '',
                selectedCharacter.format
              )
            : ''}
        </span>
      )}

      <CharacterSelectMenu
        studioId={studioId}
        worldId={worldId}
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
          studioId={studioId}
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
