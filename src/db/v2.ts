import Dexie from 'dexie'

import { APP_TABLE, DB_NAME, LIBRARY_TABLE } from '.'

export default (database: Dexie) => {
  if (database.name.includes(DB_NAME.APP)) {
    database.version(2).upgrade(async (tx) => {
      await tx
        .table(APP_TABLE.STUDIOS)
        .toCollection()
        .modify((studio) => {
          if (studio.games) {
            studio.worlds = [...studio.games]
            delete studio.games
          }
        })
    })
  }

  // UID is added to base library database name
  if (database.name.includes(DB_NAME.LIBRARY)) {
    database
      .version(2)
      .stores({
        games: '&id,title,*tags,updated,template,designer,version,engine',
        variables: '&id,gameId,title,type,*tags,updated'
      })
      .upgrade((tx) => {
        tx.table('games')
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
