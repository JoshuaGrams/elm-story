import Dexie from 'dexie'
import {
  ProfileDocument,
  GameDocument,
  ChapterDocument,
  SceneDocument,
  PassageDocument,
  ActionDocument,
  ConditionDocument,
  EffectDocument,
  VariableDocument
} from './types'

const DATABASE = {
  APP: 'esg-database'
}

export class AppDatabase extends Dexie {
  public profiles: Dexie.Table<ProfileDocument, string>

  public constructor() {
    super(DATABASE.APP)

    this.version(1).stores({
      profiles: '&id, name, selected'
    })

    this.profiles = this.table('profiles')
  }
}

export class GameDatabase extends Dexie {
  public games: Dexie.Table<GameDocument, string>
  public chapters: Dexie.Table<ChapterDocument, string>
  public scenes: Dexie.Table<SceneDocument, string>
  public passages: Dexie.Table<PassageDocument, string>
  public actions: Dexie.Table<ActionDocument, string>
  public conditions: Dexie.Table<ConditionDocument, string>
  public effects: Dexie.Table<EffectDocument, string>
  public variables: Dexie.Table<VariableDocument, string>

  public constructor(profileId: string) {
    super(`esg-library-${profileId}`)

    this.version(1).stores({
      games: '&id',
      chapters: '&id',
      scenes: '&id',
      passages: '&id',
      actions: '&id',
      conditions: '&id',
      effects: '&id',
      variables: '&id'
    })

    this.games = this.table('games')
    this.chapters = this.table('chapters')
    this.scenes = this.table('scenes')
    this.passages = this.table('passages')
    this.actions = this.table('actions')
    this.conditions = this.table('conditions')
    this.effects = this.table('effects')
    this.variables = this.table('variables')
  }
}
