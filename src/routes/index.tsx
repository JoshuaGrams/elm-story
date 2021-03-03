import React from 'react'

import { Switch, Route } from 'react-router-dom'

import Dashboard from './Dashboard'
import EditorProvider from '../contexts/EditorContext'
import Editor from './Editor'

import styles from './styles.module.less'

const Routes: React.FC = () => (
  <>
    <div className={styles.routes}>
      <Switch>
        <Route path="/editor">
          <EditorProvider>
            <Editor />
          </EditorProvider>
        </Route>
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </div>
  </>
)

export default Routes
