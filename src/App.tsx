import React from 'react'
import Router from './routes'

import AppProvider from './contexts/AppContext'
import ModalProvider from './contexts/AppModalContext'

import TitleBar from './components/TitleBar'
import AppModal from './components/AppModal'

import './App.global.scss'

export default () => {
  return (
    <>
      <AppProvider>
        <ModalProvider>
          <Router />
          <TitleBar />
          <AppModal />
        </ModalProvider>
      </AppProvider>
    </>
  )
}
