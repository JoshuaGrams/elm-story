import React from 'react'
import Router from './routes'

import ModalProvider from './contexts/AppModalContext'

import TitleBar from './components/TitleBar'
import AppMenu from './components/AppMenu'
import AppModal from './components/AppModal'

import { Button, Tooltip } from 'antd'
import { AccountBookFilled } from '@ant-design/icons'

import './App.global.less'

const App: React.FC = () => {
  return (
    <ModalProvider>
      <Router />

      <TitleBar />
      <AppMenu />
      <AppModal />
      <Tooltip title="hi">
        <Button>
          <AccountBookFilled />i
        </Button>
      </Tooltip>
    </ModalProvider>
  )
}

export default App
