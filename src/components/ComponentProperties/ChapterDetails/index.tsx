import React, { useContext } from 'react'

import { ComponentId, StudioId } from '../../../data/types'

import { useChapter } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import ComponentTitle from '../ComponentTitle'

import styles from '../styles.module.less'

import api from '../../../api'

const ChapterDetails: React.FC<{
  studioId: StudioId
  chapterId: ComponentId
}> = ({ studioId, chapterId }) => {
  const chapter = useChapter(studioId, chapterId, [chapterId])

  const { editorDispatch } = useContext(EditorContext)

  return (
    <>
      {chapter && (
        <div className={styles.componentDetailViewContent}>
          <ComponentTitle
            title={chapter.title}
            onUpdate={async (title) => {
              if (chapter.id) {
                await api().chapters.saveChapter(studioId, {
                  ...(await api().chapters.getChapter(studioId, chapter.id)),
                  title
                })

                editorDispatch({
                  type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
                  renamedComponent: {
                    id: chapter.id,
                    newTitle: title
                  }
                })
              }
            }}
          />
          <div className={styles.componentId}>{chapter.id}</div>
        </div>
      )}
    </>
  )
}

export default ChapterDetails
