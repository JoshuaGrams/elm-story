import logger from '../../lib/logger'

import { ipcRenderer } from 'electron'
import React, { useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { ELEMENT_TYPE } from '../../data/types'

import { useWorld } from '../../hooks'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'
import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { DividerBox } from 'rc-dock'

import WorldInspector from '../../components/WorldInspector'
import ElementComposer from '../../components/ElementComposer'
import ElementInspector from '../../components/ElementInspector'

import styles from './styles.module.less'

const Editor: React.FC = () => {
  const history = useHistory()

  const { app } = useContext(AppContext),
    { editor, editorDispatch } = useContext(EditorContext)

  const selectedWorld =
    app.selectedStudioId && app.selectedWorldId
      ? useWorld(app.selectedStudioId, app.selectedWorldId)
      : undefined

  function closeActiveTab() {
    if (editor.selectedWorldOutlineElement.type !== ELEMENT_TYPE.WORLD) {
      editorDispatch({
        type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_CLOSE_TAB,
        closedEditorTab: {
          id: editor.selectedWorldOutlineElement.id,
          type: editor.selectedWorldOutlineElement.type
        }
      })
    }
  }

  useEffect(() => {
    ipcRenderer.removeAllListeners(WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW)

    ipcRenderer.on(WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW, closeActiveTab)
  }, [editor.selectedWorldOutlineElement])

  useEffect(() => {
    logger.info(`Editor->selectedGame->useEffect`)

    selectedWorld?.id &&
      !editor.selectedWorldOutlineElement.id &&
      editorDispatch({
        type: EDITOR_ACTION_TYPE.WORLD_OUTLINE_SELECT,
        selectedWorldOutlineElement: {
          id: selectedWorld.id,
          title: selectedWorld.title,
          type: ELEMENT_TYPE.WORLD,
          expanded: true
        }
      })
  }, [selectedWorld])

  useEffect(() => {
    return function removeListeners() {
      ipcRenderer.removeAllListeners(WINDOW_EVENT_TYPE.CLOSE_TAB_OR_WINDOW)
    }
  }, [])

  return (
    <>
      {/* Route back to Dashboard */}
      {!app.selectedStudioId || !app.selectedWorldId
        ? history.replace(APP_LOCATION.DASHBOARD)
        : null}

      {/* Editor */}
      {app.selectedStudioId && selectedWorld && (
        <DividerBox mode="horizontal" className={styles.editor}>
          <DividerBox mode="vertical" className={styles.gameOutlinePanel}>
            <WorldInspector
              studioId={app.selectedStudioId}
              world={selectedWorld}
            />
          </DividerBox>

          <ElementComposer
            studioId={app.selectedStudioId}
            world={selectedWorld}
          />

          <DividerBox mode="vertical" className={styles.inspectorPanel}>
            <ElementInspector
              studioId={app.selectedStudioId}
              worldId={app.selectedWorldId}
            />
          </DividerBox>
        </DividerBox>
      )}
    </>
  )
}

export default Editor
