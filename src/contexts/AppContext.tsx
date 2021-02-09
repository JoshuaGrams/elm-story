import React, { useMemo, createContext, useReducer } from 'react'

type AppState = {
  header: string
  fullscreen: boolean
}

export enum APP_ACTION_TYPE {
  HEADER = 'HEADER',
  FULLSCREEN = 'FULLSCREEN',
  FLOATING = 'FLOATING'
}

type AppAction =
  | { type: APP_ACTION_TYPE.HEADER; header: string }
  | { type: APP_ACTION_TYPE.FULLSCREEN }
  | { type: APP_ACTION_TYPE.FLOATING }

type AppContextType = {
  app: AppState
  appDispatch: React.Dispatch<AppAction>
}

const defaultAppState: AppState = {
  header: 'Elm Story Games',
  fullscreen: false
}

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case APP_ACTION_TYPE.HEADER:
      return { ...state, header: action.header }
    case APP_ACTION_TYPE.FULLSCREEN:
      return { ...state, fullscreen: true }
    case APP_ACTION_TYPE.FLOATING:
      return { ...state, fullscreen: false }
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
