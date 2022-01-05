import React, { createContext, useMemo, useReducer } from 'react'

import { ElementId, ELEMENT_TYPE } from '../data/types'

interface ComposerState {
  savedElement: {
    id?: ElementId
    type?: ELEMENT_TYPE
  }
  renamedElement: {
    id?: ElementId
    type?: ELEMENT_TYPE
    newTitle?: string
  }
  removedElement: {
    id?: ElementId
    type?: ELEMENT_TYPE
  }
  selectedWorldOutlineElement: {
    id?: ElementId
    expanded?: boolean
    type?: ELEMENT_TYPE
    title?: string
  }
  renamingWorldOutlineElement: {
    id?: ElementId
    renaming: boolean
  }
  expandedWorldOutlineElements: ElementId[]
  totalSceneMapSelectedJumps: number
  totalSceneMapSelectedEvents: number
  totalSceneMapSelectedPaths: number
  selectedSceneMapCenter: { x: number; y: number; zoom: number }
  selectedSceneMapJump: ElementId | null
  selectedSceneMapEvent: ElementId | null
  selectedSceneMapPath: ElementId | null
  selectedSceneMapChoice: ElementId | null
  centeredSceneMapSelection: boolean
  selectedElements: {
    id?: ElementId
    type?: ELEMENT_TYPE
  }[]
  closedEditorTab: {
    id?: ElementId
    type?: ELEMENT_TYPE
  }
  characterModal: {
    visible: boolean
    id: ElementId | undefined
  }
  draggableEventContentElement: string | null
}

export enum COMPOSER_ACTION_TYPE {
  ELEMENT_SAVE = 'ELEMENT_SAVE',
  ELEMENT_RENAME = 'ELEMENT_RENAME',
  ELEMENT_REMOVE = 'ELEMENT_REMOVE',
  WORLD_OUTLINE_SELECT = 'WORLD_OUTLINE_SELECT',
  WORLD_OUTLINE_RENAME = 'WORLD_OUTLINE_RENAME',
  WORLD_OUTLINE_EXPAND = 'WORLD_OUTLINE_EXPAND',
  SCENE_MAP_TOTAL_SELECTED_JUMPS = 'SCENE_MAP_TOTAL_SELECTED_JUMPS',
  SCENE_MAP_TOTAL_SELECTED_EVENTS = 'SCENE_MAP_TOTAL_SELECTED_EVENTS',
  SCENE_MAP_TOTAL_SELECTED_PATHS = 'SCENE_MAP_TOTAL_SELECTED_PATHS',
  SCENE_MAP_SELECT_CENTER = 'SCENE_MAP_SELECT_CENTER',
  SCENE_MAP_SELECT_JUMP = 'SCENE_MAP_SELECT_JUMP',
  SCENE_MAP_SELECT_EVENT = 'SCENE_MAP_SELECT_EVENT',
  SCENE_MAP_SELECT_PATH = 'SCENE_MAP_SELECT_PATH',
  SCENE_MAP_SELECT_CHOICE = 'SCENE_MAP_SELECT_CHOICE',
  SCENE_MAP_CENTERED_SELECTION = 'SCENE_MAP_CENTERED_SELECTION',
  SELECT = 'SELECT',
  ELEMENT_EDITOR_CLOSE_TAB = 'ELEMENT_EDITOR_CLOSE_TAB',
  OPEN_CHARACTER_MODAL = 'OPEN_CHARACTER_MODAL',
  CLOSE_CHARACTER_MODAL = 'CLOSE_CHARACTER_MODAL',
  SET_DRAGGABLE_EVENT_CONTENT_ELEMENT = 'SET_DRAGGABLE_EVENT_CONTENT_ELEMENT'
}

type ComposerActionType =
  | {
      type: COMPOSER_ACTION_TYPE.ELEMENT_SAVE
      savedElement: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }
    }
  | {
      type: COMPOSER_ACTION_TYPE.ELEMENT_RENAME
      renamedElement: {
        id?: ElementId
        type?: ELEMENT_TYPE
        newTitle?: string
      }
    }
  | {
      type: COMPOSER_ACTION_TYPE.ELEMENT_REMOVE
      removedElement: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }
    }
  | {
      type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT
      selectedWorldOutlineElement: {
        id?: ElementId
        expanded?: boolean
        type?: ELEMENT_TYPE
        title?: string
      }
    }
  | {
      type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_RENAME
      renamingWorldOutlineElement: {
        id?: ElementId
        renaming: boolean
      }
    }
  | {
      type: COMPOSER_ACTION_TYPE.WORLD_OUTLINE_EXPAND
      expandedWorldOutlineElements: ElementId[]
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_JUMPS
      totalSceneMapSelectedJumps: number
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_EVENTS
      totalSceneMapSelectedEvents: number
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_PATHS
      totalSceneMapSelectedPaths: number
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CENTER
      selectedSceneMapCenter: {
        x: number
        y: number
        zoom: number
      }
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP
      selectedSceneMapJump: ElementId | null
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT
      selectedSceneMapEvent: ElementId | null
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_PATH
      selectedSceneMapPath: ElementId | null
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE
      selectedSceneMapChoice: ElementId | null
    }
  | {
      type: COMPOSER_ACTION_TYPE.SCENE_MAP_CENTERED_SELECTION
      centeredSceneMapSelection: boolean
    }
  | {
      type: COMPOSER_ACTION_TYPE.SELECT
      selectedElements: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }[]
    }
  | {
      type: COMPOSER_ACTION_TYPE.ELEMENT_EDITOR_CLOSE_TAB
      closedEditorTab: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }
    }
  | {
      type: COMPOSER_ACTION_TYPE.OPEN_CHARACTER_MODAL
      characterId: ElementId
    }
  | {
      type: COMPOSER_ACTION_TYPE.CLOSE_CHARACTER_MODAL
    }
  | {
      type: COMPOSER_ACTION_TYPE.SET_DRAGGABLE_EVENT_CONTENT_ELEMENT
      id: string | null
    }

