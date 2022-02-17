import React, { useCallback, useContext } from 'react'

import { resetWorld, savePresentationSettings } from '../lib/api'

import { ENGINE_FONT, ENGINE_THEME } from '../types'

import { EngineContext } from '../contexts/EngineContext'
import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'

import SettingsTitleBar from './SettingsTitleBar'

const Settings: React.FC = () => {
  const { engine } = useContext(EngineContext),
    { settings, settingsDispatch } = useContext(SettingsContext)

  if (!engine.worldInfo) return null

  const {
    studioId,
    id: worldId,
    copyright,
    description,
    designer,
    studioTitle,
    title,
    version,
    website
  } = engine.worldInfo

  const setTheme = useCallback(
    async (theme: ENGINE_THEME) => {
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_THEME,
        theme,
        closeSettings: true
      })

      await savePresentationSettings(
        studioId,
        worldId,
        theme,
        settings.font || ENGINE_FONT.SERIF
      )
    },
    [studioId, settings.font]
  )

  const setFont = useCallback(
    async (font: ENGINE_FONT) => {
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_FONT,
        font,
        closeSettings: true
      })

      await savePresentationSettings(
        studioId,
        worldId,
        settings.theme || ENGINE_THEME.CONSOLE,
        font
      )
    },
    [studioId, settings.theme]
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
                    ? 'settings-active'
                    : ''
                }
                onClick={() => setTheme(ENGINE_THEME.CONSOLE)}
              >
                Dark
              </a>{' '}
              <span>|</span>{' '}
              <a
                className={
                  settings.theme === ENGINE_THEME.BOOK ? 'settings-active' : ''
                }
                onClick={() => setTheme(ENGINE_THEME.BOOK)}
              >
                Light
              </a>
            </p>
          </div>

          <div>
            <h2>Font</h2>
            <p>
              <a
                className={
                  settings.font === ENGINE_FONT.SERIF ? 'settings-active' : ''
                }
                onClick={() => setFont(ENGINE_FONT.SERIF)}
              >
                Serif
              </a>{' '}
              <span>|</span>{' '}
              <a
                className={
                  settings.font === ENGINE_FONT.SANS ? 'settings-active' : ''
                }
                onClick={() => setFont(ENGINE_FONT.SANS)}
              >
                Sans
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
              <h2>Storyteller Mode</h2>
              <p>{import.meta.env.MODE}</p>
            </div>
          )}

          <div>
            <h2>Tools</h2>
            <p>
              <a
                onClick={async () => {
                  if (engine.worldInfo?.id) {
                    await resetWorld(studioId, worldId)
                    location.reload()
                  }
                }}
              >
                Reset World
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
