import React, { useContext } from 'react'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const ResetNotification: React.FC = () => {
  const { engine, engineDispatch } = useContext(EngineContext)

  return (
    <>
      {engine.resetNotification.showing && (
        <div id="engine-reset-notification">
          <span>{engine.resetNotification.message}</span>

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={() => {
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION
                })

                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_INSTALLED,
                  installed: false
                })
              }}
            >
              Refresh Event Stream
            </button>
          </div>
        </div>
      )}
    </>
  )
}

ResetNotification.displayName = 'ResetNotification'

export default ResetNotification
