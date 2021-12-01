import logger from '../../../lib/logger'

import { debounce } from 'lodash-es'
import useEventListener from '@use-it/event-listener'

import { getTemplateExpressionRanges } from '../../../lib/templates'

import React, {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react'

import {
  ElementId,
  ELEMENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  Scene,
  StudioId
} from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { useEvent } from '../../../hooks'

import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Transforms,
  Text,
  Range
} from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderElementProps,
  useFocused,
  RenderLeafProps
} from 'slate-react'

import { Button } from 'antd'

import styles from './styles.module.less'

import api from '../../../api'

export type CustomText = {
  text: string
  expression?: boolean
  expressionStart?: boolean
  expressionEnd?: boolean
}
export type CustomElement = { type: 'paragraph'; children: CustomText[] }

export interface CustomRange extends Range {
  expression?: boolean
  expressionStart?: boolean
  expressionEnd?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

export const PassageViewTools: React.FC<{
  studioId: StudioId
  passageId: ElementId
}> = ({ studioId, passageId }) => {
  const passage = useEvent(studioId, passageId, [studioId, passageId])

  const { editorDispatch } = useContext(EditorContext)

  return (
    <div>
      {passage && (
        <Button
          danger
          onClick={async () => {
            editorDispatch({
              type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE,
              removedComponent: { type: ELEMENT_TYPE.EVENT, id: passageId }
            })

            const updatedSceneChildren = (
                await api().scenes.getScene(studioId, passage.sceneId)
              ).children,
              foundPassageIndex = updatedSceneChildren.findIndex(
                (child) => child[1] === passage.id
              )

            updatedSceneChildren.splice(foundPassageIndex, 1)

            await Promise.all([
              api().scenes.saveChildRefsToScene(
                studioId,
                passage.sceneId,
                updatedSceneChildren
              ),
              api().events.removeEvent(studioId, passageId)
            ])
          }}
        >
          Remove Passage
        </Button>
      )}
    </div>
  )
}

export const initialPassageContent: Descendant[] = [...DEFAULT_PASSAGE_CONTENT]

const ParagraphElement: React.FC<RenderElementProps> = (props) => {
  return (
    <p
      className={`${'es-engine-passage-p'} ${
        !props.element.children[0].text ? 'es-engine-passage-p-empty' : ''
      }`}
      {...props.attributes}
    >
      {props.children}
    </p>
  )
}

const Leaf = (props: RenderLeafProps) => {
  let leaf: JSX.Element | undefined = undefined

  if (props.leaf.expression) {
    leaf = (
      <span
        {...props.attributes}
        className={styles.expression}
        spellCheck="false"
      >
        {props.children}
      </span>
    )
  }

  if (props.leaf.expressionStart || props.leaf.expressionEnd) {
    leaf = (
      <span
        {...props.attributes}
        className={`${styles.expression} ${styles.expressionCap}`}
      >
        {props.children}
      </span>
    )
  }

  return leaf || <span {...props.attributes}>{props.children}</span>
}

const PassageView: React.FC<{
  studioId: StudioId
  scene: Scene
  passageId: ElementId
  onClose: () => void
}> = ({ studioId, scene, passageId, onClose }) => {
  const passage = useEvent(studioId, passageId, [studioId, passageId])

  const slateEditor = useMemo<ReactEditor>(
    () => withHistory(withReact(createEditor())),
    []
  )

  const isFocused = useFocused()

  const { editor, editorDispatch } = useContext(EditorContext)

  const [passageContent, setPassageContent] = useState<Descendant[]>(
      initialPassageContent
    ),
    [selectedExpression, setSelectedExpression] = useState({
      isInside: false,
      outsideOffset: 0
    }),
    [ready, setReady] = useState(false)

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'paragraph':
        return <ParagraphElement {...props} />
      default:
        return <></>
    }
  }, [])

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />
  }, [])

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

  function close() {
    if (editor.selectedWorldOutlineElement.id === scene.id || !scene.id)
      onClose()
  }

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event) {
        switch (event.key) {
          case 'Escape':
            close()
            break
          default:
            break
        }
      }
    },
    [editor.selectedWorldOutlineElement.id, scene, passageContent]
  )

  const saveContent = debounce(
    async (studioId: StudioId, passageId: ElementId, content) => {
      await api().events.saveEventContent(studioId, passageId, content)
    },
    100
  )

  const debounceSaveContent = useCallback(
    (content) => saveContent(studioId, passageId, content),
    [studioId, passageId]
  )

  useEventListener('keydown', onKeyDown, document)

  useEffect(() => {
    logger.info(`PassageView->isFocused->useEffect: ${isFocused}`)
  }, [isFocused])

  useEffect(() => {
    if (ready && passage && passage.id !== passageId) setReady(false)

    if (!ready && slateEditor && passage && passage.id === passageId) {
      ReactEditor.deselect(slateEditor)

      setPassageContent(
        passage.content ? JSON.parse(passage.content) : initialPassageContent
      )

      // TODO: stack hack
      setTimeout(() => {
        Transforms.select(slateEditor, Editor.end(slateEditor, []))
        ReactEditor.focus(slateEditor)
      }, 1)
    }
  }, [ready, slateEditor, passage, passageId])

  useEffect(() => {
    const { selection } = slateEditor

    if (selection) {
      const expressionRanges = getTemplateExpressionRanges(
        (passageContent[selection?.anchor.path[0]] as CustomElement).children[0]
          .text
      )

      let foundInsideExpression = false

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

      !foundInsideExpression &&
        setSelectedExpression({ isInside: false, outsideOffset: 0 })
    }
  }, [slateEditor.selection])

  useEffect(() => {
    logger.info(`PassageView->useEffect`)
  }, [])

  return (
    <>
      {passage && (
        <Slate
          editor={slateEditor}
          value={passageContent}
          onChange={(newContent) => {
            if (!ready) setReady(true)

            if (ready) {
              setPassageContent(newContent)

              saveContent.cancel()
              debounceSaveContent(newContent)
            }
          }}
        >
          <div
            className={styles.PassageView}
            onClick={() =>
              editor.selectedWorldOutlineElement.id !== scene.id &&
              editorDispatch({
                type: EDITOR_ACTION_TYPE.WORLD_OUTLINE_SELECT,
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
              <h1 className={styles.passageTitle}>{passage.title}</h1>

              <div className={styles.editableContainer}>
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  decorate={decorate}
                  placeholder="Enter passage text..."
                  onKeyDown={(event) => {
                    const { selection } = slateEditor

                    logger.info(`PassageView->Key Pressed: ${event.key}`)

                    switch (event.key) {
                      case '{':
                        event.preventDefault()

                        if (selectedExpression.isInside) return

                        if (selection) {
                          Transforms.insertText(slateEditor, '{  }')

                          // TODO: stack hack
                          setTimeout(
                            () =>
                              Transforms.move(slateEditor, {
                                distance: 2,
                                unit: 'offset',
                                reverse: true
                              }),
                            1
                          )
                        }
                        break
                      case '}':
                        if (selectedExpression.isInside) {
                          event.preventDefault()
                          return
                        }

                        break
                      case 'Tab':
                        event.preventDefault()
                        if (selectedExpression.isInside) {
                          Transforms.move(slateEditor, {
                            distance: selectedExpression.outsideOffset,
                            unit: 'offset'
                          })
                        }
                        break
                      default:
                        break
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </Slate>
      )}
    </>
  )
}

export default PassageView
