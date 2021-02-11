import React from 'react'
import Router from './routes'

import AppProvider from './contexts/AppContext'
import ModalProvider from './contexts/AppModalContext'

import TitleBar from './components/TitleBar'
import AppMenu from './components/AppMenu'
import AppModal from './components/AppModal'

import './App.global.scss'

export default () => {
  return (
    <>
      <AppProvider>
        <ModalProvider>
          <Router />

          <TitleBar />
          <AppMenu />
          <AppModal />
        </ModalProvider>
      </AppProvider>
    </>
  )
}
