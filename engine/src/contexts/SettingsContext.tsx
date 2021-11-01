import React, { createContext, useMemo, useReducer } from 'react'

import { ENGINE_THEME } from '../types/0.5.1'

interface SettingsContext {
  open: boolean
  theme: ENGINE_THEME | undefined
}

export enum SETTINGS_ACTION_TYPE {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
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
