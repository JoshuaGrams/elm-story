import React, { useContext } from 'react'

import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'

const SettingsTitleBar: React.FC = () => {
  const { settingsDispatch } = useContext(SettingsContext)

  return (
    <div id="settings-title-bar" className="title-bar">
      <span id="settings-title-bar-title" className="title-bar-title">
        Settings
      </span>
      <button
        onClick={() => settingsDispatch({ type: SETTINGS_ACTION_TYPE.CLOSE })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z" />
        </svg>
      </button>
    </div>
  )
}

SettingsTitleBar.displayName = 'SettingsTitleBar'

export default SettingsTitleBar
