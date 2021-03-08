import React, { createContext, useMemo, useReducer } from 'react'

import { ComponentId } from '../data/types'

interface EditorState {
  selectedGameOutlineComponent: {
    id: ComponentId | undefined
    expanded: boolean
  }
  renamingGameOutlineComponent: {
    id: ComponentId | undefined
    renaming: boolean
  }
}

export enum EDITOR_ACTION_TYPE {
  GAME_OUTLINE_SELECT = 'GAME_OUTLINE_SELECT',
  GAME_OUTLINE_RENAME = 'GAME_OUTLINE_RENAME'
}

type EditorActionType =
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT
      selectedGameOutlineComponent: {
        id: ComponentId | undefined
        expanded: boolean
      }
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME
      renamingGameOutlineComponent: {
        id: ComponentId | undefined
        renaming: boolean
      }
    }

const editorReducer = (
  state: EditorState,
  action: EditorActionType
): EditorState => {
  switch (action.type) {
    case EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT:
      return {
        ...state,
        selectedGameOutlineComponent: action.selectedGameOutlineComponent
      }
    case EDITOR_ACTION_TYPE.GAME_OUTLINE_RENAME:
      return {
        ...state,
        renamingGameOutlineComponent: action.renamingGameOutlineComponent
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
  selectedGameOutlineComponent: {
    id: undefined,
    expanded: false
  },
  renamingGameOutlineComponent: {
    id: undefined,
    renaming: false
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
