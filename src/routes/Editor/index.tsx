import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { useSelectedGame } from '../../hooks'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'
import { EditorContext } from '../../contexts/EditorContext'

import GameOutline from '../../components/GameOutline'

import styles from './styles.module.less'

const Editor: React.FC = () => {
  const history = useHistory()

  const { app } = useContext(AppContext)
  const { editor } = useContext(EditorContext)

  const selectedGame =
    app.selectedStudioId && app.selectedGameId
      ? useSelectedGame(app.selectedStudioId, app.selectedGameId)
      : undefined

  return (
    <>
      {/* Route back to Dashboard */}
      {!app.selectedStudioId || !app.selectedGameId
        ? history.replace(APP_LOCATION.DASHBOARD)
        : null}

      {/* Editor */}
      {app.selectedStudioId && selectedGame && (
        <div className={styles.editor}>
          <GameOutline studioId={app.selectedStudioId} game={selectedGame} />
          <div>{editor.selectedGameOutlineComponent.id}</div>
        </div>
      )}
    </>
  )
}

export default Editor
