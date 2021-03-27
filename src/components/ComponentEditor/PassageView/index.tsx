import React, { useEffect } from 'react'
import logger from '../../../lib/logger'

import { ComponentId, StudioId } from '../../../data/types'

import { usePassage } from '../../../hooks'

import { Button, Table } from 'antd'

export const PassageViewTools: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = () => {
  return <div>Passage View Tools</div>
}

const PassageView: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
  const passage = usePassage(studioId, passageId)

  useEffect(() => {
    logger.info('PassageView mount effect')
  }, [])

  return (
    <>
      {passage && (
        <Table
          columns={[
            { title: 'ID', key: 'id', dataIndex: 'id' },
            { title: 'Title', key: 'title', dataIndex: 'title' },
            {
              title: 'Scenes',
              key: 'choiceTotal',
              dataIndex: 'choiceTotal'
            }
          ]}
          dataSource={[
            {
              key: passage.id,
              id: passage.id,
              title: passage.title,
              choiceTotal: 0
            }
          ]}
          pagination={false}
        />
      )}
    </>
  )
}

export default PassageView
