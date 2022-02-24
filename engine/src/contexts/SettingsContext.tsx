import React, { createContext, useMemo, useReducer } from 'react'

import { ENGINE_MOTION, ENGINE_FONT, ENGINE_SIZE, ENGINE_THEME } from '../types'

interface SettingsContext {
  open: boolean
  theme: ENGINE_THEME | undefined
  font: ENGINE_FONT | undefined
  size: ENGINE_SIZE | undefined
  motion: ENGINE_MOTION | undefined
  muted: boolean
}

export enum SETTINGS_ACTION_TYPE {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
  SET_THEME = 'SET_THEME',
  SET_FONT = 'SET_FONT',
  SET_MOTION = 'SET_ANIMATION',
  SET_MUTED = 'SET_MUTED',
  SET_SIZE = 'SET_SCALE'
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
  | {
      closeSettings: boolean
      motion: ENGINE_MOTION
      type: SETTINGS_ACTION_TYPE.SET_MOTION
    }
  | {
      closeSettings: boolean
      muted: boolean
      type: SETTINGS_ACTION_TYPE.SET_MUTED
    }
  | {
      closeSettings: boolean
      size: ENGINE_SIZE
      type: SETTINGS_ACTION_TYPE.SET_SIZE
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
    case SETTINGS_ACTION_TYPE.SET_FONT:
      return {
        ...state,
        font: action.font,
        open: action.closeSettings ? false : true
      }

    case SETTINGS_ACTION_TYPE.SET_MOTION:
      return {
        ...state,
        motion: action.motion,
        open: action.closeSettings ? false : true
      }
    case SETTINGS_ACTION_TYPE.SET_MUTED:
      return {
        ...state,
        muted: action.muted,
        open: action.closeSettings ? false : true
      }
    case SETTINGS_ACTION_TYPE.SET_SIZE:
      return {
        ...state,
        size: action.size,
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
  theme: undefined,
  font: undefined,
  motion: undefined,
  muted: false,
  size: undefined
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
