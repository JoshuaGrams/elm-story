import React, { useMemo, createContext, useReducer } from 'react'
import { StudioId, WorldId, PLATFORM_TYPE } from '../data/types'

interface AppState {
  version: string
  build: string
  platform?: PLATFORM_TYPE
  fullscreen: boolean
  location: APP_LOCATION
  selectedStudioId?: StudioId
  selectedWorldId?: WorldId
  visible: boolean
  errorModal: {
    visible: boolean
    message: string | null
    code: string | null
  }
}

export enum APP_ACTION_TYPE {
  PLATFORM = 'PLATFORM',
  FULLSCREEN = 'FULLSCREEN',
  FLOATING = 'FLOATING',
  SET_LOCATION = 'SET_LOCATION',
  STUDIO_SELECT = 'STUDIO_SELECT',
  GAME_SELECT = 'GAME_SELECT',
  SET_VISIBLE = 'SET_VISIBLE',
  SHOW_ERROR_MODAL = 'SHOW_ERROR_MODAL',
  HIDE_ERROR_MODAL = 'HIDE_ERROR_MODAL'
}

export enum APP_LOCATION {
  DASHBOARD = '/',
  COMPOSER = '/editor'
}

type AppActionType =
  | { type: APP_ACTION_TYPE.PLATFORM; platform: PLATFORM_TYPE }
  | { type: APP_ACTION_TYPE.FULLSCREEN }
  | { type: APP_ACTION_TYPE.FLOATING }
  | { type: APP_ACTION_TYPE.SET_LOCATION; location: APP_LOCATION }
  | { type: APP_ACTION_TYPE.STUDIO_SELECT; selectedStudioId?: StudioId }
  | { type: APP_ACTION_TYPE.GAME_SELECT; selectedGameId?: WorldId }
  | { type: APP_ACTION_TYPE.SET_VISIBLE; visible: boolean }
  | {
      type: APP_ACTION_TYPE.SHOW_ERROR_MODAL
      details: { message: string; code: string }
    }
  | { type: APP_ACTION_TYPE.HIDE_ERROR_MODAL }

const appReducer = (state: AppState, action: AppActionType): AppState => {
  switch (action.type) {
    case APP_ACTION_TYPE.PLATFORM:
      return {
        ...state,
        platform: action.platform
      }
    case APP_ACTION_TYPE.FULLSCREEN:
      return { ...state, fullscreen: true }
    case APP_ACTION_TYPE.FLOATING:
      return { ...state, fullscreen: false }
    case APP_ACTION_TYPE.SET_LOCATION:
      return { ...state, location: action.location }
    case APP_ACTION_TYPE.STUDIO_SELECT:
      return { ...state, selectedStudioId: action.selectedStudioId }
    case APP_ACTION_TYPE.GAME_SELECT:
      return { ...state, selectedWorldId: action.selectedGameId }
    case APP_ACTION_TYPE.SET_VISIBLE:
      return { ...state, visible: action.visible }
    case APP_ACTION_TYPE.SHOW_ERROR_MODAL:
      return {
        ...state,
        errorModal: {
          visible: true,
          message: action.details.message,
          code: action.details.code
        }
      }
    case APP_ACTION_TYPE.HIDE_ERROR_MODAL: {
      return {
        ...state,
        errorModal: { visible: false, message: null, code: null }
      }
    }
    default:
      return state
  }
}

interface AppContextType {
  app: AppState
  appDispatch: React.Dispatch<AppActionType>
}

const defaultAppState: AppState = {
  version: '0.7.1',
  build: '--',
  platform: undefined,
  fullscreen: false,
  location: APP_LOCATION.DASHBOARD,
  selectedStudioId: undefined,
  selectedWorldId: undefined,
  visible: false,
  errorModal: {
    visible: false,
    message: null,
    code: null
  }
}

export const AppContext = createContext<AppContextType>({
  app: defaultAppState,
  appDispatch: () => {}
})

const AppProvider: React.FC = ({ children }) => {
  const [app, appDispatch] = useReducer(appReducer, defaultAppState)

  return (
    <AppContext.Provider
      value={useMemo(() => ({ app, appDispatch }), [app, appDispatch])}
    >
      {children}
    </AppContext.Provider>
  )
}

export default AppProvider
