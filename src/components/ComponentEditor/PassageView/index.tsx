// @refresh reset https://github.com/ianstormtaylor/slate/issues/3477

import logger from '../../../lib/logger'

import React, {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react'

import {
  ComponentId,
  COMPONENT_TYPE,
  DEFAULT_PASSAGE_CONTENT,
  StudioId
} from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { usePassage } from '../../../hooks'

import { BaseEditor, createEditor, Descendant } from 'slate'
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderElementProps
} from 'slate-react'

import { Button } from 'antd'

import styles from './styles.module.less'

import api from '../../../api'

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

            const updatedScene = await api().scenes.getScene(
                studioId,
                passage.sceneId
              ),
              foundPassageIndex = updatedScene.passages.findIndex(
                (passageRef) => passageRef === passageId
              )

            updatedScene.passages.splice(foundPassageIndex, 1)

            await Promise.all([
              api().scenes.savePassageRefsToScene(
                studioId,
                passage.sceneId,
                updatedScene.passages
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
  console.log(props.element)
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
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId)

  const editor = useMemo(() => withReact(createEditor()), [])

  const [ready, setReady] = useState(false),
    [passageContent, setPassageContent] = useState<Descendant[]>(
      initialPassageContent
    ),
    [editorIsFocused, setEditorIsFocused] = useState(false)

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'paragraph':
        return <ParagraphElement {...props} />
      default:
        return <></>
    }
  }, [])

  useEffect(() => {
    logger.info(`PassageView->passage->useEffect`)

    passage &&
      !ready &&
      setPassageContent(
        passage.content ? JSON.parse(passage.content) : initialPassageContent
      )

    passage && setReady(true)
  }, [passage, ready])

  useEffect(() => {
    logger.info(`PassageView->useEffect`)
  }, [])

  return (
    <>
      {passage && (
        <Slate
          editor={editor}
          value={passageContent}
          onChange={async (newContent) => {
            console.log(newContent)
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
              passage && ready && !editorIsFocused && ReactEditor.focus(editor)
            }
          >
            <>
              {!(passageContent[0] as CustomElement).children[0].text &&
                !editorIsFocused && (
                  <div className={styles.placeholder}>
                    Click here to start typing...
                  </div>
                )}

              <Editable
                renderElement={renderElement}
                onFocus={() => setEditorIsFocused(true)}
                onBlur={() => setEditorIsFocused(false)}
              />
            </>
          </div>
        </Slate>
      )}
    </>
  )
}

export default PassageView
