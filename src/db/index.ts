import Dexie from 'dexie'

const DATABASE = {
  APP: 'esg-database'
}

export interface Profile {
  id: string
  name: string
  selected: number
}

export class AppDatabase extends Dexie {
  public profiles: Dexie.Table<Profile, string>

  public constructor() {
    super(DATABASE.APP)

    this.version(1).stores({
      profiles: '&id, name, selected'
    })

    this.profiles = this.table('profiles')
  }
}
