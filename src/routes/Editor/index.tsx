import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { useSelectedGame } from '../../hooks'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'

import { Button } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import GameOutline from '../../components/GameOutline'

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
      {app.selectedStudioId && selectedGame && (
        <>
          <Button onClick={() => history.push(APP_LOCATION.DASHBOARD)}>
            <LeftOutlined />
            Dashboard
          </Button>
          <GameOutline studioId={app.selectedStudioId} game={selectedGame} />
        </>
      )}
    </>
  )
}

export default Editor
