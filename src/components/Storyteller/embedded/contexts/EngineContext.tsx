import { cloneDeep } from 'lodash'

import React, { createContext, useMemo, useReducer } from 'react'

import { ElementId, EngineLiveEventData, WorldId, StudioId } from '../types'

interface EngineState {
  currentLiveEvent: ElementId | undefined
  devTools: {
    highlightExpressions: boolean
    blockedChoicesVisible: boolean
    xrayVisible: boolean
  }
  liveEventsInStream: EngineLiveEventData[]
  installed: boolean
  installId: string | undefined
  isComposer: boolean
  worldInfo?: {
    copyright?: string
    description?: string
    designer: string
    id: WorldId
    studioId: StudioId
    studioTitle: string
    title: string
    updated: number
    version: string
    website?: string
  }
  playing: boolean
  resetNotification: {
    message: string | undefined
    showing: boolean
  }
  updating: boolean
}

export enum ENGINE_ACTION_TYPE {
  APPEND_LIVE_EVENTS_TO_STREAM = 'APPEND_EVENTS_TO_STREAM',
  CLEAR_EVENT_STREAM = 'CLEAR_EVENT_STREAM',
  SET_GAME_INFO = 'SET_GAME_INFO',
  HIDE_RESET_NOTIFICATION = 'HIDE_RESET_NOTIFICATION',
  PLAY = 'PLAY', // sets currentEvent
  SET_INSTALLED = 'SET_INSTALLED',
  SET_INSTALL_ID = 'SET_INSTALL_ID',
  SET_IS_EDITOR = 'SET_EDITOR',
  SET_CURRENT_LIVE_EVENT = 'SET_CURRENT_EVENT',
  SET_UPDATE_GAME = 'UPDATE_GAME',
  STOP = 'STOP',
  SHOW_RESET_NOTIFICATION = 'SHOW_RESET_NOTIFICATION',
  TOGGLE_DEVTOOLS_BLOCKED_CHOICES = 'TOGGLE_DEVTOOLS_BLOCKED_CHOICES',
  TOGGLE_DEVTOOLS_EXPRESSIONS = 'TOGGLE_DEVTOOLS_EXPRESSIONS',
  TOGGLE_DEVTOOLS_XRAY = 'TOGGLE_DEVTOOLS_XRAY',
  UPDATE_LIVE_EVENT_IN_STREAM = 'UPDATE_EVENT_IN_STREAM'
}

type EngineActionType =
  | { type: ENGINE_ACTION_TYPE.SET_INSTALLED; installed: boolean }
  | { type: ENGINE_ACTION_TYPE.SET_INSTALL_ID; id?: string }
  | { type: ENGINE_ACTION_TYPE.SET_IS_EDITOR }
  | {
      type: ENGINE_ACTION_TYPE.SET_CURRENT_LIVE_EVENT
      id?: ElementId
    }
  | { type: ENGINE_ACTION_TYPE.CLEAR_EVENT_STREAM }
  | {
      type: ENGINE_ACTION_TYPE.APPEND_LIVE_EVENTS_TO_STREAM
      liveEvents: EngineLiveEventData[]
      reset?: boolean
    }
  | {
      type: ENGINE_ACTION_TYPE.UPDATE_LIVE_EVENT_IN_STREAM
      liveEvent: EngineLiveEventData
    }
  | {
      type: ENGINE_ACTION_TYPE.SET_GAME_INFO
      gameInfo?: {
        copyright?: string
        description?: string
        designer: string
        id: WorldId
        studioId: StudioId
        studioTitle: string
        title: string
        updated: number
        version: string
        website?: string
      }
    }
  | { type: ENGINE_ACTION_TYPE.SET_UPDATE_GAME; updating: boolean }
  | { type: ENGINE_ACTION_TYPE.PLAY; fromEvent: ElementId | undefined }
  | { type: ENGINE_ACTION_TYPE.STOP }
  | { type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION }
  | { type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION; message: string }
  | { type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_BLOCKED_CHOICES }
  | { type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_EXPRESSIONS }
  | { type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_XRAY }

