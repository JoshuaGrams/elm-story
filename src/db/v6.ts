// 0.5.0
// #325
// #339

import Dexie from 'dexie'

import { Passage } from '../data/types'
import { DB_NAME, LIBRARY_TABLE } from '.'

export default (database: Dexie) => {
  // UID is added to base library database name
  if (database.name.includes(DB_NAME.LIBRARY)) {
    database
      .version(6)
      .stores({
        bookmarks: '&id,gameId,event,updated',
        events:
          '&id,gameId,destination,origin,prev,next,type,updated,[gameId+updated]',
        passages: '&id,gameOver,gameId,sceneId,title,*tags,updated',
        settings: '&id,gameId'
      })
      .upgrade(async (tx) => {
        try {
          const passagesTable = tx.table<Passage, string>(
            LIBRARY_TABLE.PASSAGES
          )

          await passagesTable.toCollection().modify((passage) => {
            passage.gameOver = false
          })
        } catch (error) {}
      })
  }
}
