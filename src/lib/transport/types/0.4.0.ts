import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  FolderChildRefs,
  FolderParentRef,
  GameChildRefs,
  PASSAGE_TYPE,
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
  id: ComponentId
  passageId: ComponentId
  tags: string[]
  title: string
  updated: number
}

export interface ChoiceCollection {
  [choiceId: string]: ChoiceData
}

export interface ConditionData {
  compare: [ComponentId, COMPARE_OPERATOR_TYPE, string]
  id: ComponentId
  routeId: ComponentId
  tags: string[]
  title: string
  updated: number
  variableId: ComponentId
}

export interface ConditionCollection {
  [conditionId: string]: ConditionData
}

export interface EffectData {
  id: ComponentId
  routeId: ComponentId
  set: [ComponentId, SET_OPERATOR_TYPE, string]
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
  id: ComponentId
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
  id: ComponentId
  route: [ComponentId?, ComponentId?]
  sceneId?: ComponentId
  tags: string[]
  title: string
  updated: number
}

export interface InputData {
  id: ComponentId
  passageId: ComponentId
  tags: string[]
  title: string
  updated: number
  variableId?: ComponentId
}

export interface InputCollection {
  [choiceId: string]: InputData
}

export interface JumpCollection {
  [jumpId: string]: JumpData
}

export interface PassageData {
  choices: ComponentId[]
  content: string
  editor?: {
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
  id: ComponentId
  input?: ComponentId // variable ID
  sceneId: ComponentId
  tags: string[]
  title: string
  type: PASSAGE_TYPE
  updated: number
}

export interface PassageCollection {
  [passageId: string]: PassageData
}

export interface RouteData {
  choiceId?: ComponentId
  destinationId: ComponentId
  destinationType: COMPONENT_TYPE
  id: ComponentId
  inputId?: ComponentId
  originId: ComponentId
  originType: COMPONENT_TYPE | PASSAGE_TYPE
  sceneId: ComponentId
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
  id: ComponentId
  jumps: ComponentId[]
  parent: SceneParentRef
  tags: string[]
  title: string
  updated: number
}

export interface SceneCollection {
  [sceneId: string]: SceneData
}

export interface VariableData {
  id: ComponentId
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
  inputs: InputCollection
  jumps: JumpCollection
  passages: PassageCollection
  routes: RouteCollection
  scenes: SceneCollection
  variables: VariableCollection
}
