import { Descendant } from 'slate'

export enum PLATFORM_TYPE {
  WINDOWS = 'win32',
  MACOS = 'darwin',
  LINUX = 'linux'
}

export enum COMPONENT_TYPE {
  CHARACTER = 'CHARACTER',
  CHOICE = 'CHOICE',
  CONDITION = 'CONDITION',
  EFFECT = 'EFFECT',
  FOLDER = 'FOLDER',
  GAME = 'GAME',
  INPUT = 'INPUT',
  JUMP = 'JUMP',
  PASSAGE = 'PASSAGE',
  ROUTE = 'ROUTE',
  SCENE = 'SCENE',
  STUDIO = 'STUDIO',
  VARIABLE = 'VARIABLE'
}

export enum GAME_TEMPLATE {
  ADVENTURE = 'ADVENTURE',
  OPEN_WORLD = 'OPEN_WORLD'
}

export enum VARIABLE_TYPE {
  CHARACTER = 'CHARACTER',
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

// prettier-ignore
// [desire (x), energy (y)]
export enum CHARACTER_MASK_TYPE {
                           // max(d,e)
      EXCITED = 'EXCITED', // [+1.00, +1.00]
          TENSE = 'TENSE', // [-1.00, +1.00]
        LIVELY = 'LIVELY', // [+0.75, +0.75]
      NERVOUS = 'NERVOUS', // [-0.75, +0.75]
    CHEERFUL = 'CHEERFUL', // [+0.50, +0.50]
  IRRITATED = 'IRRITATED', // [-0.50, +0.50]
          HAPPY = 'HAPPY', // [+0.25, +0.25]
      ANNOYED = 'ANNOYED', // [-0.25, +0.25]
      
      NEUTRAL = 'NEUTRAL', // [ 0.00,  0.00]
      
      RELAXED = 'RELAXED', // [+0.25, -0.25]
          BORED = 'BORED', // [-0.25, -0.25]
    CAREFREE = 'CAREFREE', // [+0.50, -0.50]
          WEARY = 'WEARY', // [-0.50, -0.50]
            CALM = 'CALM', // [+0.75, -0.75]
        GLOOMY = 'GLOOMY', // [-0.75, -0.75]
        SERENE = 'SERENE', // [+1.00, -1.00]
              SAD = 'SAD'  // [-1.00, -1.00]
                           // min(d,e)
}

// prettier-ignore
export const CHARACTER_MASK_VALUES: {
  [maskType: string]: [number, number]
} = {
    EXCITED: [1, 1],
      TENSE: [-1, 1],
     LIVELY: [.75, .75],
    NERVOUS: [-.75, .75],
   CHEERFUL: [.5, .5],
  IRRITATED: [-.5, .5],
      HAPPY: [0.25, .25],
    ANNOYED: [-0.25, .25],
    NEUTRAL: [0, 0],
    RELAXED: [.25, -.25],
      BORED: [-.25, -.25],
   CAREFREE: [.5, -.5],
      WEARY: [-.5, -.5],
       CALM: [.75, -.75],
     GLOOMY: [-.75, -.75],
     SERENE: [1, -1],
        SAD: [-1, -1]
}

export enum CHARACTER_PRONOUN_TYPES {
  SHE = 'SHE',
  HER = 'HER',
  HERS = 'HERS',
  HERSELF = 'HERSELF',
  HE = 'HE',
  HIM = 'HIM',
  HIS = 'HIS',
  HIMSELF = 'HIMSELF',
  THEY = 'THEY',
  THEM = 'THEM',
  THEIRS = 'THEIRS',
  THEMSELF = 'THEMSELF',
  ZE = 'ZE',
  HIR = 'HIR',
  ZIR = 'ZIR',
  HIRS = 'HIRS',
  ZIRS = 'ZIRS',
  HIRSELF = 'HIRSELF',
  ZIRSELF = 'ZIRSELF'
}

export interface CharacterMakeup {
  aggregate: {
    desire: number
    energy: number
  }
  dominate: {
    desire: CHARACTER_MASK_TYPE
    energy: CHARACTER_MASK_TYPE
  }
}

export interface CharacterMask {
  active: boolean
  imageId?: string // the location will change, but keep asset ID consistent
  type: CHARACTER_MASK_TYPE
}

export interface Character extends Component {
  description?: string
  gameId: GameId
  masks: CharacterMask[]
  refs: string[] // all strings must be unique
  // TODO: add variable ID
}

export type GameChildRefs = Array<
  [COMPONENT_TYPE.FOLDER | COMPONENT_TYPE.SCENE, ComponentId]
>

export interface Game extends Component {
  children: GameChildRefs
  copyright?: string
  description?: string
  designer: string
  engine: string
  id?: GameId
  jump: ComponentId | null // Jump
  template: GAME_TEMPLATE
  version: string
  website?: string
}

// To reduce dupe, set null when parent is of type GAME
export type FolderParentRef = [
  COMPONENT_TYPE.GAME | COMPONENT_TYPE.FOLDER,
  ComponentId | null
]
export type FolderChildRefs = Array<
  [COMPONENT_TYPE.FOLDER | COMPONENT_TYPE.SCENE, ComponentId]
>

export interface Folder extends Component {
  children: FolderChildRefs
  gameId: GameId
  parent: FolderParentRef
}

export type JumpRoute = [ComponentId?, ComponentId?] // [sceneId, passageId]

export interface Jump extends Component {
  gameId: GameId
  sceneId?: ComponentId
  route: JumpRoute
}

// To reduce dupe, set null when parent is of type GAME
export type SceneParentRef = [
  COMPONENT_TYPE.GAME | COMPONENT_TYPE.FOLDER,
  ComponentId | null
]
export type SceneChildRefs = Array<[COMPONENT_TYPE.PASSAGE, ComponentId]>

export interface Scene extends Component {
  children: SceneChildRefs
  gameId: GameId
  parent: SceneParentRef
  jumps: ComponentId[]
}

export interface Route extends Component {
  gameId: GameId
  sceneId: ComponentId
  originId: ComponentId
  choiceId?: ComponentId
  inputId?: ComponentId
  originType: COMPONENT_TYPE | PASSAGE_TYPE
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

export enum PASSAGE_TYPE {
  CHOICE = 'CHOICE',
  INPUT = 'INPUT'
}

export interface Passage extends Component {
  gameOver: boolean // game end
  gameId: GameId
  sceneId: ComponentId
  choices: ComponentId[]
  content: string
  input?: ComponentId // input ref
  type: PASSAGE_TYPE
}

export interface Choice extends Component {
  gameId: GameId
  passageId: ComponentId
}

export interface Input extends Component {
  gameId: GameId
  passageId: ComponentId
  variableId?: ComponentId
}

export interface Variable extends Component {
  gameId: GameId
  type: VARIABLE_TYPE
  initialValue: string
}
