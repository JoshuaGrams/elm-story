import React, { useContext } from 'react'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'
import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'

const EventStreamTitleBar: React.FC = () => {
  const { engine, engineDispatch } = useContext(EngineContext),
    { settingsDispatch } = useContext(SettingsContext)

  return (
    <>
      {engine.worldInfo && (
        <div id="live-event-stream-title-bar" className="title-bar">
          <button
            onClick={() => engineDispatch({ type: ENGINE_ACTION_TYPE.STOP })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
              />
            </svg>
          </button>
          <span
            id="live-event-stream-title-bar-world-title"
            className="title-bar-title"
          >
            {engine.worldInfo.title}
          </span>
          {!engine.isComposer && (
            <button
              onClick={() =>
                settingsDispatch({ type: SETTINGS_ACTION_TYPE.OPEN })
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1H10V1.5a.5.5 0 0 1 .5-.5ZM12 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Zm-6.5 2A.5.5 0 0 1 6 6v1.5h8.5a.5.5 0 0 1 0 1H6V10a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5ZM1 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 1 8Zm9.5 2a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V13H1.5a.5.5 0 0 1 0-1H10v-1.5a.5.5 0 0 1 .5-.5Zm1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Z"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}

EventStreamTitleBar.displayName = 'EventStreamTitleBar'

export default EventStreamTitleBar
