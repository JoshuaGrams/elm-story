import React, { useEffect } from 'react'
import logger from '../../lib/logger'

import { ComponentId, StudioId } from '../../data/types'

import { useGame } from '../../hooks'

import { Table } from 'antd'

const ChapterTabContent: React.FC<{
  studioId: StudioId
  gameId: ComponentId
}> = ({ studioId, gameId }) => {
  const game = useGame(studioId, gameId)

  useEffect(() => {
    logger.info('GameTabComponent mount effect')
  }, [])

  return (
    <>
      {game && (
        <Table
          columns={[
            { title: 'ID', key: 'id', dataIndex: 'id' },
            { title: 'Title', key: 'title', dataIndex: 'title' },
            {
              title: 'Chapters',
              key: 'chapterTotal',
              dataIndex: 'chapterTotal'
            }
          ]}
          dataSource={[
            {
              key: game.id,
              id: game.id,
              title: game.title,
              chapterTotal: game.chapters.length
            }
          ]}
          pagination={false}
        />
      )}
    </>
  )
}

export default ChapterTabContent
