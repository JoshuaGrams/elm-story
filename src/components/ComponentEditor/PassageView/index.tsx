// @refresh reset https://github.com/ianstormtaylor/slate/issues/3477

import logger from '../../../lib/logger'

import React, { useMemo, useState, useEffect, useContext } from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { usePassage } from '../../../hooks'

import { BaseEditor, createEditor, Descendant } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

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

const initialContent: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]

const PassageView: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId)

  const editor = useMemo(() => withReact(createEditor()), [])

  const [ready, setReady] = useState(false),
    [passageContent, setPassageContent] = useState<Descendant[]>(initialContent)

  useEffect(() => {
    logger.info(`PassageView->passage->useEffect`)

    passage &&
      !ready &&
      setPassageContent(
        passage.content ? JSON.parse(passage.content) : initialContent
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
            onClick={() => passage && ready && ReactEditor.focus(editor)}
          >
            <Editable />
          </div>
        </Slate>
      )}
    </>
  )
}

export default PassageView
