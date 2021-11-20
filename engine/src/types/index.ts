export enum COMPONENT_TYPE {
  STUDIO = 'STUDIO',
  GAME = 'GAME',
  JUMP = 'JUMP',
  FOLDER = 'FOLDER',
  SCENE = 'SCENE',
  ROUTE = 'ROUTE',
  PASSAGE = 'PASSAGE',
  CHOICE = 'CHOICE',
  INPUT = 'INPUT',
  CONDITION = 'CONDITION',
  EFFECT = 'EFFECT',
  VARIABLE = 'VARIABLE'
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

export enum PASSAGE_TYPE {
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
export type GameId = string
export type ComponentId = string

export type GameChildRefs = Array<
  [COMPONENT_TYPE.FOLDER | COMPONENT_TYPE.SCENE, ComponentId]
>

export type FolderParentRef = [
  COMPONENT_TYPE.GAME | COMPONENT_TYPE.FOLDER,
  ComponentId | null
]

export type FolderChildRefs = Array<
  [COMPONENT_TYPE.FOLDER | COMPONENT_TYPE.SCENE, ComponentId]
>

export type SceneParentRef = [
  COMPONENT_TYPE.GAME | COMPONENT_TYPE.FOLDER,
  ComponentId | null
]

export type SceneChildRefs = Array<[COMPONENT_TYPE.PASSAGE, ComponentId]>

export interface RootData {
  children: GameChildRefs
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

export enum CHARACTER_MOOD_TYPE {
  ANNOYED = 'ANNOYED',
  BORED = 'BORED',
  CALM = 'CALM', // default
  CAREFREE = 'CAREFREE',
  CHEERFUL = 'CHEERFUL',
  EXCITED = 'EXCITED',
  GLOOMY = 'GLOOMY',
  HAPPY = 'HAPPY',
  IRRITATED = 'IRRITATED',
  LIVELY = 'LIVELY',
  NERVOUS = 'NERVOUS',
  RELAXED = 'RELAXED',
  SAD = 'SAD',
  SERENE = 'SERENE',
  TENSE = 'TENSE',
  WEARY = 'WEARY'
}

export type CharacterRefs = Array<[string, string]> // 0 = uuid, 1 = nick

export interface CharacterPortrait {
  assetId: string // the location will change, but keep asset ID consistent
  mood: CHARACTER_MOOD_TYPE
}

export interface CharacterData {
  defaultPortrait: CharacterPortrait
  description: string
  id: ComponentId
  portraits: CharacterPortrait[]
  refs: CharacterRefs
  tags: string[]
  title: string
  updated: number
}

export interface CharacterCollection {
  [characterId: string]: CharacterData
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
  gameOver: boolean
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
  characters: CharacterCollection
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

export enum ENGINE_THEME {
  BOOK = 'BOOK',
  CONSOLE = 'CONSOLE'
}

export enum ENGINE_DEVTOOLS_EVENT_TYPE {
  OPEN_PASSAGE = 'OPEN_PASSAGE',
  RESET = 'RESET',
  TOGGLE_EXPRESSIONS = 'TOGGLE_EXPRESSIONS',
  TOGGLE_BLOCKED_CHOICES = 'TOGGLE_BLOCKED_CHOICES',
  TOGGLE_XRAY = 'TOGGLE_XRAY'
}

export enum ENGINE_DEVTOOLS_EVENTS {
  EDITOR_TO_ENGINE = 'editor:engine:devtools:event',
  ENGINE_TO_EDITOR = 'engine:editor:devtools:event'
}

export interface EngineDevToolsEvent {
  eventType: ENGINE_DEVTOOLS_EVENT_TYPE
  passageId?: ComponentId
}

export interface EngineBookmarkData {
  gameId: GameId
  event: ComponentId | undefined // event
  id: string // or AUTO_ENGINE_BOOKMARK_KEY
  title: string
  updated: number
  version: string
}

export interface EngineBookmarkCollection {
  [bookmarkId: ComponentId | '___auto___']: EngineBookmarkData
}

export interface EngineCharacterData {
  gameId: GameId
  id: string
  defaultPortrait: CharacterPortrait
  portraits: CharacterPortrait[]
  refs: CharacterRefs
  title: string
}

export interface EngineCharacterCollection {
  [characterId: ComponentId]: EngineCharacterData
}

export interface EngineChoiceData {
  gameId: GameId
  id: ComponentId
  passageId: ComponentId
  title: string
}

export interface EngineChoiceCollection {
  [choiceId: ComponentId]: EngineChoiceData
}

export interface EngineConditionData {
  compare: [ComponentId, COMPARE_OPERATOR_TYPE, string]
  gameId: GameId
  id: ComponentId
  routeId: ComponentId
  variableId: ComponentId
}

export interface EngineConditionCollection {
  [conditionId: ComponentId]: EngineConditionData
}

export interface EngineEffectData {
  gameId: GameId
  id: ComponentId
  routeId: ComponentId
  set: [ComponentId, SET_OPERATOR_TYPE, string]
  variableId: ComponentId
}

export interface EngineEffectCollection {
  [effectId: ComponentId]: EngineEffectData
}

export interface EngineEventStateData {
  gameId: GameId
  title: string
  type: VARIABLE_TYPE
  value: string
}

export interface EngineEventStateCollection {
  [variableId: ComponentId]: EngineEventStateData
}

export type EngineEventLocationData = [ComponentId?, ComponentId?] // scene, passage

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
  id?: ComponentId
  value: string
}

export interface EngineEventData {
  gameId: GameId
  // TODO: may need to change to tuple with id and type
  id: ComponentId // or INITIAL_ENGINE_EVENT_ORIGIN_KEY
  destination: ComponentId // passage ID
  next?: ComponentId // event ID
  origin?: ComponentId // passage ID or INITIAL_ENGINE_EVENT_ORIGIN_KEY
  prev?: ComponentId // event ID
  result?: EngineEventResult
  state: EngineEventStateCollection
  type: ENGINE_EVENT_TYPE
  updated: number
  version: string
}

export interface EngineEventCollection {
  [eventId: ComponentId | '___initial___']: EngineEventData
}

export interface EngineGameMeta {
  studioId: StudioId
  gameId: GameId
}

export interface EngineGameData {
  children: GameChildRefs
  copyright?: string
  description?: string
  designer: string
  engine: string
  id: GameId
  jump: ComponentId
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
  [gameId: GameId]: EngineGameData
}

export interface EngineInputData {
  gameId: GameId
  id: ComponentId
  passageId: ComponentId
  variableId?: ComponentId
}

export interface EngineInputCollection {
  [inputId: ComponentId]: EngineInputData
}

export interface EngineJumpData {
  gameId: GameId
  id: ComponentId
  route: [ComponentId?, ComponentId?]
  sceneId?: ComponentId
}

export interface EngineJumpCollection {
  [jumpId: ComponentId]: EngineJumpData
}

export interface EnginePassageData {
  choices: ComponentId[]
  content: string
  gameId: GameId
  gameOver: boolean
  id: ComponentId
  input?: ComponentId
  sceneId: ComponentId
  type: PASSAGE_TYPE
}

export interface EnginePassageCollection {
  [passageId: ComponentId]: EnginePassageData
}

export interface EngineRouteData {
  choiceId?: ComponentId
  destinationId: ComponentId
  destinationType: COMPONENT_TYPE
  gameId: GameId
  id: ComponentId
  inputId?: ComponentId
  originId: ComponentId
  originType: COMPONENT_TYPE | PASSAGE_TYPE
  sceneId: ComponentId
}

export interface EngineRouteCollection {
  [routeId: string]: EngineRouteData
}

export interface EngineSceneData {
  children: SceneChildRefs
  gameId: GameId
  id: ComponentId
  jumps: ComponentId[]
}

export interface EngineSceneCollection {
  [sceneId: ComponentId]: EngineSceneData
}

export interface EngineSettingsData {
  gameId: GameId
  id: string // or DEFAULT_ENGINE_SETTINGS_KEY
  theme: ENGINE_THEME
}

export interface EngineSettingsCollection {
  [settingsId: ComponentId]: EngineSettingsData
}

export interface EngineVariableData {
  gameId: GameId
  id: ComponentId
  initialValue: string
  title: string
  type: VARIABLE_TYPE
}

export interface EngineVariableCollection {
  [variableId: ComponentId]: EngineVariableData
}

export interface ESGEngineCollectionData {
  _: EngineGameData
  characters: EngineCharacterCollection
  choices: EngineChoiceCollection
  conditions: EngineConditionCollection
  effects: EngineEffectCollection
  games: EngineGameCollection
  inputs: EngineInputCollection
  jumps: EngineJumpCollection
  passages: EnginePassageCollection
  routes: EngineRouteCollection
  scenes: EngineSceneCollection
  variables: EngineVariableCollection
}
