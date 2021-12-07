// remove passages and games tables
import Dexie from 'dexie'

import { DB_NAME } from '.'

export default (database: Dexie) => {
  database.version(9).stores({
    games: null,
    passages: null,
    routes: null
  })
}
