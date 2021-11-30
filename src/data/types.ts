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
export type WorldId = string
export type ElementId = string

export interface WorldState {
  [variableId: string]: {
    title: string
    type: VARIABLE_TYPE
    initialValue: string
    currentValue: string
  }
}

export interface Component {
  id?: ElementId
  title: string
  tags: string[] | []
  updated?: number // UTC timestamp
  editor?: {
    // SceneMap transform
    componentEditorTransformX?: number
    componentEditorTransformY?: number
    componentEditorTransformZoom?: number
    // SceneMap->Passage,Jump position
    componentEditorPosX?: number
    componentEditorPosY?: number
  }
}

export interface Studio extends Component {
  id?: StudioId
  worlds: WorldId[] // references by ID
}

export interface Editor extends Component {}

// prettier-ignore
// [drive (x), energy (y)]
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
  [maskType: string]: [number, number, number] // drive, energy, influence
} = {
    EXCITED: [1, 1, 4],
      TENSE: [-1, 1, 4],
     LIVELY: [.75, .75, 3],
    NERVOUS: [-.75, .75, 3],
   CHEERFUL: [.5, .5, 2],
  IRRITATED: [-.5, .5, 2],
      HAPPY: [0.25, .25, 1],
    ANNOYED: [-0.25, .25, 1],
    NEUTRAL: [0, 0, 0],
    RELAXED: [.25, -.25, 1],
      BORED: [-.25, -.25, 1],
   CAREFREE: [.5, -.5, 2],
      WEARY: [-.5, -.5, 2],
       CALM: [.75, -.75, 3],
     GLOOMY: [-.75, -.75, 3],
     SERENE: [1, -1, 4],
        SAD: [-1, -1, 4]
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
    drive: number
    energy: number
  }
  dominate: {
    drive: CHARACTER_MASK_TYPE
    energy: CHARACTER_MASK_TYPE
  }
}

export interface CharacterMask {
  active: boolean
  assetId?: string // the location will change, but keep asset ID consistent
  type: CHARACTER_MASK_TYPE
}

// tuple: [uuid, ...]
export type CharacterRef = [string, string | CHARACTER_PRONOUN_TYPES]

export type CharacterRefs = Array<CharacterRef>

export interface Character extends Component {
  description?: string
  gameId: WorldId
  masks: CharacterMask[]
  refs: CharacterRefs // all strings must be unique
  // TODO: add variable ID
}

export type GameChildRefs = Array<
  [COMPONENT_TYPE.FOLDER | COMPONENT_TYPE.SCENE, ElementId]
>

export interface Game extends Component {
  children: GameChildRefs
  copyright?: string
  description?: string
  designer: string
  engine: string
  id?: WorldId
  jump: ElementId | null // Jump
  template: GAME_TEMPLATE
  version: string
  website?: string
}

// To reduce dupe, set null when parent is of type GAME
export type FolderParentRef = [
  COMPONENT_TYPE.GAME | COMPONENT_TYPE.FOLDER,
  ElementId | null
]
export type FolderChildRefs = Array<
  [COMPONENT_TYPE.FOLDER | COMPONENT_TYPE.SCENE, ElementId]
>

export interface Folder extends Component {
  children: FolderChildRefs
  gameId: WorldId
  parent: FolderParentRef
}

export type JumpRoute = [ElementId?, ElementId?] // [sceneId, passageId]

export interface Jump extends Component {
  gameId: WorldId
  sceneId?: ElementId
  route: JumpRoute
}

// To reduce dupe, set null when parent is of type GAME
export type SceneParentRef = [
  COMPONENT_TYPE.GAME | COMPONENT_TYPE.FOLDER,
  ElementId | null
]
export type SceneChildRefs = Array<[COMPONENT_TYPE.PASSAGE, ElementId]>

export interface Scene extends Component {
  children: SceneChildRefs
  gameId: WorldId
  parent: SceneParentRef
  jumps: ElementId[]
}

export interface Route extends Component {
  gameId: WorldId
  sceneId: ElementId
  originId: ElementId
  choiceId?: ElementId
  inputId?: ElementId
  originType: COMPONENT_TYPE | PASSAGE_TYPE
  destinationId: ElementId
  destinationType: COMPONENT_TYPE
}

// Route Condition
export interface Condition extends Component {
  gameId: WorldId
  routeId: ElementId
  variableId: ElementId
  compare: [ElementId, COMPARE_OPERATOR_TYPE, string, VARIABLE_TYPE] // variable ref
}

// Route Condition
export interface Effect extends Component {
  gameId: WorldId
  routeId: ElementId
  variableId: ElementId
  set: [ElementId, SET_OPERATOR_TYPE, string] // variable ref
}

export enum PASSAGE_TYPE {
  CHOICE = 'CHOICE',
  INPUT = 'INPUT'
}

export type EventPersona = [ElementId, CHARACTER_MASK_TYPE, string | undefined] // [characterId, mask, reference ID]

export interface Passage extends Component {
  gameOver: boolean // game end
  gameId: WorldId
  sceneId: ElementId
  choices: ElementId[]
  content: string
  input?: ElementId // input ref
  persona?: EventPersona
  type: PASSAGE_TYPE
}

export interface Choice extends Component {
  gameId: WorldId
  passageId: ElementId
}

export interface Input extends Component {
  gameId: WorldId
  passageId: ElementId
  variableId?: ElementId
}

export interface Variable extends Component {
  gameId: WorldId
  type: VARIABLE_TYPE
  initialValue: string
}
