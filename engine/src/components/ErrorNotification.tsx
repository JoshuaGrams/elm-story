import React, { useContext } from 'react'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const ErrorNotification: React.FC = () => {
  const { engine, engineDispatch } = useContext(EngineContext)

  return (
    <>
      {engine.errorNotification.showing && (
        <div id="engine-error-notification">
          <span>{engine.errorNotification.message || 'Unknown error.'}</span>

          <div style={{ textAlign: 'right' }}>
            <button
              style={{ marginRight: '0.6rem' }}
              onClick={() => {
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.HIDE_ERROR_NOTIFICATION
                })
              }}
            >
              Dismiss
            </button>

            <button
              onClick={() => {
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.HIDE_ERROR_NOTIFICATION
                })

                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_INSTALLED,
                  installed: false
                })

                setTimeout(
                  () =>
                    engineDispatch({
                      type: ENGINE_ACTION_TYPE.DEVTOOLS_RESET,
                      reset: true
                    }),
                  1
                )
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

ErrorNotification.displayName = 'ErrorNotification'

export default ErrorNotification
