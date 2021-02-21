import React, { useEffect, useContext } from 'react'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import GameLibrary from '../../components/GameLibrary'
import StudioSelect from '../../components/StudioSelect'

import styles from './styles.module.less'

const Dashboard = () => {
  const { app, appDispatch } = useContext(AppContext)

  useEffect(() => {
    appDispatch({ type: APP_ACTION_TYPE.HEADER, header: 'Dashboard' })
  }, [])

  return (
    <div>
      <StudioSelect className={styles.studios} />
      {app.selectedStudioId && <GameLibrary studioId={app.selectedStudioId} />}
    </div>
  )
}

export default Dashboard
