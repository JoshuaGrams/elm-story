export enum DOCUMENT {
  PROFILE = 'PROFILE',
  GAME = 'GAME',
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

export enum COMPARISON_OPERATOR {
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

export enum DOCUMENT_SELECTED {
  NOT_SELECTED = 0,
  SELECTED = 1
}

type DocumentId = string
type VariableId = string

export interface Document {
  id: DocumentId | VariableId
  type: DOCUMENT
  name: string
}

export interface ProfileDocument extends Document {
  type: DOCUMENT.PROFILE
  selected: DOCUMENT_SELECTED
}

export interface GameDocument extends Document {
  type: DOCUMENT.GAME
  template: GAME_TEMPLATE
  director: string
  chapters: ChapterDocument[] | []
  version: string
  engine: string
}

export interface ChapterDocument extends Document {
  type: DOCUMENT.CHAPTER
  scenes: SceneDocument[] | []
}

export interface SceneDocument extends Document {
  type: DOCUMENT.SCENE
  passages: PassageDocument[] | []
}

export interface PassageDocument extends Document {
  type: DOCUMENT.PASSAGE
  content: string
  actions: ActionDocument[] | []
}

export interface ActionDocument extends Document {
  type: DOCUMENT.ACTION
  label: string
  goto: [DOCUMENT.CHAPTER | DOCUMENT.SCENE | DOCUMENT.PASSAGE, DocumentId]
  conditions: ConditionDocument[] | []
  effects: EffectDocument[] | []
}

export interface ConditionDocument extends Document {
  type: DOCUMENT.CONDITION
  eval: [VariableId, COMPARISON_OPERATOR, VariableId | string]
}

export interface EffectDocument extends Document {
  type: DOCUMENT.EFFECT
  set: [VariableId, SET_OPERATOR, VariableId | string]
}

export interface VariableDocument extends Document {
  type: DOCUMENT.VARIABLE
  var_type: VARIABLE
  name: string
  label: string
  default?: string
}
