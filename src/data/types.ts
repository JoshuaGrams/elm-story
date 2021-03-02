export enum COMPONENT_TYPE {
  STUDIO = 'STUDIO',
  GAME = 'game',
  CHAPTER = 'CHAPTER',
  SCENE = 'SCENE',
  PASSAGE = 'PASSAGE',
  ACTION = 'ACTION',
  CONDITION = 'CONDITION',
  EFFECT = 'EFFECT',
  VARIABLE = 'VARIABLE'
}

export enum GAME_TEMPLATE {
  ADVENTURE = 'ADVENTURE',
  OPEN_WORLD = 'OPEN_WORLD'
}

export enum VARIABLE {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  IMAGE = 'IMAGE'
}

export enum COMPARE_OPERATOR {
  EQ = '===', // equal to
  NE = '!==', // not equal to
  GTE = '>=', // greater than or equal to
  GT = '>', // greater than
  LT = '<', // less than
  LTE = '<=', // less than or equal to
  EX = '!== undefined', // exits
  NX = '=== undefined' // does not exist
}

export enum SET_OPERATOR {
  ASSIGN = '=',
  ADD = '+',
  SUBTRACT = '-',
  DIVIDE = '/'
}

export type StudioId = string
export type GameId = string
export type ComponentId = string

type VariableId = string

export interface Component {
  id?: ComponentId | VariableId
  title: string
  tags: string[] | []
  updated?: number // UTC timestamp
}

export interface StudioDocument extends Component {
  id?: StudioId
  games: GameId[] // references by ID
}

export interface EditorDocument extends Component {}

export interface GameDocument extends Component {
  id?: GameId
  template: GAME_TEMPLATE
  director: string
  chapters: ComponentId[]
  version: string
  engine: string
}

export interface ChapterDocument extends Component {
  scenes: ComponentId[]
}

export interface SceneDocument extends Component {
  passages: ComponentId[]
}

export interface PassageDocument extends Component {
  content: string
  actions: ComponentId[]
}

export interface ActionDocument extends Component {
  goto: [
    COMPONENT_TYPE.CHAPTER | COMPONENT_TYPE.SCENE | COMPONENT_TYPE.PASSAGE,
    ComponentId
  ]
  conditions: ConditionDocument[] | string[]
  effects: ComponentId[]
}

export interface ConditionDocument extends Component {
  compare: [VariableId, COMPARE_OPERATOR, VariableId | string]
}

export interface EffectDocument extends Component {
  set: [VariableId, SET_OPERATOR, VariableId | string]
}

export interface VariableDocument extends Component {
  var_type: VARIABLE
  default?: string
}
