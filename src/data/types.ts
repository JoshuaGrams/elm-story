export enum DOC_TYPE {
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

export type DocumentId = string
type VariableId = string

export interface Document {
  id?: DocumentId | VariableId
  title: string
  tags: string[] | []
  updated?: number // UTC timestamp
}

export interface StudioDocument extends Document {
  games: DocumentId[] // references by ID
}

export interface EditorDocument extends Document {}

export interface GameDocument extends Document {
  template: GAME_TEMPLATE
  director: string
  chapters: DocumentId[]
  version: string
  engine: string
}

export interface ChapterDocument extends Document {
  scenes: DocumentId[]
}

export interface SceneDocument extends Document {
  passages: DocumentId[]
}

export interface PassageDocument extends Document {
  content: string
  actions: DocumentId[]
}

export interface ActionDocument extends Document {
  goto: [DOC_TYPE.CHAPTER | DOC_TYPE.SCENE | DOC_TYPE.PASSAGE, DocumentId]
  conditions: ConditionDocument[] | string[]
  effects: DocumentId[]
}

export interface ConditionDocument extends Document {
  compare: [VariableId, COMPARE_OPERATOR, VariableId | string]
}

export interface EffectDocument extends Document {
  set: [VariableId, SET_OPERATOR, VariableId | string]
}

export interface VariableDocument extends Document {
  var_type: VARIABLE
  default?: string
}
