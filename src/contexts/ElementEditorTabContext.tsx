import React, { createContext, useMemo, useReducer } from 'react'

import { ElementId } from '../data/types'

export enum SCENE_MAP_CONTEXT {
  SCENE_SELECTION_NONE = 'SCENE_SELECTION_NONE',
  SCENE_SELECTION_PASSAGE = 'SCENE_SELECTION_PASSAGE',
  SCENE_SELECTION_JUMP = 'SCENE_SELECTION_JUMP',
  SCENE_SELECTION = 'SCENE_SELECTION',
  EVENT = 'EVENT'
}

interface ElementEditorTabState {
  eventForEditing: { id?: ElementId; visible: boolean }
  sceneMapContext: SCENE_MAP_CONTEXT
}

export enum ELEMENT_EDITOR_TAB_ACTION_TYPE {
  EDIT_EVENT = 'EDIT_EVENT',
  SCENE_MAP_CONTEXT = 'SCENE_MAP_CONTEXT'
}

type ElementEditorTabActionType =
  | {
      type: ELEMENT_EDITOR_TAB_ACTION_TYPE.EDIT_EVENT
      eventForEditing: { id?: ElementId; visible: boolean }
    }
  | {
      type: ELEMENT_EDITOR_TAB_ACTION_TYPE.SCENE_MAP_CONTEXT
      sceneMapContext: SCENE_MAP_CONTEXT
    }

const elementEditorTabReducer = (
  state: ElementEditorTabState,
  action: ElementEditorTabActionType
): ElementEditorTabState => {
  switch (action.type) {
    case ELEMENT_EDITOR_TAB_ACTION_TYPE.EDIT_EVENT:
      return {
        ...state,
        eventForEditing: action.eventForEditing
      }
    case ELEMENT_EDITOR_TAB_ACTION_TYPE.SCENE_MAP_CONTEXT:
      return {
        ...state,
        sceneMapContext: action.sceneMapContext
      }
    default:
      return state
  }
}

interface ElementEditorTabContextType {
  elementEditorTab: ElementEditorTabState
  elementEditorTabDispatch: React.Dispatch<ElementEditorTabActionType>
}

const defaultElementEditorTabState: ElementEditorTabState = {
  eventForEditing: { id: undefined, visible: false },
  sceneMapContext: SCENE_MAP_CONTEXT.SCENE_SELECTION_NONE
}

export const ElementEditorTabContext = createContext<
  ElementEditorTabContextType
>({
  elementEditorTab: defaultElementEditorTabState,
  elementEditorTabDispatch: () => {}
})

const ElementEditorTabProvider: React.FC = ({ children }) => {
  const [elementEditorTab, elementEditorTabDispatch] = useReducer(
    elementEditorTabReducer,
    defaultElementEditorTabState
  )

  return (
    <ElementEditorTabContext.Provider
      value={useMemo(() => ({ elementEditorTab, elementEditorTabDispatch }), [
        elementEditorTab,
        elementEditorTabDispatch
      ])}
    >
      {children}
    </ElementEditorTabContext.Provider>
  )
}

export default ElementEditorTabProvider
