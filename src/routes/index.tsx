import React, { useContext } from 'react'

import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import { AppContext, LOCATION } from '../contexts/AppContext'

import Dashboard from './Dashboard'
import Editor from './Editor'

import styles from './styles.module.less'

export default () => {
  const { app } = useContext(AppContext)

  return (
    <>
      <div className={styles.router}>
        <Router>
          <Switch>
            <Route path="/editor" component={Editor} />
            <Route path="/" component={Dashboard} />
          </Switch>

          {app.location === LOCATION.DASHBOARD && (
            <Redirect to={LOCATION.DASHBOARD} />
          )}

          {app.location === LOCATION.EDITOR && (
            <Redirect to={LOCATION.EDITOR} />
          )}
        </Router>
      </div>
    </>
  )
}