const engineReducer = (
  state: EngineState,
  action: EngineActionType
): EngineState => {
  switch (action.type) {
    case ENGINE_ACTION_TYPE.SET_INSTALLED:
      return {
        ...state,
        installed: action.installed
      }
    case ENGINE_ACTION_TYPE.SET_INSTALL_ID:
      return {
        ...state,
        installId: action.id
      }
    case ENGINE_ACTION_TYPE.SET_IS_EDITOR:
      return {
        ...state,
        isComposer: true
      }
    case ENGINE_ACTION_TYPE.SET_CURRENT_LIVE_EVENT:
      return {
        ...state,
        currentLiveEvent: action.id
      }
    case ENGINE_ACTION_TYPE.CLEAR_EVENT_STREAM:
      return {
        ...state,
        liveEventsInStream: []
      }
    case ENGINE_ACTION_TYPE.APPEND_LIVE_EVENTS_TO_STREAM:
      if (!action.reset) {
        return {
          ...state,
          liveEventsInStream: [
            ...action.liveEvents,
            ...state.liveEventsInStream
          ]
        }
      } else {
        return {
          ...state,
          liveEventsInStream: action.liveEvents
        }
      }
    case ENGINE_ACTION_TYPE.UPDATE_LIVE_EVENT_IN_STREAM:
      const foundEventIndex = state.liveEventsInStream.findIndex(
        (event) => event.id === action.liveEvent.id
      )

      if (foundEventIndex !== -1) {
        const clonedEvents = cloneDeep(state.liveEventsInStream)

        clonedEvents[foundEventIndex] = action.liveEvent

        return { ...state, liveEventsInStream: clonedEvents }
      } else {
        return state
      }
    case ENGINE_ACTION_TYPE.SET_GAME_INFO:
      return {
        ...state,
        worldInfo: action.gameInfo
      }
    case ENGINE_ACTION_TYPE.PLAY:
      return {
        ...state,
        currentLiveEvent: action.fromEvent,
        playing: true
      }
    case ENGINE_ACTION_TYPE.STOP:
      return {
        ...state,
        liveEventsInStream: [],
        playing: false
      }
    case ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION:
      return {
        ...state,
        resetNotification: { message: undefined, showing: false }
      }
    case ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION:
      return {
        ...state,
        resetNotification: { message: action.message, showing: true }
      }
    case ENGINE_ACTION_TYPE.SET_UPDATE_GAME:
      return {
        ...state,
        updating: action.updating
      }
    case ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_BLOCKED_CHOICES:
      return {
        ...state,
        devTools: {
          ...state.devTools,
          blockedChoicesVisible: !state.devTools.blockedChoicesVisible
        }
      }
    case ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_EXPRESSIONS:
      return {
        ...state,
        devTools: {
          ...state.devTools,
          highlightExpressions: !state.devTools.highlightExpressions
        }
      }
    case ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_XRAY:
      return {
        ...state,
        devTools: {
          ...state.devTools,
          xrayVisible: !state.devTools.xrayVisible
        }
      }
    default:
      return state
  }
}

interface EngineContextType {
  engine: EngineState
  engineDispatch: (action: EngineActionType) => void
}

const defaultEngineState: EngineState = {
  currentLiveEvent: undefined,
  devTools: {
    blockedChoicesVisible: false,
    highlightExpressions: false,
    xrayVisible: false
  },
  liveEventsInStream: [],
  installed: false,
  installId: undefined,
  isComposer: false,
  worldInfo: undefined,
  playing: false,
  resetNotification: {
    message: undefined,
    showing: false
  },
  updating: false
}

export const EngineContext = createContext<EngineContextType>({
  engine: defaultEngineState,
  engineDispatch: () => null
})

EngineContext.displayName = 'Context'

const EngineProvider: React.FC = ({ children }) => {
  const [engine, engineDispatch] = useReducer(engineReducer, defaultEngineState)

  return (
    <EngineContext.Provider
      value={useMemo(() => ({ engine, engineDispatch }), [
        engine,
        engineDispatch
      ])}
    >
      {children}
    </EngineContext.Provider>
  )
}

EngineProvider.displayName = 'EngineProvider'

export default EngineProvider
