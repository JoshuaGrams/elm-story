import logger from '../../../lib/logger'
import {
  deleteAll,
  getCharactersIdsFromEventContent,
  getElement,
  getImageIdsFromEventContent,
  isElementActive,
  isElementEmpty,
  isLeafActive,
  showCommandMenu,
  syncCharactersFromEventContentToEventData,
  syncImagesFromEventContentToEventData,
  toggleElement,
  toggleLeaf
} from '../../../lib/contentEditor'

import { ipcRenderer } from 'electron'
import { v4 as uuid } from 'uuid'

import { debounce, isEqual } from 'lodash'
import useEventListener from '@use-it/event-listener'
import isHotkey from 'is-hotkey'

import { getTemplateExpressionRanges } from '../../../lib/templates'

import React, { useState, useEffect, useCallback, useContext } from 'react'

import { WINDOW_EVENT_TYPE } from '../../../lib/events'
import { ElementId, ELEMENT_TYPE, Scene, StudioId } from '../../../data/types'
import {
  CustomRange,
  HOTKEY_EXPRESSION,
  HOTKEYS,
  LEAF_FORMATS,
  HOTKEY_SELECTION,
  HOTKEY_BASIC,
  ELEMENT_FORMATS,
  SUPPORTED_ELEMENT_TYPES,
  CharacterElement,
  ImageElement,
  DEFAULT_EVENT_CONTENT
} from '../../../data/eventContentTypes'

import { DragStart, DropResult } from 'react-beautiful-dnd'

import { useEvent } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import {
  createEditor,
  Editor,
  Transforms,
  Text,
  BaseSelection,
  BaseRange
} from 'slate'
import {
  Slate as SlateContext,
  Editable,
  withReact,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps
} from 'slate-react'
import { withHistory } from 'slate-history'

import {
  withCorrectVoidBehavior,
  withEmbeds,
  withImages,
  withAlignReset,
  withElementReset,
  withCharacters
} from '../../../lib/contentEditor/plugins'

import DragDropWrapper from '../../DragDropWrapper'
import EventContentElement from './EventContentElement'
import EventContentLeaf from './EventContentLeaf'
import CommandMenu from './Tools/CommandMenu'
import EventContentToolbar from './EventContentToolbar'

import api from '../../../api'

import styles from './styles.module.less'

const saveContent = debounce(
  async (studioId: StudioId, eventId: ElementId, content) => {
    await api().events.saveEventContent(studioId, eventId, content)
  },
  100
)

const defaultCommandMenuProps = {
  show: false,
  filter: undefined,
  target: undefined,
  index: 0
}

