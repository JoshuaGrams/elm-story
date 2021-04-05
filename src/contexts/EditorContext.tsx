import React, { createContext, useMemo, useReducer } from 'react'

import { ComponentId, COMPONENT_TYPE } from '../data/types'

interface EditorState {
  savedComponent: {
    id?: ComponentId
    type?: COMPONENT_TYPE
  }
  renamedComponent: {
    id?: ComponentId
    type?: COMPONENT_TYPE
    newTitle?: string
  }
  removedComponent: {
    id?: ComponentId
    type?: COMPONENT_TYPE
  }
  selectedGameOutlineComponent: {
    id?: ComponentId
    expanded?: boolean
    type?: COMPONENT_TYPE
    title?: string
  }
  renamingGameOutlineComponent: {
    id?: ComponentId
    renaming: boolean
  }
  expandedGameOutlineComponents: ComponentId[]
  totalComponentEditorSceneViewSelectedPassages: number
  totalComponentEditorSceneViewSelectedRoutes: number
  selectedComponentEditorSceneViewPassage: ComponentId | null
  selectedComponentEditorSceneViewChoice: ComponentId | null
  selectedComponentEditorComponents: {
    id?: ComponentId
    type?: COMPONENT_TYPE
  }[]
}

export enum EDITOR_ACTION_TYPE {
  COMPONENT_SAVE = 'EDITOR_COMPONENT_SAVE',
  COMPONENT_RENAME = 'EDITOR_COMPONENT_RENAME',
  COMPONENT_REMOVE = 'EDITOR_COMPONENT_REMOVE',
  GAME_OUTLINE_SELECT = 'GAME_OUTLINE_SELECT',
  GAME_OUTLINE_RENAME = 'GAME_OUTLINE_RENAME',
  GAME_OUTLINE_EXPAND = 'GAME_OUTLINE_EXPAND',
  COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES = 'COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_PASSAGES',
  COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_ROUTES = 'COMPONENT_EDITOR_SCENE_VIEW_TOTAL_SELECTED_ROUTES',
  COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE = 'COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE',
  COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE = 'COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE',
  COMPONENT_EDITOR_SELECT = 'COMPONENT_EDITOR_SELECT'
}

type EditorActionType =
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_SAVE
      savedComponent: {
        id?: ComponentId
        type?: COMPONENT_TYPE
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_RENAME
      renamedComponent: {
        id?: ComponentId
        type?: COMPONENT_TYPE
        newTitle?: string
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_REMOVE
      removedComponent: {
        id?: ComponentId
        type?: COMPONENT_TYPE
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT
      selectedGameOutlineComponent: {
        id?: ComponentId
        expanded?: boolean
        type?: COMPONENT_TYPE
        title?: string
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME
      renamingGameOutlineComponent: {
        id?: ComponentId
        renaming: boolean
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND
      expandedGameOutlineComponents: ComponentId[]
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
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE
      selectedComponentEditorSceneViewPassage: ComponentId | null
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE
      selectedComponentEditorSceneViewChoice: ComponentId | null
    }
  | {
      type: EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SELECT
      selectedComponentEditorComponents: {
        id?: ComponentId
        type?: COMPONENT_TYPE
      }[]
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
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE:
      return {
        ...state,
        selectedComponentEditorSceneViewPassage:
          action.selectedComponentEditorSceneViewPassage
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_CHOICE:
      return {
        ...state,
        selectedComponentEditorSceneViewChoice:
          action.selectedComponentEditorSceneViewChoice
      }
    case EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SELECT:
      return {
        ...state,
        selectedComponentEditorComponents:
          action.selectedComponentEditorComponents || []
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
  totalComponentEditorSceneViewSelectedPassages: 0,
  totalComponentEditorSceneViewSelectedRoutes: 0,
  selectedComponentEditorSceneViewPassage: null,
  selectedComponentEditorSceneViewChoice: null,
  selectedComponentEditorComponents: []
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
