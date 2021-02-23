import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'

import { useSelectedGame } from '../../hooks'

import { Table, Button } from 'antd'
import { LeftOutlined, EditOutlined } from '@ant-design/icons'

const Editor: React.FC = () => {
  const history = useHistory()
  const { app } = useContext(AppContext)
  const selectedGame =
    app.selectedStudioId && app.selectedGameId
      ? useSelectedGame(app.selectedStudioId, app.selectedGameId)
      : undefined

  return (
    <>
      {!app.selectedStudioId || !app.selectedGameId
        ? history.replace(APP_LOCATION.DASHBOARD)
        : null}
      {selectedGame && (
        <>
          <Button onClick={() => history.push(APP_LOCATION.DASHBOARD)}>
            <LeftOutlined />
            Dashboard
          </Button>

          <Table
            columns={[
              { title: 'Title', dataIndex: 'title', key: 'title' },
              { title: 'Director', dataIndex: 'director', key: 'director' },
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Edit', dataIndex: 'edit', key: 'edit' }
            ]}
            dataSource={[
              {
                key: '1',
                title: selectedGame.title,
                director: selectedGame.director,
                id: selectedGame.id,
                edit: (
                  <Button>
                    <EditOutlined />
                  </Button>
                )
              }
            ]}
            pagination={false}
          />
        </>
      )}
    </>
  )
}

export default Editor
