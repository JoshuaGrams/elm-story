import { ipcRenderer } from 'electron'
import React, { useContext, useEffect } from 'react'
import { usePageVisibility } from 'react-page-visibility'

import { WINDOW_EVENT_TYPE } from './lib/events'

import { AppContext, APP_ACTION_TYPE } from './contexts/AppContext'

import { ErrorModal } from './components/Modal'

import Routes from './routes'

import TitleBar from './components/TitleBar'

import './App.global.less'

const App: React.FC = () => {
  const { app, appDispatch } = useContext(AppContext)

  const visible = usePageVisibility()

  useEffect(() => {
    appDispatch({ type: APP_ACTION_TYPE.SET_VISIBLE, visible })
  }, [visible])

  useEffect(() => {
    ipcRenderer.on(WINDOW_EVENT_TYPE.PLATFORM, (_, [platform]) =>
      appDispatch({ type: APP_ACTION_TYPE.PLATFORM, platform })
    )
  }, [])

  return (
    <>
      {app.platform && (
        <>
          {app.errorModal.visible && (
            <ErrorModal
              message={app.errorModal.message}
              code={app.errorModal.code}
            />
          )}

          <Routes />

          <TitleBar />
        </>
      )}
    </>
  )
}

export default App
