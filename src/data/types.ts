export enum PLATFORM_TYPE {
  WINDOWS = 'win32',
  MACOS = 'darwin',
  LINUX = 'linux'
}

export enum WORLD_EXPORT_TYPE {
  JSON = 'JSON',
  PWA = 'PWA'
}

export enum ELEMENT_TYPE {
  CHARACTER = 'CHARACTER',
  CHOICE = 'CHOICE',
  CONDITION = 'CONDITION',
  EFFECT = 'EFFECT',
  EVENT = 'EVENT',
  FOLDER = 'FOLDER',
  INPUT = 'INPUT',
  JUMP = 'JUMP',
  PATH = 'PATH',
  SCENE = 'SCENE',
  STUDIO = 'STUDIO',
  VARIABLE = 'VARIABLE',
  WORLD = 'WORLD'
}

export enum WORLD_TEMPLATE {
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

export interface Element {
  id?: ElementId
  title: string
  tags: string[] | []
  updated?: number // UTC timestamp
  composer?: {
    // SceneMap transform
    sceneMapTransformX?: number
    sceneMapTransformY?: number
    sceneMapTransformZoom?: number
    // SceneMap->Event,Jump position
    sceneMapPosX?: number
    sceneMapPosY?: number
  }
}

export interface Studio extends Element {
  id?: StudioId
  worlds: WorldId[] // references by ID
}

export interface Editor extends Element {}

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

export interface Character extends Element {
  description?: string
  worldId: WorldId
  masks: CharacterMask[]
  refs: CharacterRefs // all strings must be unique
  // TODO: add variable ID
}

export type WorldChildRefs = Array<
  [ELEMENT_TYPE.FOLDER | ELEMENT_TYPE.SCENE, ElementId]
>

export interface World extends Element {
  children: WorldChildRefs
  copyright?: string
  description?: string
  designer: string
  engine: string
  id?: WorldId
  jump: ElementId | null // Jump
  template: WORLD_TEMPLATE
  version: string
  website?: string
}

// To reduce dupe, set null when parent is of type GAME
export type FolderParentRef = [
  ELEMENT_TYPE.WORLD | ELEMENT_TYPE.FOLDER,
  ElementId | null
]
export type FolderChildRefs = Array<
  [ELEMENT_TYPE.FOLDER | ELEMENT_TYPE.SCENE, ElementId]
>

export interface Folder extends Element {
  children: FolderChildRefs
  worldId: WorldId
  parent: FolderParentRef
}

export type JumpPath = [ElementId?, ElementId?] // [sceneId, eventId]

export interface Jump extends Element {
  worldId: WorldId
  sceneId?: ElementId
  path: JumpPath
}

// To reduce dupe, set null when parent is of type GAME
export type SceneParentRef = [
  ELEMENT_TYPE.WORLD | ELEMENT_TYPE.FOLDER,
  ElementId | null
]
export type SceneChildRef = [ELEMENT_TYPE.EVENT | ELEMENT_TYPE.JUMP, ElementId]
export type SceneChildRefs = Array<SceneChildRef>

export interface Scene extends Element {
  children: SceneChildRefs
  worldId: WorldId
  parent: SceneParentRef
}

export enum PATH_CONDITIONS_TYPE {
  ALL = 'ALL',
  ANY = 'ANY'
}

export interface Path extends Element {
  choiceId?: ElementId
  conditionsType: PATH_CONDITIONS_TYPE
  destinationId: ElementId
  destinationType: ELEMENT_TYPE
  inputId?: ElementId
  originId: ElementId
  originType: ELEMENT_TYPE | EVENT_TYPE
  sceneId: ElementId
  worldId: WorldId
}

// Path Condition
export interface Condition extends Element {
  compare: [ElementId, COMPARE_OPERATOR_TYPE, string, VARIABLE_TYPE] // variable ref
  pathId: ElementId
  variableId: ElementId
  worldId: WorldId
}

// Path Condition
export interface Effect extends Element {
  worldId: WorldId
  pathId: ElementId
  variableId: ElementId
  set: [ElementId, SET_OPERATOR_TYPE, string] // variable ref
}

export enum EVENT_TYPE {
  CHOICE = 'CHOICE',
  INPUT = 'INPUT',
  JUMP = 'JUMP'
}

export type EventPersona = [ElementId, CHARACTER_MASK_TYPE, string | undefined] // [characterId, mask, reference ID]

export interface Event extends Element {
  choices: ElementId[]
  content: string
  ending: boolean // world end
  input?: ElementId // input ref
  persona?: EventPersona
  sceneId: ElementId
  type: EVENT_TYPE
  worldId: WorldId
}

export interface Choice extends Element {
  worldId: WorldId
  eventId: ElementId
}

export interface Input extends Element {
  worldId: WorldId
  eventId: ElementId
  variableId?: ElementId
}

export interface Variable extends Element {
  worldId: WorldId
  type: VARIABLE_TYPE
  initialValue: string
}
