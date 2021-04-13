import React, { useMemo, createContext, useReducer } from 'react'
import { ComponentId } from '../data/types'

interface EngineState {
  startingChapter: ComponentId | null
  currentChapter: ComponentId | null
}

export enum ENGINE_ACTION_TYPE {
  CHAPTER_START = 'CHAPTER_START',
  CHAPTER_CURRENT = 'CHAPTER_CURRENT'
}

type EngineActionType =
  | {
      type: ENGINE_ACTION_TYPE.CHAPTER_START
      startingChapter: ComponentId | null
    }
  | {
      type: ENGINE_ACTION_TYPE.CHAPTER_CURRENT
      currentChapter: ComponentId | null
    }

const engineReducer = (
  state: EngineState,
  action: EngineActionType
): EngineState => {
  switch (action.type) {
    case ENGINE_ACTION_TYPE.CHAPTER_START:
      return {
        ...state,
        startingChapter: action.startingChapter
      }
    case ENGINE_ACTION_TYPE.CHAPTER_CURRENT:
      return {
        ...state,
        currentChapter: action.currentChapter
      }
    default:
      return state
  }
}

interface EngineContextType {
  engine: EngineState
  engineDispatch: React.Dispatch<EngineActionType>
}

const defaultEngineState: EngineState = {
  startingChapter: null,
  currentChapter: null
}

export const EngineContext = createContext<EngineContextType>({
  engine: defaultEngineState,
  engineDispatch: () => {}
})

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

export default EngineProvider
