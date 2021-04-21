import logger from '../../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../../data/types'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import { useChapter } from '../../../hooks'

import { Button, Table } from 'antd'

import api from '../../../api'

export const ChapterViewTools: React.FC<{
  studioId: StudioId
  chapterId: ComponentId
}> = ({ studioId, chapterId }) => {
  const chapter = useChapter(studioId, chapterId, [studioId, chapterId])

  const { editorDispatch } = useContext(EditorContext)

  return (
    <div>
      {chapter && (
        <Button
          danger
          onClick={async () => {
            editorDispatch({
              type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE,
              removedComponent: {
                type: COMPONENT_TYPE.CHAPTER,
                id: chapterId
              }
            })

            const updatedGame = await api().games.getGame(
                studioId,
                chapter.gameId
              ),
              foundChapterIndex = updatedGame.chapters.findIndex(
                (chapterRef) => chapterRef === chapterId
              )

            updatedGame.chapters.splice(foundChapterIndex, 1)

            await Promise.all([
              api().games.saveChapterRefsToGame(
                studioId,
                chapter.gameId,
                updatedGame.chapters
              ),
              api().chapters.removeChapter(studioId, chapterId)
            ])
          }}
        >
          Remove Chapter
        </Button>
      )}
    </div>
  )
}

const ChapterView: React.FC<{
  studioId: StudioId
  chapterId: ComponentId
}> = ({ studioId, chapterId }) => {
  const chapter = useChapter(studioId, chapterId)

  useEffect(() => {
    logger.info('ChapterView mount effect')
  }, [])

  return (
    <>
      {chapter && (
        <Table
          columns={[
            { title: 'ID', key: 'id', dataIndex: 'id' },
            { title: 'Title', key: 'title', dataIndex: 'title' },
            {
              title: 'Scenes',
              key: 'sceneTotal',
              dataIndex: 'sceneTotal'
            }
          ]}
          dataSource={[
            {
              key: chapter.id,
              id: chapter.id,
              title: chapter.title,
              sceneTotal: chapter.scenes.length
            }
          ]}
          pagination={false}
        />
      )}
    </>
  )
}

export default ChapterView
