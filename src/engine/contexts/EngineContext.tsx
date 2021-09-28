import { cloneDeep } from 'lodash'

import React, { createContext, useMemo, useReducer } from 'react'

import { ComponentId, EngineEventData, GameId, StudioId } from '../types/0.5.0'

interface EngineState {
  currentEvent: ComponentId | undefined
  eventsInStream: EngineEventData[]
  installed: boolean
  isEditor: boolean
  gameInfo?: {
    designer: string
    id: GameId
    studioId: StudioId
    studioTitle: string
    title: string
    updated: number
    version: string
  }
  playing: boolean
}

export enum ENGINE_ACTION_TYPE {
  SET_INSTALLED = 'SET_INSTALLED',
  SET_IS_EDITOR = 'SET_EDITOR',
  SET_CURRENT_EVENT = 'SET_CURRENT_EVENT',
  CLEAR_EVENT_STREAM = 'CLEAR_EVENT_STREAM',
  APPEND_EVENTS_TO_STREAM = 'APPEND_EVENTS_TO_STREAM',
  UPDATE_EVENT_IN_STREAM = 'UPDATE_EVENT_IN_STREAM',
  SET_GAME_INFO = 'SET_GAME_INFO',
  PLAY = 'PLAY',
  STOP = 'STOP'
}

type EngineActionType =
  | { type: ENGINE_ACTION_TYPE.SET_INSTALLED; installed: boolean }
  | { type: ENGINE_ACTION_TYPE.SET_IS_EDITOR }
  | {
      type: ENGINE_ACTION_TYPE.SET_CURRENT_EVENT
      id: ComponentId
    }
  | { type: ENGINE_ACTION_TYPE.CLEAR_EVENT_STREAM }
  | {
      type: ENGINE_ACTION_TYPE.APPEND_EVENTS_TO_STREAM
      events: EngineEventData[]
      reset?: boolean
    }
  | {
      type: ENGINE_ACTION_TYPE.UPDATE_EVENT_IN_STREAM
      event: EngineEventData
    }
  | {
      type: ENGINE_ACTION_TYPE.SET_GAME_INFO
      gameInfo?: {
        designer: string
        id: GameId
        studioId: StudioId
        studioTitle: string
        title: string
        updated: number
        version: string
      }
    }
  | { type: ENGINE_ACTION_TYPE.PLAY; fromEvent: ComponentId | undefined }
  | { type: ENGINE_ACTION_TYPE.STOP }

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
    case ENGINE_ACTION_TYPE.SET_IS_EDITOR:
      return {
        ...state,
        isEditor: true
      }
    case ENGINE_ACTION_TYPE.SET_CURRENT_EVENT:
      return {
        ...state,
        currentEvent: action.id
      }
    case ENGINE_ACTION_TYPE.CLEAR_EVENT_STREAM:
      return {
        ...state,
        eventsInStream: []
      }
    case ENGINE_ACTION_TYPE.APPEND_EVENTS_TO_STREAM:
      if (!action.reset) {
        return {
          ...state,
          eventsInStream: [...action.events, ...state.eventsInStream]
        }
      } else {
        return {
          ...state,
          eventsInStream: action.events
        }
      }
    case ENGINE_ACTION_TYPE.UPDATE_EVENT_IN_STREAM:
      const foundEventIndex = state.eventsInStream.findIndex(
        (event) => event.id === action.event.id
      )

      if (foundEventIndex !== -1) {
        const clonedEvents = cloneDeep(state.eventsInStream)

        clonedEvents[foundEventIndex] = action.event

        return { ...state, eventsInStream: clonedEvents }
      } else {
        return state
      }
    case ENGINE_ACTION_TYPE.SET_GAME_INFO:
      return {
        ...state,
        gameInfo: action.gameInfo
      }
    case ENGINE_ACTION_TYPE.PLAY:
      return {
        ...state,
        currentEvent: action.fromEvent,
        playing: true
      }
    case ENGINE_ACTION_TYPE.STOP:
      return {
        ...state,
        eventsInStream: [],
        playing: false
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
  currentEvent: undefined,
  eventsInStream: [],
  isEditor: false,
  installed: false,
  gameInfo: undefined,
  playing: false
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
      value={useMemo(
        () => ({ engine, engineDispatch }),
        [engine, engineDispatch]
      )}
    >
      {children}
    </EngineContext.Provider>
  )
}

EngineProvider.displayName = 'EngineProvider'

export default EngineProvider