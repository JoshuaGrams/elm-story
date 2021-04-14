// @refresh reset https://github.com/ianstormtaylor/slate/issues/3477

import logger from '../../../lib/logger'

import React, { useMemo, useState, useEffect } from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { usePassage } from '../../../hooks'

import { BaseEditor, createEditor, Descendant } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

import api from '../../../api'

export type CustomElement = { type: 'paragraph'; children: CustomText[] }
export type CustomText = { text: string }

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
}> = () => {
  return <div>Passage View Tools</div>
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
          <Editable />
        </Slate>
      )}
    </>
  )
}

export default PassageView
