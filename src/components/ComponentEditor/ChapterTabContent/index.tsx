import React, { useEffect } from 'react'
import logger from '../../../lib/logger'

import { ComponentId, StudioId } from '../../../data/types'

import { useChapter } from '../../../hooks'

import { Table } from 'antd'

const ChapterTabContent: React.FC<{
  studioId: StudioId
  chapterId: ComponentId
}> = ({ studioId, chapterId }) => {
  const chapter = useChapter(studioId, chapterId)

  useEffect(() => {
    logger.info('ChapterTabContent mount effect')
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

export default ChapterTabContent
