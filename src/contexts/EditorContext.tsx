import React, { createContext, useMemo, useReducer } from 'react'

import { ElementId, ELEMENT_TYPE } from '../data/types'

interface EditorState {
  savedComponent: {
    id?: ElementId
    type?: ELEMENT_TYPE
  }
  renamedComponent: {
    id?: ElementId
    type?: ELEMENT_TYPE
    newTitle?: string
  }
  removedComponent: {
    id?: ElementId
    type?: ELEMENT_TYPE
  }
  selectedGameOutlineComponent: {
    id?: ElementId
    expanded?: boolean
    type?: ELEMENT_TYPE
    title?: string
  }
  renamingGameOutlineComponent: {
    id?: ElementId
    renaming: boolean
  }
  expandedGameOutlineComponents: ElementId[]
  totalComponentEditorSceneViewSelectedJumps: number
  totalComponentEditorSceneViewSelectedPassages: number
  totalComponentEditorSceneViewSelectedRoutes: number
  selectedComponentEditorSceneViewCenter: { x: number; y: number; zoom: number }
  selectedComponentEditorSceneViewJump: ElementId | null
  selectedComponentEditorSceneViewPassage: ElementId | null
  selectedComponentEditorSceneViewRoute: ElementId | null
  selectedComponentEditorSceneViewChoice: ElementId | null
  centeredComponentEditorSceneViewSelection: boolean
  selectedComponentEditorComponents: {
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
}

export enum EDITOR_ACTION_TYPE {
  COMPONENT_SAVE = 'EDITOR_COMPONENT_SAVE',
  COMPONENT_RENAME = 'EDITOR_COMPONENT_RENAME',
  COMPONENT_REMOVE = 'EDITOR_COMPONENT_REMOVE',
  GAME_OUTLINE_SELECT = 'GAME_OUTLINE_SELECT',
  GAME_OUTLINE_RENAME = 'GAME_OUTLINE_RENAME',
  GAME_OUTLINE_EXPAND = 'GAME_OUTLINE_EXPAND',
  COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_JUMPS = 'COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_JUMPS',
  COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES = 'COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES',
  COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_ROUTES = 'COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_ROUTES',
  COMPONENT_EDITOR_SCENE_VIEW_SELECT_CENTER = 'COMPONENT_EDITOR_SCENE_VIEW_SELECT_CENTER',
  COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP = 'COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP',
  COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE = 'COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE',
  COMPONENT_EDITOR_SCENE_VIEW_SELECT_ROUTE = 'COMPONENT_EDITOR_SCENE_VIEW_SELECT_ROUTE',
  COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE = 'COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE',
  COMPONENT_EDITOR_SCENE_VIEW_CENTERED_SELECTION = 'COMPONENT_EDITOR_SCENE_VIEW_CENTERED_SELECTION',
  COMPONENT_EDITOR_SELECT = 'COMPONENT_EDITOR_SELECT',
  COMPONENT_EDITOR_CLOSE_TAB = 'COMPONENT_EDITOR_CLOSE_TAB',
  OPEN_CHARACTER_MODAL = 'OPEN_CHARACTER_MODAL',
  CLOSE_CHARACTER_MODAL = 'CLOSE_CHARACTER_MODAL'
}

type EditorActionType =
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_SAVE
      savedComponent: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_RENAME
      renamedComponent: {
        id?: ElementId
        type?: ELEMENT_TYPE
        newTitle?: string
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE
      removedComponent: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT
      selectedGameOutlineComponent: {
        id?: ElementId
        expanded?: boolean
        type?: ELEMENT_TYPE
        title?: string
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME
      renamingGameOutlineComponent: {
        id?: ElementId
        renaming: boolean
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND
      expandedGameOutlineComponents: ElementId[]
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_JUMPS
      totalComponentEditorSceneViewSelectedJumps: number
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES
      totalComponentEditorSceneViewSelectedPassages: number
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_ROUTES
      totalComponentEditorSceneViewSelectedRoutes: number
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CENTER
      selectedComponentEditorSceneViewCenter: {
        x: number
        y: number
        zoom: number
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP
      selectedComponentEditorSceneViewJump: ElementId | null
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE
      selectedComponentEditorSceneViewPassage: ElementId | null
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_ROUTE
      selectedComponentEditorSceneViewRoute: ElementId | null
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE
      selectedComponentEditorSceneViewChoice: ElementId | null
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_CENTERED_SELECTION
      centeredComponentEditorSceneViewSelection: boolean
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SELECT
      selectedComponentEditorComponents: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }[]
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_CLOSE_TAB
      closedEditorTab: {
        id?: ElementId
        type?: ELEMENT_TYPE
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.OPEN_CHARACTER_MODAL
      characterId: ElementId
    }
  | {
      type: EDITOR_ACTION_TYPE.CLOSE_CHARACTER_MODAL
    }

const editorReducer = (
  state: EditorState,
  action: EditorActionType
): EditorState => {
  switch (action.type) {
    case EDITOR_ACTION_TYPE.COMPONENT_SAVE:
      return {
        ...state,
        savedComponent: action.savedComponent || {}
      }
    case EDITOR_ACTION_TYPE.COMPONENT_RENAME:
      return {
        ...state,
        renamedComponent: action.renamedComponent
      }
    case EDITOR_ACTION_TYPE.COMPONENT_REMOVE:
      return {
        ...state,
        removedComponent: action.removedComponent
      }
    case EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT:
      return {
        ...state,
        selectedGameOutlineComponent: action.selectedGameOutlineComponent || {}
      }
    case EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME:
      return {
        ...state,
        renamingGameOutlineComponent: action.renamingGameOutlineComponent
      }
    case EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND:
      return {
        ...state,
        expandedGameOutlineComponents: action.expandedGameOutlineComponents
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_JUMPS:
      return {
        ...state,
        totalComponentEditorSceneViewSelectedJumps:
          action.totalComponentEditorSceneViewSelectedJumps
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES:
      return {
        ...state,
        totalComponentEditorSceneViewSelectedPassages:
          action.totalComponentEditorSceneViewSelectedPassages
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_ROUTES:
      return {
        ...state,
        totalComponentEditorSceneViewSelectedRoutes:
          action.totalComponentEditorSceneViewSelectedRoutes
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CENTER:
      return {
        ...state,
        selectedComponentEditorSceneViewCenter:
          action.selectedComponentEditorSceneViewCenter
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP:
      return {
        ...state,
        selectedComponentEditorSceneViewJump:
          action.selectedComponentEditorSceneViewJump
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE:
      return {
        ...state,
        selectedComponentEditorSceneViewPassage:
          action.selectedComponentEditorSceneViewPassage
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_ROUTE:
      return {
        ...state,
        selectedComponentEditorSceneViewRoute:
          action.selectedComponentEditorSceneViewRoute
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE:
      return {
        ...state,
        selectedComponentEditorSceneViewChoice:
          action.selectedComponentEditorSceneViewChoice
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_CENTERED_SELECTION:
      return {
        ...state,
        centeredComponentEditorSceneViewSelection:
          action.centeredComponentEditorSceneViewSelection
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SELECT:
      return {
        ...state,
        selectedComponentEditorComponents:
          action.selectedComponentEditorComponents || []
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_CLOSE_TAB:
      return {
        ...state,
        closedEditorTab: action.closedEditorTab
      }
    case EDITOR_ACTION_TYPE.OPEN_CHARACTER_MODAL:
      return {
        ...state,
        characterModal: {
          visible: true,
          id: action.characterId
        }
      }
    case EDITOR_ACTION_TYPE.CLOSE_CHARACTER_MODAL:
      return {
        ...state,
        characterModal: {
          visible: false,
          id: undefined
        }
      }
    default:
      return state
  }
}

interface EditorContextType {
  editor: EditorState
  editorDispatch: React.Dispatch<EditorActionType>
}

const defaultEditorState: EditorState = {
  savedComponent: {
    id: undefined,
    type: undefined
  },
  renamedComponent: {
    id: undefined,
    type: undefined,
    newTitle: undefined
  },
  removedComponent: {
    id: undefined,
    type: undefined
  },
  selectedGameOutlineComponent: {
    id: undefined,
    expanded: false,
    type: undefined,
    title: undefined
  },
  renamingGameOutlineComponent: {
    id: undefined,
    renaming: false
  },
  expandedGameOutlineComponents: [],
  totalComponentEditorSceneViewSelectedJumps: 0,
  totalComponentEditorSceneViewSelectedPassages: 0,
  totalComponentEditorSceneViewSelectedRoutes: 0,
  selectedComponentEditorSceneViewCenter: { x: 0, y: 0, zoom: 0 },
  selectedComponentEditorSceneViewJump: null,
  selectedComponentEditorSceneViewPassage: null,
  selectedComponentEditorSceneViewRoute: null,
  selectedComponentEditorSceneViewChoice: null,
  centeredComponentEditorSceneViewSelection: false,
  selectedComponentEditorComponents: [],
  closedEditorTab: { id: undefined, type: undefined },
  characterModal: {
    visible: false,
    id: undefined
  }
}

export const EditorContext = createContext<EditorContextType>({
  editor: defaultEditorState,
  editorDispatch: () => {}
})

const EditorProvider: React.FC = ({ children }) => {
  const [editor, editorDispatch] = useReducer(editorReducer, defaultEditorState)

  return (
    <EditorContext.Provider
      value={useMemo(() => ({ editor, editorDispatch }), [
        editor,
        editorDispatch
      ])}
    >
      {children}
    </EditorContext.Provider>
  )
}

export default EditorProvider
