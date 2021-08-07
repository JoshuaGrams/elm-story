import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  SET_OPERATOR_TYPE,
  StudioId,
  VARIABLE_TYPE
} from '../../../data/types'

export interface RootData {
  chapters: ComponentId[]
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

export interface ChapterData {
  id: ComponentId
  scenes: ComponentId[]
  tags: string[]
  title: string
  updated: number
}

export interface ChapterCollection {
  [chapterId: string]: ChapterData
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

export interface JumpData {
  editor?: {
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
  id: ComponentId
  route: [ComponentId?, ComponentId?, ComponentId?]
  sceneId?: ComponentId
  tags: string[]
  title: string
  updated: number
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
  sceneId: ComponentId
  tags: string[]
  title: string
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
  originId: ComponentId
  originType: COMPONENT_TYPE
  sceneId: ComponentId
  tags: string[]
  title: string
  updated: number
}

export interface RouteCollection {
  [routeId: string]: RouteData
}

export interface SceneData {
  chapterId: ComponentId
  editor?: {
    componentEditorTransformX?: number
    componentEditorTransformY?: number
    componentEditorTransformZoom?: number
  }
  id: ComponentId
  jumps: ComponentId[]
  passages: ComponentId[]
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
  chapters: ChapterCollection
  choices: ChoiceCollection
  conditions: ConditionCollection
  effects: EffectCollection
  jumps: JumpCollection
  passages: PassageCollection
  routes: RouteCollection
  scenes: SceneCollection
  variables: VariableCollection
}
