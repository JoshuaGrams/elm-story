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

export enum COMPARE_OPERATOR_TYPE {
  EQ = '=',
  NE = '!=',
  GTE = '>=',
  GT = '>',
  LT = '<',
  LTE = '<='
}

export enum SET_OPERATOR_TYPE {
  ASSIGN = '=',
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/'
}

export enum EVENT_TYPE {
  CHOICE = 'CHOICE',
  INPUT = 'INPUT'
}

export enum VARIABLE_TYPE {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  IMAGE = 'IMAGE',
  URL = 'URL'
}

export type StudioId = string
export type WorldId = string
export type ElementId = string

export type WorldChildRefs = Array<
  [ELEMENT_TYPE.FOLDER | ELEMENT_TYPE.SCENE, ElementId]
>

export type FolderParentRef = [
  ELEMENT_TYPE.WORLD | ELEMENT_TYPE.FOLDER,
  ElementId | null
]

export type FolderChildRefs = Array<
  [ELEMENT_TYPE.FOLDER | ELEMENT_TYPE.SCENE, ElementId]
>

export type SceneParentRef = [
  ELEMENT_TYPE.WORLD | ELEMENT_TYPE.FOLDER,
  ElementId | null
]

export type SceneChildRefs = Array<[ELEMENT_TYPE.EVENT, ElementId]>

export interface RootData {
  children: WorldChildRefs
  copyright?: string
  description?: string
  designer: string
  engine: string
  id: string
  jump: string | null
  schema: string
  studioId: StudioId
  studioTitle: string
  tags: string[]
  title: string
  updated: number
  version: string
  website?: string
}

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
  SAD = 'SAD' // [-1.00, -1.00]
  // min(d,e)
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

export interface CharacterMask {
  active: boolean
  assetId?: string // the location will change, but keep asset ID consistent
  type: CHARACTER_MASK_TYPE
}

// tuple: [uuid, ...]
export type CharacterRef = [string, string | CHARACTER_PRONOUN_TYPES]

export type CharacterRefs = Array<CharacterRef>

export interface CharacterData {
  description?: string
  id: ElementId
  masks: CharacterMask[]
  refs: CharacterRefs
  tags: string[]
  title: string
  updated: number
}

export interface CharacterCollection {
  [characterId: string]: CharacterData
}

export interface ChoiceData {
  id: ElementId
  eventId: ElementId
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
  pathId: ElementId
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
  pathId: ElementId
  set: [ElementId, SET_OPERATOR_TYPE, string]
  tags: string[]
  title: string
  updated: number
  variableId: string
}

export interface EffectCollection {
  [effectId: string]: EffectData
}

export type EventPersona = [ElementId, CHARACTER_MASK_TYPE, string | undefined] // [characterId, mask, reference ID]

export interface EventData {
  choices: ElementId[]
  content: string
  composer?: {
    sceneMapPosX?: number
    sceneMapPosY?: number
  }
  ending: boolean
  id: ElementId
  input?: ElementId // variable ID
  persona?: EventPersona
  sceneId: ElementId
  tags: string[]
  title: string
  type: EVENT_TYPE
  updated: number
}

