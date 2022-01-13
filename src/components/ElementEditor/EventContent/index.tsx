import logger from '../../../lib/logger'

import { debounce } from 'lodash'
import useEventListener from '@use-it/event-listener'
import isHotkey from 'is-hotkey'

import { getTemplateExpressionRanges } from '../../../lib/templates'

import React, { useState, useEffect, useCallback, useContext } from 'react'

import { ElementId, ELEMENT_TYPE, Scene, StudioId } from '../../../data/types'
import {
  CustomRange,
  HOTKEY_EXPRESSION,
  HOTKEYS,
  LEAF_FORMATS,
  HOTKEY_SELECTION,
  HOTKEY_BASIC
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
  ReactEditor
} from 'slate-react'
import { withHistory } from 'slate-history'

import {
  withCorrectVoidBehavior,
  withEmbeds,
  withImages,
  withAlignReset,
  withElementReset
} from '../../../lib/contentEditor/plugins'

import DragDropWrapper from '../../DragDropWrapper'
import EventContentElement from './EventContentElement'
import EventContentLeaf from './EventContentLeaf'
import CommandMenu from './Tools/CommandMenu'
import EventContentToolbar from './EventContentToolbar'

import api from '../../../api'

import styles from './styles.module.less'
import {
  deleteAll,
  isLeafActive,
  showCommandMenu,
  toggleLeaf
} from '../../../lib/contentEditor'

const saveContent = debounce(
  async (studioId: StudioId, eventId: ElementId, content) => {
    await api().events.saveEventContent(studioId, eventId, content)
  },
  100
)

const EventContent: React.FC<{
  studioId: StudioId
  scene: Scene
  eventId: ElementId
  onClose: () => void
}> = ({ studioId, scene, eventId, onClose }) => {
  const event = useEvent(studioId, eventId, [studioId, eventId])

  // https://github.com/ianstormtaylor/slate/commit/1b0e7c6b928865cb4fd656b6f922e30fbe72d77a
  const [editor] = useState<ReactEditor>(() =>
    withHistory(
      withImages(
        withEmbeds(
          withElementReset(
            withAlignReset(withCorrectVoidBehavior(withReact(createEditor())))
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
    }>({ show: false, filter: undefined, target: undefined, index: 0 }),
    [totalCommandMenuItems, setTotalCommandMenuItems] = useState(0),
    [ready, setReady] = useState(false)

  const debounceSaveContent = useCallback(
    (content) => saveContent(studioId, eventId, content),
    [studioId, eventId]
  )

  const renderElement = useCallback(
    (props) => <EventContentElement {...props} />,
    []
  )

  const renderLeaf = useCallback((props) => <EventContentLeaf {...props} />, [])

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
        case HOTKEY_BASIC.ENTER:
          if (commandMenuProps.show) console.log('test')

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
            setCommandMenuProps({
              show: false,
              filter: undefined,
              target: undefined,
              index: 0
            })
            return
          }

          close()
          return
        default:
          break
      }
    },
    [editor, isAllSelected, commandMenuProps, totalCommandMenuItems]
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
      const node = editor.children[selection?.anchor.path[0]]

      let foundInsideExpression = false

      if (Text.isText(node)) {
        const expressionRanges = getTemplateExpressionRanges(node.text)

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
        Transforms.select(editor, Editor.end(editor, []))
        ReactEditor.focus(editor)
      }, 1)
    }
  }, [ready, editor, event, eventId])

  useEffect(() => {
    if (event?.id !== composer.selectedSceneMapEvent) {
      setCommandMenuProps({
        show: false,
        filter: undefined,
        target: undefined,
        index: 0
      })
    }
  }, [composer.selectedSceneMapEvent])

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
          <div className={styles.contentContainer}>
            <h1 className={styles.eventTitle}>{event.title}</h1>

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
                  debounceSaveContent(newContent)
                }
              }}
            >
              <CommandMenu
                {...commandMenuProps}
                onItemTotal={(total) => setTotalCommandMenuItems(total)}
                onItemSelect={(item) => console.log(item)}
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
                  onKeyDown={(event) => {
                    for (const hotkey in HOTKEYS) {
                      if (isHotkey(hotkey, event)) {
                        if (
                          (!commandMenuProps.show ||
                            totalCommandMenuItems === 0) &&
                          (HOTKEYS[hotkey] === HOTKEY_BASIC.ENTER ||
                            HOTKEYS[hotkey] === HOTKEY_SELECTION.MENU_UP ||
                            HOTKEYS[hotkey] === HOTKEY_SELECTION.MENU_DOWN)
                        )
                          return

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

                        event.preventDefault()

                        processHotkey(HOTKEYS[hotkey])
                      }

                      setIsAllSelected(false)
                    }
                  }}
                />
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
