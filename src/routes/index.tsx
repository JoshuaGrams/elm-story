import React from 'react'

import { Switch, Route } from 'react-router-dom'

import ComposerProvider from '../contexts/ComposerContext'

import Dashboard from './Dashboard'
import Editor from './Editor'

import styles from './styles.module.less'

const Routes: React.FC = () => (
  <>
    <div className={styles.routes}>
      <Switch>
        <Route path="/editor">
          <ComposerProvider>
            <Editor />
          </ComposerProvider>
        </Route>
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </div>
  </>
)

export default Routes
