import React, { createContext, useMemo, useReducer } from 'react'

export enum SCENE_VIEW_CONTEXT {
  SCENE_SELECTION_NONE = 'SCENE_SELECTION_NONE',
  SCENE_SELECTION_PASSAGE = 'SCENE_SELECTION_PASSAGE',
  SCENE_SELECTION_JUMP = 'SCENE_SELECTION_JUMP',
  SCENE_SELECTION = 'SCENE_SELECTION',
  PASSAGE = 'PASSAGE'
}

interface EditorTabState {
  sceneViewContext: SCENE_VIEW_CONTEXT
}

export enum EDITOR_TAB_ACTION_TYPE {
  SCENE_VIEW_CONTEXT = 'SCENE_VIEW_CONTEXT'
}

type EditorTabActionType = {
  type: EDITOR_TAB_ACTION_TYPE.SCENE_VIEW_CONTEXT
  sceneViewContext: SCENE_VIEW_CONTEXT
}

const editorTabReducer = (
  state: EditorTabState,
  action: EditorTabActionType
): EditorTabState => {
  switch (action.type) {
    case EDITOR_TAB_ACTION_TYPE.SCENE_VIEW_CONTEXT:
      return {
        ...state,
        sceneViewContext: action.sceneViewContext
      }
    default:
      return state
  }
}

interface EditorTabContextType {
  editorTab: EditorTabState
  editorTabDispatch: React.Dispatch<EditorTabActionType>
}

const defaultEditorTabState: EditorTabState = {
  sceneViewContext: SCENE_VIEW_CONTEXT.SCENE_SELECTION_NONE
}

export const EditorTabContext = createContext<EditorTabContextType>({
  editorTab: defaultEditorTabState,
  editorTabDispatch: () => {}
})

const EditorTabProvider: React.FC = ({ children }) => {
  const [editorTab, editorTabDispatch] = useReducer(
    editorTabReducer,
    defaultEditorTabState
  )

  return (
    <EditorTabContext.Provider
      value={useMemo(() => ({ editorTab, editorTabDispatch }), [
        editorTab,
        editorTabDispatch
      ])}
    >
      {children}
    </EditorTabContext.Provider>
  )
}

export default EditorTabProvider
