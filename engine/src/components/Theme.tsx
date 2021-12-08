import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'

import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'
import { getThemeSetting } from '../lib/api'
import { EngineContext } from '../contexts/EngineContext'

const Theme: React.FC = ({ children }) => {
  const { engine } = useContext(EngineContext),
    { settings, settingsDispatch } = useContext(SettingsContext)

  const theme = useQuery(['theme', engine], async () => {
    if (!engine.worldInfo) return

    const { studioId, id: worldId } = engine.worldInfo

    return await getThemeSetting(studioId, worldId)
  })

  useEffect(() => {
    theme.data &&
      settingsDispatch({
        type: SETTINGS_ACTION_TYPE.SET_THEME,
        theme: theme.data,
        closeSettings: true
      })
  }, [theme.data])

  useEffect(() => {
    settings.theme &&
      document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  return <>{settings.theme && children}</>
}

Theme.displayName = 'Theme'

export default Theme
