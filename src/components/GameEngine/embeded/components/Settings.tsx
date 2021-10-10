import React, { useCallback, useContext } from 'react'

import { resetGame, saveThemeSetting } from '../lib/api'

import { ENGINE_THEME } from '../types/0.5.0'

import { EngineContext } from '../contexts/EngineContext'
import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'

import SettingsTitleBar from './SettingsTitleBar'

const Settings: React.FC = () => {
  const { engine } = useContext(EngineContext),
    { settings, settingsDispatch } = useContext(SettingsContext)

  if (!engine.gameInfo) return null

  const { studioId, id: gameId } = engine.gameInfo

  const setTheme = useCallback(
    async (theme: ENGINE_THEME) => {
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_THEME,
        theme,
        closeSettings: true
      })

      await saveThemeSetting(studioId, gameId, theme)
    },
    [studioId]
  )

  if (!settings.open) return null

  return (
    <>
      <div id="settings">
        <SettingsTitleBar />

        <div id="settings-content">
          <ul>
            <li>
              THEME:{' '}
              <a
                className={
                  settings.theme === ENGINE_THEME.CONSOLE
                    ? 'settings-active-theme'
                    : ''
                }
                onClick={() => setTheme(ENGINE_THEME.CONSOLE)}
              >
                Console
              </a>{' '}
              |{' '}
              <a
                className={
                  settings.theme === ENGINE_THEME.BOOK
                    ? 'settings-active-theme'
                    : ''
                }
                onClick={() => setTheme(ENGINE_THEME.BOOK)}
              >
                Book
              </a>{' '}
            </li>

            <li>
              <a
                onClick={async () => {
                  if (engine.gameInfo?.id) {
                    await resetGame(studioId, gameId)

                    location.reload()
                  }
                }}
              >
                Reset Game Data
              </a>
            </li>
            <li>MODE: {import.meta.env.MODE}</li>
          </ul>
        </div>
      </div>
    </>
  )
}

Settings.displayName = 'Settings'

export default Settings
