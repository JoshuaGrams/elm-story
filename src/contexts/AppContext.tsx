import React, { useMemo, createContext, useReducer } from 'react'

type AppState = {
  header: string
  fullscreen: boolean
  menuOpen: boolean
  modalOpen: boolean
}

export enum APP_ACTION_TYPE {
  HEADER = 'HEADER',
  FULLSCREEN = 'FULLSCREEN',
  FLOATING = 'FLOATING',
  MENU_OPEN = 'MENU_OPEN',
  MENU_CLOSE = 'MENU_CLOSE',
  MODAL_OPEN = 'MODAL_OPEN',
  MODAL_CLOSE = 'MODAL_CLOSE'
}

type AppAction =
  | { type: APP_ACTION_TYPE.HEADER; header: string }
  | { type: APP_ACTION_TYPE.FULLSCREEN }
  | { type: APP_ACTION_TYPE.FLOATING }
  | { type: APP_ACTION_TYPE.MENU_OPEN }
  | { type: APP_ACTION_TYPE.MENU_CLOSE }
  | { type: APP_ACTION_TYPE.MODAL_OPEN }
  | { type: APP_ACTION_TYPE.MODAL_CLOSE }

type AppContextType = {
  app: AppState
  appDispatch: React.Dispatch<AppAction>
}

const defaultAppState: AppState = {
  header: 'Elm Story',
  fullscreen: false,
  menuOpen: false,
  modalOpen: false
}

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case APP_ACTION_TYPE.HEADER:
      return { ...state, header: action.header }
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
    default:
      return state
  }
}

export const AppContext = createContext<AppContextType>({
  app: defaultAppState,
  appDispatch: () => {}
})

export const AppProvider: React.FC<React.ReactNode> = ({ children }) => {
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
