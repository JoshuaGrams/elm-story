import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'

const Editor: React.FC = () => {
  const history = useHistory()
  const { app } = useContext(AppContext)

  return (
    <>
      {!app.selectedStudioId || !app.selectedGameId ? (
        history.replace(APP_LOCATION.DASHBOARD)
      ) : (
        <>
          <h2>
            <a onClick={() => history.push(APP_LOCATION.DASHBOARD)}>
              Dashboard
            </a>{' '}
            | Editor
          </h2>
          <div>{`Game ID: ${app.selectedGameId}` || 'Unknown Game ID'}</div>
        </>
      )}
    </>
  )
}

export default Editor