export interface EventCollection {
  [eventId: string]: EventData
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

export interface InputData {
  eventId: ElementId
  id: ElementId
  tags: string[]
  title: string
  updated: number
  variableId?: ElementId
}

export interface InputCollection {
  [choiceId: string]: InputData
}

export interface JumpData {
  composer?: {
    sceneMapPosX?: number
    sceneMapPosY?: number
  }
  id: ElementId
  path: [ElementId?, ElementId?]
  sceneId?: ElementId
  tags: string[]
  title: string
  updated: number
}

export interface JumpCollection {
  [jumpId: string]: JumpData
}

export interface PathData {
  choiceId?: ElementId
  destinationId: ElementId
  destinationType: ELEMENT_TYPE
  id: ElementId
  inputId?: ElementId
  originId: ElementId
  originType: ELEMENT_TYPE | EVENT_TYPE
  sceneId: ElementId
  tags: string[]
  title: string
  updated: number
}

export interface PathCollection {
  [pathId: string]: PathData
}

export interface SceneData {
  children: SceneChildRefs
  composer?: {
    sceneMapTransformX?: number
    sceneMapTransformY?: number
    sceneMapTransformZoom?: number
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

export interface WorldDataJSON {
  _: RootData
  characters: CharacterCollection
  choices: ChoiceCollection
  conditions: ConditionCollection
  effects: EffectCollection
  events: EventCollection
  folders: FolderCollection
  inputs: InputCollection
  jumps: JumpCollection
  paths: PathCollection
  scenes: SceneCollection
  variables: VariableCollection
}

export enum ENGINE_THEME {
  BOOK = 'BOOK',
  CONSOLE = 'CONSOLE'
}

export enum ENGINE_DEVTOOLS_LIVE_EVENT_TYPE {
  OPEN_EVENT = 'OPEN_EVENT',
  RESET = 'RESET',
  TOGGLE_EXPRESSIONS = 'TOGGLE_EXPRESSIONS',
  TOGGLE_BLOCKED_CHOICES = 'TOGGLE_BLOCKED_CHOICES',
  TOGGLE_XRAY = 'TOGGLE_XRAY',
  GET_ASSET_URL = 'GET_ASSET_URL',
  RETURN_ASSET_URL = 'RETURN_ASSET_URL'
}

export enum ENGINE_DEVTOOLS_LIVE_EVENTS {
  COMPOSER_TO_ENGINE = 'composer:engine:devtools:event',
  ENGINE_TO_COMPOSER = 'engine:composer:devtools:event'
}

export interface EngineDevToolsLiveEvent {
  eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
  eventId?: ElementId
  asset?: {
    id?: string
    url?: string
  }
}

export interface EngineBookmarkData {
  gameId: WorldId
  id: string // or AUTO_ENGINE_BOOKMARK_KEY
  title: string
  event: ElementId | undefined // event
  updated: number
  version: string
}

export interface EngineBookmarkCollection {
  [bookmarkId: ElementId | '___auto___']: EngineBookmarkData
}

export interface EngineChoiceData {
  gameId: WorldId
  id: ElementId
  eventId: ElementId
  title: string
}

export interface EngineChoiceCollection {
  [choiceId: ElementId]: EngineChoiceData
}

export interface EngineConditionData {
  compare: [ElementId, COMPARE_OPERATOR_TYPE, string]
  gameId: WorldId
  id: ElementId
  pathId: ElementId
  variableId: ElementId
}

export interface EngineConditionCollection {
  [conditionId: ElementId]: EngineConditionData
}

export interface EngineEffectData {
  gameId: WorldId
  id: ElementId
  pathId: ElementId
  set: [ElementId, SET_OPERATOR_TYPE, string]
  variableId: ElementId
}

export interface EngineEffectCollection {
  [effectId: ElementId]: EngineEffectData
}

export interface EngineEventStateData {
  gameId: WorldId
  title: string
  type: VARIABLE_TYPE
  value: string
}

export interface EngineEventStateCollection {
  [variableId: ElementId]: EngineEventStateData
}

export type EngineEventLocationData = [ElementId?, ElementId?] // scene, passage

export enum ENGINE_EVENT_TYPE {
  GAME_OVER = 'GAME_OVER',
  CHOICE = 'CHOICE',
  CHOICE_LOOPBACK = 'CHOICE_LOOPBACK',
  INITIAL = 'INITIAL',
  INPUT = 'INPUT',
  INPUT_LOOPBACK = 'INPUT_LOOPBACK',
  RESTART = 'RESTART'
}

export type EngineEventResult = {
  id?: ElementId
  value: string
}

export interface EngineEventData {
  gameId: WorldId
  // TODO: may need to change to tuple with id and type
  id: ElementId // or INITIAL_ENGINE_EVENT_ORIGIN_KEY
  destination: ElementId // passage ID
  next?: ElementId // event ID
  origin?: ElementId // passage ID or INITIAL_ENGINE_EVENT_ORIGIN_KEY
  prev?: ElementId // event ID
  result?: EngineEventResult
  state: EngineEventStateCollection
  type: ENGINE_EVENT_TYPE
  updated: number
  version: string
}

export interface EngineEventCollection {
  [eventId: ElementId | '___initial___']: EngineEventData
}

export interface EngineGameMeta {
  studioId: StudioId
  gameId: WorldId
}

export interface EngineGameData {
  children: WorldChildRefs
  copyright?: string
  description?: string
  designer: string
  engine: string
  id: WorldId
  jump: ElementId
  schema: string
  studioId: StudioId
  studioTitle: string
  tags?: []
  title: string
  updated: number
  version: string
  website?: string
}

export interface EngineGameCollection {
  [gameId: WorldId]: EngineGameData
}

export interface EngineInputData {
  gameId: WorldId
  id: ElementId
  eventId: ElementId
  variableId?: ElementId
}

export interface EngineInputCollection {
  [inputId: ElementId]: EngineInputData
}

export interface EngineJumpData {
  gameId: WorldId
  id: ElementId
  path: [ElementId?, ElementId?]
  sceneId?: ElementId
}

export interface EngineJumpCollection {
  [jumpId: ElementId]: EngineJumpData
}

export interface EnginePassageData {
  choices: ElementId[]
  content: string
  gameId: WorldId
  gameOver: boolean
  id: ElementId
  input?: ElementId
  sceneId: ElementId
  type: EVENT_TYPE
}

export interface EnginePassageCollection {
  [eventId: ElementId]: EnginePassageData
}

export interface EngineRouteData {
  choiceId?: ElementId
  destinationId: ElementId
  destinationType: ELEMENT_TYPE
  gameId: WorldId
  id: ElementId
  inputId?: ElementId
  originId: ElementId
  originType: ELEMENT_TYPE | EVENT_TYPE
  sceneId: ElementId
}

export interface EngineRouteCollection {
  [pathId: string]: EngineRouteData
}

export interface EngineSceneData {
  children: SceneChildRefs
  gameId: WorldId
  id: ElementId
  jumps: ElementId[]
}

export interface EngineSceneCollection {
  [sceneId: ElementId]: EngineSceneData
}

export interface EngineSettingsData {
  gameId: WorldId
  id: string // or DEFAULT_ENGINE_SETTINGS_KEY
  theme: ENGINE_THEME
}

export interface EngineSettingsCollection {
  [settingsId: ElementId]: EngineSettingsData
}

export interface EngineVariableData {
  gameId: WorldId
  id: ElementId
  initialValue: string
  title: string
  type: VARIABLE_TYPE
}

export interface EngineVariableCollection {
  [variableId: ElementId]: EngineVariableData
}

export interface ESGEngineCollectionData {
  _: EngineGameData
  choices: EngineChoiceCollection
  conditions: EngineConditionCollection
  effects: EngineEffectCollection
  games: EngineGameCollection
  inputs: EngineInputCollection
  jumps: EngineJumpCollection
  passages: EnginePassageCollection
  paths: EngineRouteCollection
  scenes: EngineSceneCollection
  variables: EngineVariableCollection
}
