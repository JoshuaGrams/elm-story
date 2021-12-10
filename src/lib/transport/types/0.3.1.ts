import {
  COMPARE_OPERATOR_TYPE,
  ElementId,
  ELEMENT_TYPE,
  FolderChildRefs,
  FolderParentRef,
  GameChildRefs,
  SceneChildRefs,
  SceneParentRef,
  SET_OPERATOR_TYPE,
  StudioId,
  VARIABLE_TYPE
} from '../../../data/types'

export interface RootData {
  children: GameChildRefs
  designer: string
  id: string
  engine: string
  jump: string | null
  schema: string
  studioId: StudioId
  studioTitle: string
  tags: string[]
  title: string
  updated: number
  version: string
}

export interface ChoiceData {
  id: ElementId
  passageId: ElementId
  tags: string[]
  title: string
  updated: number
}

export interface ChoiceCollection {
  [choiceId: string]: ChoiceData
}

export interface ConditionData {
  compare: [ElementId, COMPARE_OPERATOR_TYPE, string]
  id: ElementId
  routeId: ElementId
  tags: string[]
  title: string
  updated: number
  variableId: ElementId
}

export interface ConditionCollection {
  [conditionId: string]: ConditionData
}

export interface EffectData {
  id: ElementId
  routeId: ElementId
  set: [ElementId, SET_OPERATOR_TYPE, string]
  tags: string[]
  title: string
  updated: number
  variableId: string
}

export interface EffectCollection {
  [effectId: string]: EffectData
}

export interface FolderData {
  children: FolderChildRefs
  id: ElementId
  parent: FolderParentRef
  tags: string[]
  title: string
  updated: number
}

export interface FolderCollection {
  [folderId: string]: FolderData
}

export interface JumpData {
  editor?: {
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
  id: ElementId
  route: [ElementId?, ElementId?]
  sceneId?: ElementId
  tags: string[]
  title: string
  updated: number
}

export interface JumpCollection {
  [jumpId: string]: JumpData
}

export interface PassageData {
  choices: ElementId[]
  content: string
  editor?: {
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
  id: ElementId
  sceneId: ElementId
  tags: string[]
  title: string
  updated: number
}

export interface PassageCollection {
  [passageId: string]: PassageData
}

export interface RouteData {
  choiceId?: ElementId
  destinationId: ElementId
  destinationType: ELEMENT_TYPE
  id: ElementId
  originId: ElementId
  originType: ELEMENT_TYPE
  sceneId: ElementId
  tags: string[]
  title: string
  updated: number
}

export interface RouteCollection {
  [routeId: string]: RouteData
}

export interface SceneData {
  children: SceneChildRefs
  editor?: {
    componentEditorTransformX?: number
    componentEditorTransformY?: number
    componentEditorTransformZoom?: number
  }
  id: ElementId
  jumps: ElementId[]
  parent: SceneParentRef
  tags: string[]
  title: string
  updated: number
}

export interface SceneCollection {
  [sceneId: string]: SceneData
}

export interface VariableData {
  id: ElementId
  initialValue: string
  tags: string[]
  title: string
  type: VARIABLE_TYPE
  updated: number
}

export interface VariableCollection {
  [variableId: string]: VariableData
}

export interface GameDataJSON {
  _: RootData
  choices: ChoiceCollection
  conditions: ConditionCollection
  effects: EffectCollection
  folders: FolderCollection
  jumps: JumpCollection
  passages: PassageCollection
  routes: RouteCollection
  scenes: SceneCollection
  variables: VariableCollection
}
