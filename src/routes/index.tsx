import React from 'react'

import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom'

import styles from './styles.module.scss'

import Dashboard from './Dashboard'

export default () => (
  <div className={styles.router}>
    <Router>
      <Switch>
        <Route path="/" component={Dashboard} />
      </Switch>
    </Router>
  </div>
)
