import React, { useMemo, createContext, useReducer } from 'react'
import { DocumentId } from '../data/types'

type AppState = {
  header: string
  fullscreen: boolean
  menuOpen: boolean
  modalOpen: boolean
  selectedStudioId?: DocumentId
  selectedGameId?: DocumentId
}

export enum APP_ACTION_TYPE {
  HEADER = 'HEADER',
  FULLSCREEN = 'FULLSCREEN',
  FLOATING = 'FLOATING',
  MENU_OPEN = 'MENU_OPEN',
  MENU_CLOSE = 'MENU_CLOSE',
  MODAL_OPEN = 'MODAL_OPEN',
  MODAL_CLOSE = 'MODAL_CLOSE',
  STUDIO_SELECT = 'STUDIO_SELECT',
  GAME_SELECT = 'GAME_SELECT'
}

type AppActionType =
  | { type: APP_ACTION_TYPE.HEADER; header: string }
  | { type: APP_ACTION_TYPE.FULLSCREEN }
  | { type: APP_ACTION_TYPE.FLOATING }
  | { type: APP_ACTION_TYPE.MENU_OPEN }
  | { type: APP_ACTION_TYPE.MENU_CLOSE }
  | { type: APP_ACTION_TYPE.MODAL_OPEN }
  | { type: APP_ACTION_TYPE.MODAL_CLOSE }
  | { type: APP_ACTION_TYPE.STUDIO_SELECT; selectedStudioId?: DocumentId }
  | { type: APP_ACTION_TYPE.GAME_SELECT; selectedGameId?: DocumentId }

const appReducer = (state: AppState, action: AppActionType): AppState => {
  switch (action.type) {
    case APP_ACTION_TYPE.HEADER:
      return {
        ...state,
        header: `${defaultAppState.header} : ${action.header}`
      }
    case APP_ACTION_TYPE.FULLSCREEN:
      return { ...state, fullscreen: true }
    case APP_ACTION_TYPE.FLOATING:
      return { ...state, fullscreen: false }
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
      return { ...state, selectedGameId: action.selectedGameId }
    default:
      return state
  }
}

type AppContextType = {
  app: AppState
  appDispatch: React.Dispatch<AppActionType>
}

const defaultAppState: AppState = {
  header: 'Elm Story',
  fullscreen: false,
  menuOpen: false,
  modalOpen: false,
  selectedStudioId: undefined,
  selectedGameId: undefined
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
