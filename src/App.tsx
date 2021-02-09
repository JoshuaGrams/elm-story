import React from 'react'
import Router from './routes'

import AppProvider from './contexts/AppContext'
import TitleBar from './components/TitleBar'

import './App.global.scss'

export default () => {
  return (
    <>
      <AppProvider>
        <Router />
        <TitleBar />
      </AppProvider>
    </>
  )
}
