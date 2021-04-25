import { ipcRenderer } from 'electron'
import React, { useContext, useEffect } from 'react'

import { WINDOW_EVENT_TYPE } from './lib/events'

import { AppContext, APP_ACTION_TYPE } from './contexts/AppContext'

import Routes from './routes'

import TitleBar from './components/TitleBar'
import AppMenu from './components/AppMenu'

import './App.global.less'

const App: React.FC = () => {
  const { app, appDispatch } = useContext(AppContext)

  useEffect(() => {
    ipcRenderer.on(WINDOW_EVENT_TYPE.PLATFORM, (_, [platform]) =>
      appDispatch({ type: APP_ACTION_TYPE.PLATFORM, platform })
    )
  }, [])
  return (
    <>
      {app.platform && (
        <>
          <Routes />

          <TitleBar />
          <AppMenu />
        </>
      )}
    </>
  )
}

export default App
