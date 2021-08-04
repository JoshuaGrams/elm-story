import { Descendant } from 'slate'

export enum PLATFORM_TYPE {
  WINDOWS = 'win32',
  MACOS = 'darwin',
  LINUX = 'linux'
}

export enum COMPONENT_TYPE {
  STUDIO = 'STUDIO',
  GAME = 'GAME',
  JUMP = 'JUMP',
  FOLDER = 'FOLDER',
  CHAPTER = 'CHAPTER',
  SCENE = 'SCENE',
  ROUTE = 'ROUTE',
  PASSAGE = 'PASSAGE',
  CHOICE = 'CHOICE',
  CONDITION = 'CONDITION',
  EFFECT = 'EFFECT',
  VARIABLE = 'VARIABLE'
}

export enum GAME_TEMPLATE {
  ADVENTURE = 'ADVENTURE',
  OPEN_WORLD = 'OPEN_WORLD'
}

export enum VARIABLE_TYPE {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  IMAGE = 'IMAGE',
  URL = 'URL'
}

export enum COMPARE_OPERATOR_TYPE {
  EQ = '=', // equal to
  NE = '!=', // not equal to
  GTE = '>=', // greater than or equal to
  GT = '>', // greater than
  LT = '<', // less than
  LTE = '<=' // less than or equal to
}

export enum SET_OPERATOR_TYPE {
  ASSIGN = '=',
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/'
}

export const DEFAULT_PASSAGE_CONTENT: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]

export type StudioId = string
export type GameId = string
export type ComponentId = string

export interface GameState {
  [variableId: string]: {
    title: string
    type: VARIABLE_TYPE
    initialValue: string
    currentValue: string
  }
}

export interface Component {
  id?: ComponentId
  title: string
  tags: string[] | []
  updated?: number // UTC timestamp
  editor?: {
    // SceneView transform
    componentEditorTransformX?: number
    componentEditorTransformY?: number
    componentEditorTransformZoom?: number
    // SceneView->Passage,Jump position
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
}

export interface Studio extends Component {
  id?: StudioId
  games: GameId[] // references by ID
}

export interface Editor extends Component {}

export interface Game extends Component {
  id?: GameId
  template: GAME_TEMPLATE
  designer: string
  version: string
  engine: string
  chapters: ComponentId[]
  jump: ComponentId | null // Jump
}

export type JumpRoute = [ComponentId?, ComponentId?, ComponentId?] // [chapterId, sceneId, passageId]

export interface Jump extends Component {
  gameId: GameId
  sceneId?: ComponentId
  route: JumpRoute
}

export interface Folder extends Component {
  gameId: GameId
  children: Array<[COMPONENT_TYPE.FOLDER | COMPONENT_TYPE.SCENE, ComponentId]>
}

export interface Chapter extends Component {
  gameId: GameId
  scenes: ComponentId[]
}

export interface Scene extends Component {
  gameId: GameId
  chapterId: ComponentId
  passages: ComponentId[]
  jumps: ComponentId[] // Jumps
}

export interface Route extends Component {
  gameId: GameId
  sceneId: ComponentId
  originId: ComponentId
  choiceId?: ComponentId
  originType: COMPONENT_TYPE
  destinationId: ComponentId
  destinationType: COMPONENT_TYPE
}

// Route Condition
export interface Condition extends Component {
  gameId: GameId
  routeId: ComponentId
  variableId: ComponentId
  compare: [ComponentId, COMPARE_OPERATOR_TYPE, string, VARIABLE_TYPE] // variable ref
}

// Route Condition
export interface Effect extends Component {
  gameId: GameId
  routeId: ComponentId
  variableId: ComponentId
  set: [ComponentId, SET_OPERATOR_TYPE, string] // variable ref
}

export interface Passage extends Component {
  gameId: GameId
  sceneId: ComponentId
  choices: ComponentId[]
  content: string
}

export interface Choice extends Component {
  gameId: GameId
  passageId: ComponentId
}

export interface Variable extends Component {
  gameId: GameId
  type: VARIABLE_TYPE
  initialValue: string
}
