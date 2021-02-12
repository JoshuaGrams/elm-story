import React from 'react'
import { render } from 'react-dom'

import AppProvider from './contexts/AppContext'

import App from './App'

render(
  <AppProvider>
    <App />
  </AppProvider>,
  document.getElementById('root')
)
