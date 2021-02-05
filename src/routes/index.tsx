import React from 'react'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Dashboard from './Dashboard'

export default () => (
  <Router>
    <Switch>
      <Route path="/" component={Dashboard} />
    </Switch>
  </Router>
)