const composerReducer = (
  state: ComposerState,
  action: ComposerActionType
): ComposerState => {
  switch (action.type) {
    case COMPOSER_ACTION_TYPE.ELEMENT_SAVE:
      return {
        ...state,
        savedElement: action.savedElement || {}
      }
    case COMPOSER_ACTION_TYPE.ELEMENT_RENAME:
      return {
        ...state,
        renamedElement: action.renamedElement
      }
    case COMPOSER_ACTION_TYPE.ELEMENT_REMOVE:
      return {
        ...state,
        removedElement: action.removedElement
      }
    case COMPOSER_ACTION_TYPE.WORLD_OUTLINE_SELECT:
      return {
        ...state,
        selectedWorldOutlineElement: action.selectedWorldOutlineElement || {}
      }
    case COMPOSER_ACTION_TYPE.WORLD_OUTLINE_RENAME:
      return {
        ...state,
        renamingWorldOutlineElement: action.renamingWorldOutlineElement
      }
    case COMPOSER_ACTION_TYPE.WORLD_OUTLINE_EXPAND:
      return {
        ...state,
        expandedWorldOutlineElements: action.expandedWorldOutlineElements
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_JUMPS:
      return {
        ...state,
        totalSceneMapSelectedJumps: action.totalSceneMapSelectedJumps
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_EVENTS:
      return {
        ...state,
        totalSceneMapSelectedEvents: action.totalSceneMapSelectedEvents
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_TOTAL_SELECTED_PATHS:
      return {
        ...state,
        totalSceneMapSelectedPaths: action.totalSceneMapSelectedPaths
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CENTER:
      return {
        ...state,
        selectedSceneMapCenter: action.selectedSceneMapCenter
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_JUMP:
      return {
        ...state,
        selectedSceneMapJump: action.selectedSceneMapJump
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_EVENT:
      return {
        ...state,
        selectedSceneMapEvent: action.selectedSceneMapEvent
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_PATH:
      return {
        ...state,
        selectedSceneMapPath: action.selectedSceneMapPath
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_SELECT_CHOICE:
      return {
        ...state,
        selectedSceneMapChoice: action.selectedSceneMapChoice
      }
    case COMPOSER_ACTION_TYPE.SCENE_MAP_CENTERED_SELECTION:
      return {
        ...state,
        centeredSceneMapSelection: action.centeredSceneMapSelection
      }
    case COMPOSER_ACTION_TYPE.SELECT:
      return {
        ...state,
        selectedElements: action.selectedElements || []
      }
    case COMPOSER_ACTION_TYPE.ELEMENT_EDITOR_CLOSE_TAB:
      return {
        ...state,
        closedEditorTab: action.closedEditorTab
      }
    case COMPOSER_ACTION_TYPE.OPEN_CHARACTER_MODAL:
      return {
        ...state,
        characterModal: {
          visible: true,
          id: action.characterId
        }
      }
    case COMPOSER_ACTION_TYPE.CLOSE_CHARACTER_MODAL:
      return {
        ...state,
        characterModal: {
          visible: false,
          id: undefined
        }
      }
    case COMPOSER_ACTION_TYPE.SET_DRAGGABLE_EVENT_CONTENT_ELEMENT:
      return {
        ...state,
        draggableEventContentElement: action.id
      }
    default:
      return state
  }
}

interface ComposerContextType {
  composer: ComposerState
  composerDispatch: React.Dispatch<ComposerActionType>
}

const defaultComposerState: ComposerState = {
  savedElement: {
    id: undefined,
    type: undefined
  },
  renamedElement: {
    id: undefined,
    type: undefined,
    newTitle: undefined
  },
  removedElement: {
    id: undefined,
    type: undefined
  },
  selectedWorldOutlineElement: {
    id: undefined,
    expanded: false,
    type: undefined,
    title: undefined
  },
  renamingWorldOutlineElement: {
    id: undefined,
    renaming: false
  },
  expandedWorldOutlineElements: [],
  totalSceneMapSelectedJumps: 0,
  totalSceneMapSelectedEvents: 0,
  totalSceneMapSelectedPaths: 0,
  selectedSceneMapCenter: { x: 0, y: 0, zoom: 0 },
  selectedSceneMapJump: null,
  selectedSceneMapEvent: null,
  selectedSceneMapPath: null,
  selectedSceneMapChoice: null,
  centeredSceneMapSelection: false,
  selectedElements: [],
  closedEditorTab: { id: undefined, type: undefined },
  characterModal: {
    visible: false,
    id: undefined
  },
  draggableEventContentElement: null
}

export const ComposerContext = createContext<ComposerContextType>({
  composer: defaultComposerState,
  composerDispatch: () => {}
})

const ComposerProvider: React.FC = ({ children }) => {
  const [composer, composerDispatch] = useReducer(
    composerReducer,
    defaultComposerState
  )

  return (
    <ComposerContext.Provider
      value={useMemo(() => ({ composer, composerDispatch }), [
        composer,
        composerDispatch
      ])}
    >
      {children}
    </ComposerContext.Provider>
  )
}

export default ComposerProvider
