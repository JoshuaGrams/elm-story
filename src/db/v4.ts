// #220

import Dexie from 'dexie'

import { DB_NAME } from '.'

export default (database: Dexie) => {
  // UID is added to base library database name
  if (database.name.includes(DB_NAME.LIBRARY)) {
    database.version(4).stores({
      chapters: null
    })
  }
}
