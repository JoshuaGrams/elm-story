import React, { useMemo, createContext, useReducer } from 'react'

import { ComponentId, GameState } from '../data/types'

interface EngineState {
  devToolsEnabled: boolean
  highlightExpressions: boolean
  showBlockedChoices: boolean
  gameState: GameState
  startingScene: ComponentId | null
  currentScene: ComponentId | null
  startingPassage: ComponentId | null
  currentPassage: ComponentId | null
  scrollTo: { top: number; left: number }
}

export enum ENGINE_ACTION_TYPE {
  TOGGLE_DEV_TOOLS = 'TOGGLE_DEV_TOOLS',
  DISABLE_DEV_TOOLS = 'DISABLE_DEV_TOOLS',
  TOGGLE_EXPRESSIONS = 'TOGGLE_HIGHLIGHT_EXPRESSIONS',
  TOGGLE_BLOCKED_CHOICES = 'TOGGLE_BLOCKED_CHOICES',
  GAME_STATE = 'GAME_STATE',
  GAME_RESTART = 'GAME_RESTART',
  SCENE_START = 'SCENE_START',
  SCENE_CURRENT = 'SCENE_CURRENT',
  PASSAGE_START = 'PASSAGE_START',
  PASSAGE_CURRENT = 'PASSAGE_CURRENT',
  SCROLL_TO = 'SCROLL_TO'
}

type EngineActionType =
  | { type: ENGINE_ACTION_TYPE.TOGGLE_DEV_TOOLS }
  | { type: ENGINE_ACTION_TYPE.TOGGLE_EXPRESSIONS }
  | { type: ENGINE_ACTION_TYPE.TOGGLE_BLOCKED_CHOICES }
  | { type: ENGINE_ACTION_TYPE.GAME_STATE; gameState: GameState }
  | { type: ENGINE_ACTION_TYPE.GAME_RESTART }
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
  | {
      type: ENGINE_ACTION_TYPE.SCROLL_TO
      scrollTo: { top: number; left: number }
    }

const engineReducer = (
  state: EngineState,
  action: EngineActionType
): EngineState => {
  switch (action.type) {
    case ENGINE_ACTION_TYPE.TOGGLE_DEV_TOOLS:
      return {
        ...state,
        devToolsEnabled: !state.devToolsEnabled
      }
    case ENGINE_ACTION_TYPE.TOGGLE_EXPRESSIONS:
      return {
        ...state,
        highlightExpressions: !state.highlightExpressions
      }
    case ENGINE_ACTION_TYPE.TOGGLE_BLOCKED_CHOICES:
      return {
        ...state,
        showBlockedChoices: !state.showBlockedChoices
      }
    case ENGINE_ACTION_TYPE.GAME_STATE:
      return {
        ...state,
        gameState: action.gameState
      }
    case ENGINE_ACTION_TYPE.GAME_RESTART:
      const resetGameState: GameState = {}

      Object.keys(state.gameState).map((key) => {
        resetGameState[key] = {
          ...state.gameState[key],
          currentValue: `${state.gameState[key].initialValue}`
        }
      })

      return {
        ...state,
        gameState: resetGameState,
        currentScene: state.startingScene,
        currentPassage: state.startingPassage
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
    case ENGINE_ACTION_TYPE.SCROLL_TO:
      return {
        ...state,
        scrollTo: action.scrollTo
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
  devToolsEnabled: false,
  highlightExpressions: true,
  showBlockedChoices: true,
  gameState: {},
  startingScene: null,
  currentScene: null,
  startingPassage: null,
  currentPassage: null,
  scrollTo: { top: 0, left: 0 }
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
