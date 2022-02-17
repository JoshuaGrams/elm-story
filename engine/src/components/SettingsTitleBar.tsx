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
          <path
            fillRule="evenodd"
            d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"
          />
          <path
            fillRule="evenodd"
            d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"
          />
        </svg>
      </button>
    </div>
  )
}

SettingsTitleBar.displayName = 'SettingsTitleBar'

export default SettingsTitleBar
