// #325

import Dexie from 'dexie'

import { Passage } from '../data/types'
import { DB_NAME, LIBRARY_TABLE } from '.'

export default (database: Dexie) => {
  // UID is added to base library database name
  if (database.name.includes(DB_NAME.LIBRARY)) {
    database
      .version(6)
      .stores({
        passages: '&id,gameEnd,gameId,sceneId,title,*tags,updated'
      })
      .upgrade(async (tx) => {
        try {
          const passagesTable = tx.table<Passage, string>(
            LIBRARY_TABLE.PASSAGES
          )

          await passagesTable.toCollection().modify((passage) => {
            passage.gameEnd = false
          })
        } catch (error) {}
      })
  }
}