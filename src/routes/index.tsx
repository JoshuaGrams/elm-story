import React from 'react'

import { Switch, Route } from 'react-router-dom'

import EditorProvider from '../contexts/EditorContext'
import EngineProvider from '../contexts/EngineContext'

import Dashboard from './Dashboard'
import Editor from './Editor'

import styles from './styles.module.less'

const Routes: React.FC = () => (
  <>
    <div className={styles.routes}>
      <Switch>
        <Route path="/editor">
          <EngineProvider>
            <EditorProvider>
              <Editor />
            </EditorProvider>
          </EngineProvider>
        </Route>
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </div>
  </>
)

export default Routes
