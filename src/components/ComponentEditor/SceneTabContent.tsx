import React from 'react'

import { ComponentId, StudioId } from '../../data/types'

import { useScene } from '../../hooks'

import { Table } from 'antd'

const SceneTabContent: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId)

  return (
    <>
      {scene && (
        <Table
          columns={[
            { title: 'ID', key: 'id', dataIndex: 'id' },
            { title: 'Title', key: 'title', dataIndex: 'title' },
            {
              title: 'Passages',
              key: 'passageTotal',
              dataIndex: 'passageTotal'
            }
          ]}
          dataSource={[
            {
              key: scene.id,
              id: scene.id,
              title: scene.title,
              passageTotal: scene.passages.length
            }
          ]}
          pagination={false}
        />
      )}
    </>
  )
}

export default SceneTabContent