const EventContent: React.FC<{
  studioId: StudioId
  scene: Scene
  eventId: ElementId
  onClose: () => void
}> = ({ studioId, scene, eventId, onClose }) => {
  const event = useEvent(studioId, eventId, [studioId, eventId])

  // https://github.com/ianstormtaylor/slate/commit/1b0e7c6b928865cb4fd656b6f922e30fbe72d77a
  const [editor] = useState<ReactEditor>(() =>
    withCharacters(
      withImages(
        withEmbeds(
          withElementReset(
            withAlignReset(
              withCorrectVoidBehavior(withReact(withHistory(createEditor())))
            )
          )
        )
      )
    )
  )

  const { composer, composerDispatch } = useContext(ComposerContext)

  const [selectedExpression, setSelectedExpression] = useState({
      isInside: false,
      outsideOffset: 0
    }),
    // https://github.com/ianstormtaylor/slate/issues/2500
    [isAllSelected, setIsAllSelected] = useState(false),
    [commandMenuProps, setCommandMenuProps] = useState<{
      show: boolean
      filter: string | undefined
      target: BaseRange | undefined
      index: number
    }>(defaultCommandMenuProps),
    [totalCommandMenuItems, setTotalCommandMenuItems] = useState(0),
    [selectedCommandMenuItem, setSelectedCommandMenuItem] = useState<
      string | undefined
    >(undefined),
    [ready, setReady] = useState(false),
    // so we know what images and characters have been removed
    [characterCache, setCharacterCache] = useState<string[]>([]),
    [imageCache, setImageCache] = useState<string[]>([])

  const debounceSaveContent = useCallback(
    (content) => saveContent(studioId, eventId, content),
    [studioId, eventId]
  )

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      return (
        <EventContentElement
          studioId={studioId}
          worldId={scene.worldId}
          onCharacterSelect={
            props.element.type === ELEMENT_FORMATS.CHARACTER
              ? (character, remove) => {
                  const characterElementPath = ReactEditor.findPath(
                    editor,
                    props.element
                  )

                  if (!remove && character) {
                    const {
                      character_id,
                      alias_id,
                      transform,
                      styles
                    } = character

                    Transforms.setNodes<CharacterElement>(
                      editor,
                      {
                        character_id,
                        alias_id,
                        transform,
                        styles
                      },
                      { at: characterElementPath }
                    )

                    character &&
                      logger.info(
                        `add character '${character_id}' alias '${alias_id}' to event '${eventId}'`
                      )

                    !character &&
                      logger.info(`reset character from event '${eventId}`)

                    Transforms.select(
                      editor,
                      Editor.end(editor, characterElementPath)
                    )
                  }

                  if (remove) {
                    Transforms.removeNodes(editor, { at: characterElementPath })

                    logger.info(`remove character from event '${eventId}`)
                  }

                  ReactEditor.focus(editor)
                  Transforms.move(editor)
                }
              : undefined
          }
          onImageSelect={
            props.element.type === ELEMENT_FORMATS.IMG
              ? async (image) => {
                  if (event?.id && image?.data) {
                    const imageElementPath = ReactEditor.findPath(
                      editor,
                      props.element
                    )

                    let assetId: string = uuid()

                    try {
                      const promises: Promise<any>[] = []

                      promises.push(
                        ipcRenderer.invoke(WINDOW_EVENT_TYPE.SAVE_ASSET, {
                          studioId,
                          worldId: event.worldId,
                          id: assetId,
                          data: await image.data.arrayBuffer(),
                          ext: 'webp'
                        })
                      )

                      if (!event.images.includes(assetId)) {
                        promises.push(
                          api().events.saveEvent(studioId, {
                            ...event,
                            images: [...event.images, assetId]
                          })
                        )
                      }

                      await Promise.all(promises)

                      Transforms.setNodes<ImageElement>(
                        editor,
                        {
                          asset_id: assetId
                        },
                        { at: imageElementPath }
                      )

                      // Transforms.select(
                      //   editor,
                      //   Editor.start(editor, imageElementPath)
                      // )

                      ReactEditor.focus(editor)
                      Transforms.move(editor)
                    } catch (error) {
                      throw error
                    }
                  }
                }
              : undefined
          }
          {...props}
        />
      )
    },
    [editor, eventId, event]
  )

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <EventContentLeaf {...props} />,
    []
  )

  const decorate = useCallback(([node, path]) => {
    const ranges: CustomRange[] = []

    if (!Text.isText(node)) return ranges

    const expressionRanges = getTemplateExpressionRanges(node.text)

    expressionRanges.map((range) => {
      ranges.push({
        expressionStart: true,
        anchor: { path, offset: range.start },
        focus: { path, offset: range.start + 1 }
      })

      ranges.push({
        expression: true,
        anchor: { path, offset: range.start },
        focus: { path, offset: range.end }
      })

      ranges.push({
        expressionEnd: true,
        anchor: { path, offset: range.end - 1 },
        focus: { path, offset: range.end }
      })
    })

    return ranges
  }, [])

  const moveElement = useCallback((result: DropResult) => {
    composerDispatch({
      type: COMPOSER_ACTION_TYPE.SET_DRAGGABLE_EVENT_CONTENT_ELEMENT,
      id: null
    })

    if (result.destination?.index !== undefined) {
      Transforms.moveNodes(editor, {
        at: [result.source.index],
        to: [result.destination.index]
      })
    }
  }, [])

  const setDraggableId = useCallback((initial: DragStart) => {
    composerDispatch({
      type: COMPOSER_ACTION_TYPE.SET_DRAGGABLE_EVENT_CONTENT_ELEMENT,
      id: initial.draggableId
    })
  }, [])

  const close = () => {
    if (composer.selectedWorldOutlineElement.id === scene.id || !scene.id)
      onClose()
  }

  const processCommandMenuOperation = useCallback(
    (item: string) => {
      commandMenuProps.target &&
        Transforms.delete(editor, { at: commandMenuProps.target })

      setCommandMenuProps(defaultCommandMenuProps)

      if (SUPPORTED_ELEMENT_TYPES.includes(item as ELEMENT_FORMATS)) {
        if (item === ELEMENT_FORMATS.CHARACTER) {
          Transforms.insertNodes(editor, {
            type: ELEMENT_FORMATS.CHARACTER,
            children: [{ text: '' }],
            transform: 'cap'
          })

          Transforms.deselect(editor)

          return
        }

        if (item === ELEMENT_FORMATS.IMG) {
          const {
            element: previousElement,
            path: previousElementPath
          } = getElement(editor)

          if (
            previousElement &&
            previousElementPath &&
            isElementEmpty(previousElement)
          ) {
            Transforms.setNodes(
              editor,
              {
                type: ELEMENT_FORMATS.IMG,
                children: [{ text: '' }]
              },
              { at: previousElementPath }
            )

            return
          }

          Transforms.insertNodes(editor, {
            type: ELEMENT_FORMATS.IMG,
            children: [{ text: '' }]
          })

          return
        }

        toggleElement(
          editor,
          item as ELEMENT_FORMATS,
          isElementActive(editor, item as ELEMENT_FORMATS)
        )
      }
    },
    [editor, commandMenuProps.target]
  )

  const processHotkey = useCallback(
    (hotkey: string) => {
      let selection: BaseSelection | undefined = undefined

      switch (hotkey) {
        case 'strong':
        case 'em':
        case 'u':
        case 's':
          toggleLeaf(
            editor,
            hotkey as LEAF_FORMATS,
            isLeafActive(editor, hotkey as LEAF_FORMATS)
          )
          return
        case 'mod+`':
          return
        case HOTKEY_BASIC.BACKSPACE:
        case HOTKEY_BASIC.DELETE:
          deleteAll(editor)
          setIsAllSelected(false)
          return
        case HOTKEY_EXPRESSION.OPEN_BRACKET:
          if (selectedExpression.isInside) return

          selection = editor.selection

          if (selection) {
            Transforms.insertText(editor, '{  }')

            // TODO: stack hack
            setTimeout(
              () =>
                Transforms.move(editor, {
                  distance: 2,
                  unit: 'offset',
                  reverse: true
                }),
              1
            )
          }

          return
        case HOTKEY_SELECTION.MENU_UP:
          if (
            commandMenuProps.show &&
            totalCommandMenuItems > 0 &&
            commandMenuProps.index > 0 &&
            commandMenuProps.index + 1 <= totalCommandMenuItems
          ) {
            setCommandMenuProps({
              ...commandMenuProps,
              index: commandMenuProps.index - 1
            })
          }

          return
        case HOTKEY_SELECTION.MENU_DOWN:
          if (
            commandMenuProps.show &&
            totalCommandMenuItems > 0 &&
            commandMenuProps.index >= 0 &&
            commandMenuProps.index + 1 < totalCommandMenuItems
          ) {
            setCommandMenuProps({
              ...commandMenuProps,
              index: commandMenuProps.index + 1
            })
          }

          return
        case HOTKEY_BASIC.TAB:
        case HOTKEY_BASIC.ENTER:
          if (commandMenuProps.show && selectedCommandMenuItem) {
            processCommandMenuOperation(selectedCommandMenuItem)
          }

          return
        case HOTKEY_EXPRESSION.CLOSE_BRACKET:
          if (selectedExpression.isInside) return

          return
        case HOTKEY_EXPRESSION.EXIT:
          if (selectedExpression.isInside) {
            Transforms.move(editor, {
              distance: selectedExpression.outsideOffset,
              unit: 'offset'
            })
          }

          return
        case 'esc':
          if (commandMenuProps.show) {
            setCommandMenuProps(defaultCommandMenuProps)

            return
          }

          close()
          return
        default:
          break
      }
    },
    [
      editor,
      isAllSelected,
      commandMenuProps,
      totalCommandMenuItems,
      selectedCommandMenuItem
    ]
  )

  useEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event) {
        switch (event.key) {
          case 'Escape':
            // TODO: should hide command menu and toolbar first...
            processHotkey('esc')
            break
          default:
            break
        }
      }
    },
    document
  )

  useEffect(() => {
    const { selection } = editor

    if (selection) {
      const node = getElement(editor)

      let foundInsideExpression = false

      if (node.element?.children[0] && Text.isText(node.element.children[0])) {
        const expressionRanges = getTemplateExpressionRanges(
          node.element?.children[0].text
        )

        expressionRanges.map((range) => {
          if (
            selection.anchor.offset > range.start &&
            selection.anchor.offset < range.end
          ) {
            setSelectedExpression({
              isInside: true,
              outsideOffset: range.end - selection.anchor.offset
            })

            foundInsideExpression = true

            return
          }
        })
      }

      !foundInsideExpression &&
        setSelectedExpression({ isInside: false, outsideOffset: 0 })
    }
  }, [editor.selection])

  useEffect(() => {
    logger.info(`EventContent->isAllSelected->${isAllSelected}`)
  }, [isAllSelected])

  useEffect(() => {
    if (ready && event && event.id !== eventId) setReady(false)

    if (!ready && editor && event && event.id === eventId) {
      ReactEditor.deselect(editor)

      // TODO: stack hack
      setTimeout(() => {
        // TODO: this might be desired UX, but is confusing
        // const startingElement = Node.last(editor, [])

        // if (
        //   Element.isElement(startingElement) &&
        //   startingElement.type === ELEMENT_FORMATS.IMG
        // )
        //   return

        Transforms.select(editor, Editor.end(editor, []))
        ReactEditor.focus(editor)
      }, 1)
    }
  }, [ready, editor, event, eventId])

  useEffect(() => {
    !commandMenuProps.show && setSelectedCommandMenuItem(undefined)
  }, [commandMenuProps.show])

  useEffect(() => {
    if (event?.id !== composer.selectedSceneMapEvent) {
      setCommandMenuProps(defaultCommandMenuProps)
    }
  }, [composer.selectedSceneMapEvent])

  // if a character is deleted, the event content will be updated manually
  // another way to do this is like removing components; composer action
  // which is probably faster than constantly parsing and comparing
  useEffect(() => {
    if (composer.removedElement.type === ELEMENT_TYPE.CHARACTER) {
      logger.info(
        `EventContent->useEffect->composer.removedElement->character->${composer.removedElement.id}`
      )

      composerDispatch({
        type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE,
        removedElement: { id: undefined, type: undefined }
      })
    }
  }, [composer.removedElement])

  // syncs event content and event characters array
  // from adding and removing characters via content editor
  // elmstorygames/feedback#217
  useEffect(() => {
    async function syncData() {
      if (!event?.id) return

      // TODO: combine
      const charactersToRemainById = getCharactersIdsFromEventContent(editor),
        imagesToRemainById = getImageIdsFromEventContent(editor)

      let content: string | undefined = undefined

      if (!isEqual(characterCache, charactersToRemainById)) {
        logger.info(
          `EventContent->useEffect->event.characters,editor.children->syncCharacters`
        )

        content = JSON.stringify(editor.children)

        await syncCharactersFromEventContentToEventData(
          studioId,
          event.id,
          content,
          charactersToRemainById
        )

        setCharacterCache(charactersToRemainById)
      }

      if (!isEqual(imageCache, imagesToRemainById)) {
        const imagesToRemoveById =
          imagesToRemainById.length === 0
            ? imageCache
            : imageCache.filter((id) => !imagesToRemainById.includes(id))

        await syncImagesFromEventContentToEventData(
          studioId,
          event.id,
          content || JSON.stringify(editor.children),
          imagesToRemainById,
          imagesToRemoveById
        )

        setImageCache(imagesToRemainById)
      }
    }

    syncData()
  }, [event?.id, editor.children, characterCache, imageCache])

  return (
    <>
      {event && (
        <div
          className={styles.EventContent}
          onClick={() =>
            composer.selectedWorldOutlineElement.id !== scene.id &&
            composerDispatch({
              type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT,
              selectedWorldOutlineElement: {
                expanded: true,
                id: scene.id,
                title: scene.title,
                type: ELEMENT_TYPE.SCENE
              }
            })
          }
        >
          <div className={`${styles.contentContainer}`}>
            {/* <h1 className={styles.eventTitle}>{event.title}</h1> */}

            <SlateContext
              editor={editor}
              // https://github.com/ianstormtaylor/slate/pull/4540
              value={JSON.parse(event.content)}
              onChange={(newContent) => {
                if (!ready) setReady(true)

                if (ready) {
                  const [show, filter, target] = showCommandMenu(editor)

                  setCommandMenuProps({ show, filter, target, index: 0 })

                  saveContent.cancel()

                  // elmstorygames/feedback#216
                  if (newContent.length === 0) {
                    editor.children = [...DEFAULT_EVENT_CONTENT]

                    Transforms.select(editor, Editor.start(editor, []))

                    ReactEditor.focus(editor)
                    Transforms.move(editor)

                    return
                  }

                  debounceSaveContent(newContent)
                }
              }}
            >
              <CommandMenu
                {...commandMenuProps}
                onItemTotal={(total) => setTotalCommandMenuItems(total)}
                onItemSelect={(item) => setSelectedCommandMenuItem(item)}
                onItemClick={(item) => processCommandMenuOperation(item)}
              />
              <EventContentToolbar />

              <DragDropWrapper
                onBeforeDragStart={setDraggableId}
                onDragEnd={moveElement}
              >
                <Editable
                  className={styles.editable}
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  decorate={decorate}
                  onKeyDown={(_event) => {
                    for (const hotkey in HOTKEYS) {
                      if (isHotkey(hotkey, _event)) {
                        if (
                          (!commandMenuProps.show ||
                            totalCommandMenuItems === 0) &&
                          (HOTKEYS[hotkey] === HOTKEY_BASIC.ENTER ||
                            HOTKEYS[hotkey] === HOTKEY_BASIC.TAB ||
                            HOTKEYS[hotkey] === HOTKEY_SELECTION.MENU_UP ||
                            HOTKEYS[hotkey] === HOTKEY_SELECTION.MENU_DOWN)
                        ) {
                          if (HOTKEYS[hotkey] === HOTKEY_BASIC.TAB) {
                            _event.preventDefault()

                            selectedExpression.isInside &&
                              Transforms.move(editor, {
                                distance: selectedExpression.outsideOffset,
                                unit: 'offset'
                              })
                          }

                          return
                        }

                        if (HOTKEYS[hotkey] === HOTKEY_SELECTION.ALL) {
                          setIsAllSelected(!isAllSelected)
                          return
                        }

                        if (
                          (HOTKEYS[hotkey] === HOTKEY_BASIC.BACKSPACE ||
                            HOTKEYS[hotkey] === HOTKEY_BASIC.DELETE) &&
                          !isAllSelected
                        ) {
                          return
                        }

                        _event.preventDefault()

                        processHotkey(HOTKEYS[hotkey])
                      }

                      setIsAllSelected(false)
                    }
                  }}
                />

                {/* <code
                  style={{
                    userSelect: 'all',
                    position: 'absolute',
                    bottom: -400
                    // display: 'none'
                  }}
                >
                  {parse(eventContentToPreview(event.content).text || '')}
                </code> */}
              </DragDropWrapper>
            </SlateContext>
          </div>
        </div>
      )}
    </>
  )
}

EventContent.displayName = 'EventContent'

export default EventContent
