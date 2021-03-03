import React, { createContext, useMemo, useReducer } from 'react'

import { ComponentId } from '../data/types'

interface EditorState {
  selectedGameOutlineComponentId: ComponentId | undefined
  expandedGameOutlineComponentIds: ComponentId[]
}

export enum EDITOR_ACTION_TYPE {
  GAME_OUTLINE_SELECT = 'GAME_OUTLINE_SELECT',
  GAME_OUTLINE_EXPAND = 'GAME_OUTLINE_EXPANDED'
}

type EditorActionType =
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT
      selectedComponentId: ComponentId
    }
  | {
      type: EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND
      expandedComponentIds: ComponentId[]
    }

const editorReducer = (
  state: EditorState,
  action: EditorActionType
): EditorState => {
  switch (action.type) {
    case EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT:
      return {
        ...state,
        selectedGameOutlineComponentId: action.selectedComponentId
      }
    case EDITOR_ACTION_TYPE.GAME_OUTLINE_EXPAND:
      return {
        ...state,
        expandedGameOutlineComponentIds: action.expandedComponentIds
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
  selectedGameOutlineComponentId: undefined,
  expandedGameOutlineComponentIds: []
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
