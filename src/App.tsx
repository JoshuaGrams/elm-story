import React from 'react'
import Router from './routes'

import ModalProvider from './contexts/AppModalContext'

import TitleBar from './components/TitleBar'
import AppMenu from './components/AppMenu'
import AppModal from './components/AppModal'

import './App.global.scss'

const App: React.FC = () => {
  return (
    <ModalProvider>
      <Router />

      <TitleBar />
      <AppMenu />
      <AppModal />
    </ModalProvider>
  )
}

export default App
