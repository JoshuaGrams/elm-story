import React, { useMemo, createContext, useReducer } from 'react'
import { StudioId, WorldId, PLATFORM_TYPE } from '../data/types'

interface AppState {
  version: string
  build: string
  platform?: PLATFORM_TYPE
  fullscreen: boolean
  location: APP_LOCATION
  menuOpen: boolean
  modalOpen: boolean
  selectedStudioId?: StudioId
  selectedWorldId?: WorldId
}

export enum APP_ACTION_TYPE {
  PLATFORM = 'PLATFORM',
  FULLSCREEN = 'FULLSCREEN',
  FLOATING = 'FLOATING',
  SET_LOCATION = 'SET_LOCATION',
  MENU_OPEN = 'MENU_OPEN',
  MENU_CLOSE = 'MENU_CLOSE',
  MODAL_OPEN = 'MODAL_OPEN',
  MODAL_CLOSE = 'MODAL_CLOSE',
  STUDIO_SELECT = 'STUDIO_SELECT',
  GAME_SELECT = 'GAME_SELECT'
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
  | { type: APP_ACTION_TYPE.MENU_OPEN }
  | { type: APP_ACTION_TYPE.MENU_CLOSE }
  | { type: APP_ACTION_TYPE.MODAL_OPEN }
  | { type: APP_ACTION_TYPE.MODAL_CLOSE }
  | { type: APP_ACTION_TYPE.STUDIO_SELECT; selectedStudioId?: StudioId }
  | { type: APP_ACTION_TYPE.GAME_SELECT; selectedGameId?: WorldId }

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
    case APP_ACTION_TYPE.MENU_OPEN:
      return { ...state, menuOpen: true }
    case APP_ACTION_TYPE.MENU_CLOSE:
      return { ...state, menuOpen: false }
    case APP_ACTION_TYPE.MODAL_OPEN:
      return { ...state, modalOpen: true }
    case APP_ACTION_TYPE.MODAL_CLOSE:
      return { ...state, modalOpen: false }
    case APP_ACTION_TYPE.STUDIO_SELECT:
      return { ...state, selectedStudioId: action.selectedStudioId }
    case APP_ACTION_TYPE.GAME_SELECT:
      return { ...state, selectedWorldId: action.selectedGameId }
    default:
      return state
  }
}

interface AppContextType {
  app: AppState
  appDispatch: React.Dispatch<AppActionType>
}

const defaultAppState: AppState = {
  version: '0.6.0',
  build: 'b7316553',
  platform: undefined,
  fullscreen: false,
  location: APP_LOCATION.DASHBOARD,
  menuOpen: false,
  modalOpen: false,
  selectedStudioId: undefined,
  selectedWorldId: undefined
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
