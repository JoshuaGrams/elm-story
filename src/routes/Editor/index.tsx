import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { useSelectedGame } from '../../hooks'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'

import { DividerBox } from 'rc-dock'

import GameOutline from '../../components/GameOutline'
import ComponentEditor from '../../components/ComponentEditor'
import GameInspector from '../../components/GameInspector'

import styles from './styles.module.less'

const Editor: React.FC = () => {
  const history = useHistory()

  const { app } = useContext(AppContext)

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
        <DividerBox mode="horizontal" className={styles.editor}>
          <DividerBox mode="vertical" className={styles.gameOutlinePanel}>
            <GameOutline studioId={app.selectedStudioId} game={selectedGame} />
          </DividerBox>

          <ComponentEditor />

          <DividerBox mode="vertical" className={styles.inspectorPanel}>
            <GameInspector />
          </DividerBox>
        </DividerBox>
      )}
    </>
  )
}

export default Editor
