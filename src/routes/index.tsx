import React from 'react'

import { Switch, Route } from 'react-router-dom'

import Dashboard from './Dashboard'
import Editor from './Editor'

import styles from './styles.module.less'

const Routes: React.FC = () => (
  <>
    <div className={styles.routes}>
      <Switch>
        <Route path="/editor">
          <Editor />
        </Route>
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </div>
  </>
)

export default Routes
