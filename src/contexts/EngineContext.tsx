import React, { useMemo, createContext, useReducer } from 'react'
import { start } from 'repl'
import { ComponentId } from '../data/types'

interface EngineState {
  startingChapter: ComponentId | null
  currentChapter: ComponentId | null
  startingScene: ComponentId | null
  currentScene: ComponentId | null
  startingPassage: ComponentId | null
  currentPassage: ComponentId | null
}

export enum ENGINE_ACTION_TYPE {
  GAME_RESTART = 'GAME_RESTART',
  CHAPTER_START = 'CHAPTER_START',
  CHAPTER_CURRENT = 'CHAPTER_CURRENT',
  SCENE_START = 'SCENE_START',
  SCENE_CURRENT = 'SCENE_CURRENT',
  PASSAGE_START = 'PASSAGE_START',
  PASSAGE_CURRENT = 'PASSAGE_CURRENT'
}

type EngineActionType =
  | { type: ENGINE_ACTION_TYPE.GAME_RESTART }
  | {
      type: ENGINE_ACTION_TYPE.CHAPTER_START
      startingChapter: ComponentId | null
    }
  | {
      type: ENGINE_ACTION_TYPE.CHAPTER_CURRENT
      currentChapter: ComponentId | null
    }
  | {
      type: ENGINE_ACTION_TYPE.SCENE_START
      startingScene: ComponentId | null
    }
  | {
      type: ENGINE_ACTION_TYPE.SCENE_CURRENT
      currentScene: ComponentId | null
    }
  | {
      type: ENGINE_ACTION_TYPE.PASSAGE_START
      startingPassage: ComponentId | null
    }
  | {
      type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT
      currentPassage: ComponentId | null
    }

const engineReducer = (
  state: EngineState,
  action: EngineActionType
): EngineState => {
  switch (action.type) {
    case ENGINE_ACTION_TYPE.GAME_RESTART:
      return {
        ...state,
        currentChapter: null,
        currentScene: null,
        currentPassage: null
      }
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
    case ENGINE_ACTION_TYPE.SCENE_START:
      return {
        ...state,
        startingScene: action.startingScene
      }
    case ENGINE_ACTION_TYPE.SCENE_CURRENT:
      return {
        ...state,
        currentScene: action.currentScene
      }
    case ENGINE_ACTION_TYPE.PASSAGE_START:
      return {
        ...state,
        startingPassage: action.startingPassage
      }
    case ENGINE_ACTION_TYPE.PASSAGE_CURRENT:
      return {
        ...state,
        currentPassage: action.currentPassage
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
  currentChapter: null,
  startingScene: null,
  currentScene: null,
  startingPassage: null,
  currentPassage: null
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
