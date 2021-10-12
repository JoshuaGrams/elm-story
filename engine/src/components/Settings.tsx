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

  const {
    studioId,
    id: gameId,
    copyright,
    description,
    designer,
    studioTitle,
    title,
    version,
    website
  } = engine.gameInfo

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
          <div>
            <h2>Theme</h2>
            <p>
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
              </a>
            </p>
          </div>

          <div>
            <h2>Title</h2>
            <p>{title}</p>
          </div>

          {description && (
            <div>
              <h2>Description</h2>
              <p>{description}</p>
            </div>
          )}

          <div>
            <h2>Studio</h2>
            <p>{studioTitle}</p>
          </div>

          <div>
            <h2>Designer</h2>
            <p>{designer}</p>
          </div>

          <div>
            <h2>Version</h2>
            <p>{version}</p>
          </div>

          {copyright && (
            <div>
              <h2>Copyright</h2>
              <p>{copyright}</p>
            </div>
          )}

          {website && (
            <div>
              <h2>Website</h2>
              <p>
                <a href={website}>{website}</a>
              </p>
            </div>
          )}

          {import.meta.env.MODE === 'development' && (
            <div>
              <h2>Engine Mode</h2>
              <p>{import.meta.env.MODE}</p>
            </div>
          )}

          <div>
            <h2>Tools</h2>
            <p>
              <a
                onClick={async () => {
                  if (engine.gameInfo?.id) {
                    await resetGame(studioId, gameId)
                    location.reload()
                  }
                }}
              >
                Reset Game
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

Settings.displayName = 'Settings'

export default Settings
