import React from 'react'
import ReactFlow from 'react-flow-renderer'

import { ComponentId, StudioId } from '../../data/types'

import { useScene } from '../../hooks'

import { Table } from 'antd'

const elements = [
  {
    id: '1',
    data: { label: <div>Passage 1</div> },
    position: { x: 250, y: 5 }
  },
  {
    id: '2',
    data: { label: <div>Passage 2</div> },
    position: { x: 100, y: 100 }
  },
  {
    id: '3',
    data: { label: <div>Passage 3</div> },
    position: { x: 300, y: 50 }
  },
  { id: 'e1-2', source: '1', target: '2', animated: true }
]

const SceneTabContent: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId)

  return (
    <>
      {scene && (
        <>
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
          <ReactFlow elements={elements} />
        </>
      )}
    </>
  )
}

export default SceneTabContent
