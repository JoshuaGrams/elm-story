import logger from '../../lib/logger'

import { ipcRenderer } from 'electron'
import React, { useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { COMPONENT_TYPE } from '../../data/types'

import { useGame } from '../../hooks'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'
import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { DividerBox } from 'rc-dock'

import GameInspector from '../../components/GameInspector'
import ComponentEditor from '../../components/ComponentEditor'
import ComponentInspector from '../../components/ComponentInspector'

import styles from './styles.module.less'

const Editor: React.FC = () => {
  const history = useHistory()

  const { app } = useContext(AppContext),
    { editor, editorDispatch } = useContext(EditorContext)

  const selectedGame =
    app.selectedStudioId && app.selectedGameId
      ? useGame(app.selectedStudioId, app.selectedGameId, [
          app.selectedStudioId,
          app.selectedGameId
        ])
      : undefined

  function closeActiveTab() {
    if (editor.selectedGameOutlineComponent.type !== COMPONENT_TYPE.GAME) {
      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_CLOSE_TAB,
        closedEditorTab: {
          id: editor.selectedGameOutlineComponent.id,
          type: editor.selectedGameOutlineComponent.type
        }
      })
    }
  }

  useEffect(() => {
    ipcRenderer.removeAllListeners(WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW)

    ipcRenderer.on(WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW, closeActiveTab)
  }, [editor.selectedGameOutlineComponent])

  useEffect(() => {
    logger.info(`Editor->selectedGame->useEffect`)

    selectedGame?.id &&
      !editor.selectedGameOutlineComponent.id &&
      editorDispatch({
        type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
        selectedGameOutlineComponent: {
          id: selectedGame.id,
          title: selectedGame.title,
          type: COMPONENT_TYPE.GAME,
          expanded: true
        }
      })
  }, [selectedGame])

  useEffect(() => {
    return function removeListeners() {
      ipcRenderer.removeAllListeners(WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW)
    }
  }, [])

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
            <GameInspector
              studioId={app.selectedStudioId}
              game={selectedGame}
            />
          </DividerBox>

          <ComponentEditor
            studioId={app.selectedStudioId}
            game={selectedGame}
          />

          <DividerBox mode="vertical" className={styles.inspectorPanel}>
            <ComponentInspector
              studioId={app.selectedStudioId}
              gameId={app.selectedGameId}
            />
          </DividerBox>
        </DividerBox>
      )}
    </>
  )
}

export default Editor
