import React from 'react'
import Router from './routes'

import TitleBar from './components/TitleBar'

import './App.global.scss'

export default () => {
  return (
    <>
      <Router />
      <TitleBar />
    </>
  )
}
