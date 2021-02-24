import React from 'react'
import Routes from './routes'

import TitleBar from './components/TitleBar'
import AppMenu from './components/AppMenu'

import './App.global.less'

const App: React.FC = () => {
  return (
    <>
      <Routes />

      <TitleBar />
      <AppMenu />
    </>
  )
}

export default App
