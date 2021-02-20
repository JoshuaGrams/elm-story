import React, { useContext } from 'react'

import {
  AppContext,
  APP_ACTION_TYPE,
  LOCATION
} from '../../contexts/AppContext'

const Editor: React.FC = () => {
  const { app, appDispatch } = useContext(AppContext)

  return (
    <>
      <h2>
        <a
          onClick={() =>
            appDispatch({
              type: APP_ACTION_TYPE.LOCATION,
              location: LOCATION.DASHBOARD
            })
          }
        >
          Dashboard
        </a>{' '}
        | Editor
      </h2>
      <div>{`Game ID: ${app.selectedGameId}` || 'Unknown Game ID'}</div>
    </>
  )
}

export default Editor
