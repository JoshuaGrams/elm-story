import React, { useEffect, useContext } from 'react'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import GameLibrary from '../../components/GameLibrary'
import ProfileSelect from '../../components/ProfileSelect'

import styles from './styles.module.scss'

const Dashboard = () => {
  const { app, appDispatch } = useContext(AppContext)

  useEffect(() => {
    appDispatch({ type: APP_ACTION_TYPE.HEADER, header: 'Dashboard' })
  }, [])

  return (
    <div>
      <ProfileSelect className={styles.profiles} />
      {app.selectedProfileId && (
        <GameLibrary profileId={app.selectedProfileId} />
      )}
    </div>
  )
}

export default Dashboard
