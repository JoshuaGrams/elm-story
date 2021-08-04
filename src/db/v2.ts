import Dexie from 'dexie'

import { DB_NAME, LIBRARY_TABLE } from '.'

export default (database: Dexie) => {
  // UID is added to base library database name
  if (database.name.includes(DB_NAME.LIBRARY)) {
    database
      .version(2)
      .stores({
        games: '&id,title,*tags,updated,template,designer,version,engine',
        variables: '&id,gameId,title,type,*tags,updated'
      })
      .upgrade((tx) => {
        tx.table(LIBRARY_TABLE.GAMES)
          .toCollection()
          .modify((game) => {
            game.designer = game.director
            delete game.director
          })

        tx.table(LIBRARY_TABLE.VARIABLES)
          .toCollection()
          .modify((variable) => {
            variable.initialValue = variable.defaultValue
            delete variable.defaultValue
          })
      })
  }
}
