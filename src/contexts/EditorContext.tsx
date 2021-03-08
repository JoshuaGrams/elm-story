import React, { createContext, useMemo, useReducer } from 'react'

import { ComponentId } from '../data/types'

interface EditorState {
  selectedGameOutlineComponent: {
    id: ComponentId | undefined,
    expanded: boolean
  }
}

export enum EDITOR_ACTION_TYPE {
  GAME_OUTLINE_SELECT = 'GAME_OUTLINE_SELECT'
}

type EditorActionType = {
  type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT
  selectedGameOutlineComponent: {
    id: ComponentId | undefined,
    expanded: boolean
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
