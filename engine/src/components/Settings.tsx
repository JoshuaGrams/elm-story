import React, { useCallback, useContext } from 'react'

import { resetWorld, savePresentationSettings } from '../lib/api'

import { ENGINE_MOTION, ENGINE_FONT, ENGINE_SIZE, ENGINE_THEME } from '../types'

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

  const { theme, font, motion, size } = settings

  const setTheme = useCallback(
    async (selectedTheme: ENGINE_THEME) => {
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_THEME,
        theme: selectedTheme,
        closeSettings: false
      })

      const {} = settings

      await savePresentationSettings(studioId, worldId, {
        theme: selectedTheme,
        font,
        size,
        motion
      })
    },
    [studioId, settings.font]
  )

  const setFont = useCallback(
    async (selectedFont: ENGINE_FONT) => {
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_FONT,
        font: selectedFont,
        closeSettings: false
      })

      await savePresentationSettings(studioId, worldId, {
        theme,
        font: selectedFont,
        size: size,
        motion
      })
    },
    [studioId, settings.theme]
  )

  const setSize = useCallback(
    async (selectedSize: ENGINE_SIZE) => {
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_SIZE,
        size: selectedSize,
        closeSettings: false
      })

      await savePresentationSettings(studioId, worldId, {
        theme,
        font,
        motion,
        size: selectedSize
      })
    },
    [studioId, settings.theme]
  )

  const setMotion = useCallback(
    async (selectedMotion: ENGINE_MOTION) => {
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_MOTION,
        motion: selectedMotion,
        closeSettings: false
      })

      await savePresentationSettings(studioId, worldId, {
        theme,
        font,
        motion: selectedMotion,
        size
      })
    },
    [studioId, settings.theme]
  )

  if (!settings.open) return null

  return (
    <>
      <div id="settings">
        <SettingsTitleBar />

        <div id="settings-content">
          <section>
            <h1>Presentation</h1>

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
                    settings.theme === ENGINE_THEME.BOOK
                      ? 'settings-active'
                      : ''
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
              <h2>Scale</h2>
              <p>
                <a
                  className={
                    settings.size === ENGINE_SIZE.DEFAULT
                      ? 'settings-active'
                      : ''
                  }
                  onClick={() => setSize(ENGINE_SIZE.DEFAULT)}
                >
                  Default
                </a>{' '}
                <span>|</span>{' '}
                <a
                  className={
                    settings.size === ENGINE_SIZE.LARGE ? 'settings-active' : ''
                  }
                  onClick={() => setSize(ENGINE_SIZE.LARGE)}
                >
                  Large
                </a>
              </p>
            </div>

            <div>
              <h2>Animation</h2>
              <p>
                <a
                  className={
                    settings.motion === ENGINE_MOTION.FULL
                      ? 'settings-active'
                      : ''
                  }
                  onClick={() => setMotion(ENGINE_MOTION.FULL)}
                >
                  Full
                </a>{' '}
                <span>|</span>{' '}
                <a
                  className={
                    settings.motion === ENGINE_MOTION.REDUCED
                      ? 'settings-active'
                      : ''
                  }
                  onClick={() => setMotion(ENGINE_MOTION.REDUCED)}
                >
                  Reduced
                </a>
              </p>
            </div>
          </section>

          <section>
            <h1>Storyworld</h1>

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
                  <a href={website} target="_blank">
                    {website}
                  </a>
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
          </section>
        </div>
      </div>
    </>
  )
}

Settings.displayName = 'Settings'

export default Settings
