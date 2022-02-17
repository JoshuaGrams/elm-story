import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'

import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'

import { EngineContext } from '../contexts/EngineContext'

import { getPresentationSettings } from '../lib/api'

const Presentation: React.FC = ({ children }) => {
  const { engine } = useContext(EngineContext),
    { settings, settingsDispatch } = useContext(SettingsContext)

  const { data: presentationSettings } = useQuery(
    ['presentation', engine],
    async () => {
      if (!engine.worldInfo) return

      const { studioId, id: worldId } = engine.worldInfo

      return await getPresentationSettings(studioId, worldId)
    }
  )

  useEffect(() => {
    presentationSettings?.theme &&
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_THEME,
        theme: presentationSettings.theme,
        closeSettings: true
      })
  }, [presentationSettings?.theme])

  useEffect(() => {
    presentationSettings?.font &&
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_FONT,
        font: presentationSettings.font,
        closeSettings: true
      })
  }, [presentationSettings?.font])

  useEffect(() => {
    settings.theme &&
      document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  useEffect(() => {
    settings.font &&
      document.documentElement.setAttribute('data-font', settings.font)
  }, [settings.font])

  return <>{settings.theme && settings.font && children}</>
}

Presentation.displayName = 'Presentation'

export default Presentation
