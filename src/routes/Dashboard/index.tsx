import React, { useEffect, useContext } from 'react'

import ProfileSelect from '../../components/ProfileSelect'
import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import styles from './styles.module.scss'

const Dashboard = () => {
  const { app, appDispatch } = useContext(AppContext)

  useEffect(() => {
    appDispatch({ type: APP_ACTION_TYPE.HEADER, header: 'Dashboard' })
  }, [])

  return (
    <div>
      <ProfileSelect className={styles.profiles} />
      {app.selectedProfileId && <h1>Game Library</h1>}
    </div>
  )
}

export default Dashboard
