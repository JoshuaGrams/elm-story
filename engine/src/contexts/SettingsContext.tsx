import React, { createContext, useMemo, useReducer } from 'react'

import { ENGINE_FONT, ENGINE_THEME } from '../types'

interface SettingsContext {
  open: boolean
  font: ENGINE_FONT | undefined
  theme: ENGINE_THEME | undefined
}

export enum SETTINGS_ACTION_TYPE {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
  SET_FONT = 'SET_FONT',
  SET_THEME = 'SET_THEME'
}

type SettingsActionType =
  | { type: SETTINGS_ACTION_TYPE.CLOSE }
  | { type: SETTINGS_ACTION_TYPE.OPEN }
  | {
      closeSettings: boolean
      theme: ENGINE_THEME
      type: SETTINGS_ACTION_TYPE.SET_THEME
    }
  | {
      closeSettings: boolean
      font: ENGINE_FONT
      type: SETTINGS_ACTION_TYPE.SET_FONT
    }

const settingsReducer = (
  state: SettingsContext,
  action: SettingsActionType
): SettingsContext => {
  switch (action.type) {
    case SETTINGS_ACTION_TYPE.CLOSE:
      return {
        ...state,
        open: false
      }
    case SETTINGS_ACTION_TYPE.OPEN:
      return {
        ...state,
        open: true
      }
    case SETTINGS_ACTION_TYPE.SET_FONT:
      return {
        ...state,
        font: action.font,
        open: action.closeSettings ? false : true
      }
    case SETTINGS_ACTION_TYPE.SET_THEME:
      return {
        ...state,
        theme: action.theme,
        open: action.closeSettings ? false : true
      }
    default:
      return state
  }
}

interface SettingsContextType {
  settings: SettingsContext
  settingsDispatch: (action: SettingsActionType) => void
}

const defaultSettingsState: SettingsContext = {
  open: false,
  font: undefined,
  theme: undefined
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettingsState,
  settingsDispatch: () => null
})

SettingsContext.displayName = 'Context'

const SettingsProvider: React.FC = ({ children }) => {
  const [settings, settingsDispatch] = useReducer(
    settingsReducer,
    defaultSettingsState
  )

  return (
    <SettingsContext.Provider
      value={useMemo(() => ({ settings, settingsDispatch }), [
        settings,
        settingsDispatch
      ])}
    >
      {children}
    </SettingsContext.Provider>
  )
}

SettingsProvider.displayName = 'SettingsProvider'

export default SettingsProvider
