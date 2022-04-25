// ES 0.7.1
import Dexie from 'dexie'

import { LIBRARY_TABLE } from '.'

export default (database: Dexie) => {
  database.version(10).upgrade(async (tx) => {
    await tx
      .table(LIBRARY_TABLE.WORLDS)
      .toCollection()
      .modify((world) => {
        world.engine = '0.7.1'
      })
  })
}
