import { debounce } from 'lodash'
import useEventListener from '@use-it/event-listener'
import isHotkey from 'is-hotkey'

import { getTemplateExpressionRanges } from '../../../lib/templates'

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react'

import { ElementId, ELEMENT_TYPE, Scene, StudioId } from '../../../data/types'
import {
  CustomRange,
  HOTKEY_EXPRESSION,
  HOTKEYS
} from '../../../data/eventContentTypes'

import { DragStart, DropResult } from 'react-beautiful-dnd'

import { useEvent } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import { createEditor, Editor, Transforms, Text, BaseSelection } from 'slate'
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
  withImages
} from '../../../lib/contentEditor/plugins'

import DragDropWrapper from '../../DragDropWrapper'
import EventContentElement from './EventContentElement'
import EventContentLeaf from './EventContentLeaf'
import EventContentToolbar from './EventContentToolbar'

import api from '../../../api'

import styles from './styles.module.less'

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

  const editor = useMemo<ReactEditor>(
    () =>
      withHistory(
        withImages(
          withEmbeds(withCorrectVoidBehavior(withReact(createEditor())))
        )
      ),
    []
  )

  const { composer, composerDispatch } = useContext(ComposerContext)

  const [selectedExpression, setSelectedExpression] = useState({
      isInside: false,
      outsideOffset: 0
    }),
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
        case 'mod+b':
        case 'mod+i':
        case 'mod+u':
        case 'mod+`':
        case 'mod+a':
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

          break
        case HOTKEY_EXPRESSION.CLOSE_BRACKET:
          if (selectedExpression.isInside) return

          break
        case HOTKEY_EXPRESSION.EXIT:
          if (selectedExpression.isInside) {
            Transforms.move(editor, {
              distance: selectedExpression.outsideOffset,
              unit: 'offset'
            })
          }

          break
        case 'esc':
          close()
          break
        default:
          break
      }
    },
    [editor]
  )

  useEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event) {
        switch (event.key) {
          case 'Escape':
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
                  saveContent.cancel()
                  debounceSaveContent(newContent)
                }
              }}
            >
              <EventContentToolbar />

              <DragDropWrapper
                onBeforeDragStart={setDraggableId}
                onDragEnd={moveElement}
              >
                <Editable
                  className={styles.editable}
                  placeholder="Enter event content..."
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  decorate={decorate}
                  onKeyDown={(event) => {
                    for (const hotkey in HOTKEYS) {
                      if (isHotkey(hotkey, event)) {
                        event.preventDefault()

                        processHotkey(HOTKEYS[hotkey])
                      }
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

export default EventContent
