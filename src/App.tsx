import React from 'react'
import Routes from './routes'

import ModalProvider from './contexts/AppModalContext'

import TitleBar from './components/TitleBar'
import AppMenu from './components/AppMenu'
import AppModal from './components/AppModal'

import './App.global.less'

const App: React.FC = () => {
  return (
    <ModalProvider>
      <Routes />

      <TitleBar />
      <AppMenu />
      <AppModal />
    </ModalProvider>
  )
}

export default App
