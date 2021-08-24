// @refresh reset https://github.com/ianstormtaylor/slate/issues/3477

import logger from '../../../lib/logger'

import React, {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef
} from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  Scene,
  StudioId
} from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { usePassage } from '../../../hooks'

import { BaseEditor, createEditor, Descendant } from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderElementProps,
  useFocused
} from 'slate-react'

import { Button } from 'antd'

import styles from './styles.module.less'

import api from '../../../api'
import useEventListener from '@use-it/event-listener'

export type CustomText = { text: string }
export type CustomElement = { type: 'paragraph'; children: CustomText[] }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

export const PassageViewTools: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId, [studioId, passageId])

  const { editorDispatch } = useContext(EditorContext)

  return (
    <div>
      {passage && (
        <Button
          danger
          onClick={async () => {
            editorDispatch({
              type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE,
              removedComponent: { type: COMPONENT_TYPE.PASSAGE, id: passageId }
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
              api().passages.removePassage(studioId, passageId)
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

const PassageView: React.FC<{
  studioId: StudioId
  scene: Scene
  passageId: ComponentId
  onClose: () => void
}> = ({ studioId, scene, passageId, onClose }) => {
  const passage = usePassage(studioId, passageId, [studioId, passageId]),
    sceneIdRef = useRef<ComponentId | undefined>(undefined)

  const slateEditor = useMemo<ReactEditor>(
    () => withHistory(withReact(createEditor())),
    []
  )

  const isFocused = useFocused()

  const { editor, editorDispatch } = useContext(EditorContext)

  const [passageContent, setPassageContent] = useState<Descendant[]>(
    initialPassageContent
  )

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'paragraph':
        return <ParagraphElement {...props} />
      default:
        return <></>
    }
  }, [])

  function close() {
    if (editor.selectedGameOutlineComponent.id === scene.id || !scene.id)
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
    [editor.selectedGameOutlineComponent.id, scene]
  )

  useEventListener('keydown', onKeyDown, document)

  useEffect(() => {
    logger.info(`PassageView->passage->useEffect`)

    if (passage) {
      sceneIdRef.current = passage.sceneId

      setPassageContent(
        passage.content ? JSON.parse(passage.content) : initialPassageContent
      )
    }
  }, [passage])

  useEffect(() => {
    // TODO: stack hack
    if (slateEditor && passage)
      setTimeout(() => ReactEditor.focus(slateEditor), 1)
  }, [slateEditor, passage])

  useEffect(() => {
    logger.info(`PassageView->isFocused->useEffect: ${isFocused}`)
  }, [isFocused])

  useEffect(() => {
    logger.info(`PassageView->useEffect`)
  }, [])

  return (
    <>
      {passage && (
        <Slate
          editor={slateEditor}
          value={passageContent}
          onChange={async (newContent) => {
            setPassageContent(newContent)

            await api().passages.savePassageContent(
              studioId,
              passageId,
              newContent
            )
          }}
        >
          <div
            className={styles.PassageView}
            onClick={() =>
              editor.selectedGameOutlineComponent.id !== scene.id &&
              editorDispatch({
                type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
                selectedGameOutlineComponent: {
                  expanded: true,
                  id: scene.id,
                  title: scene.title,
                  type: COMPONENT_TYPE.SCENE
                }
              })
            }
          >
            <div className={styles.editableContainer}>
              {!(passageContent[0] as CustomElement).children[0].text &&
                passageContent.length <= 1 && (
                  <div className={styles.placeholder}>
                    Enter passage text...
                  </div>
                )}

              <Editable renderElement={renderElement} />
            </div>
          </div>
        </Slate>
      )}
    </>
  )
}

export default PassageView
