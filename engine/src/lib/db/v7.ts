// #373
import Dexie from 'dexie'

import {
  EngineBookmarkData,
  EngineLiveEventData,
  EngineWorldData
} from '../../types'
import { LIBRARY_TABLE } from '.'

// Must match editor version
export default (database: Dexie) => {
  database
    .version(7)
    .stores({
      bookmarks: '&id,gameId,event,updated,version',
      events:
        '&id,gameId,destination,origin,prev,next,type,updated,[gameId+updated],version'
    })
    .upgrade(async (tx) => {
      try {
        const bookmarksTable = tx.table<EngineBookmarkData, string>(
            LIBRARY_TABLE.BOOKMARKS
          ),
          gamesTable = tx.table<EngineWorldData, string>('games'),
          eventsTable = tx.table<EngineLiveEventData, string>(
            LIBRARY_TABLE.EVENTS
          )

        const games = await gamesTable.toCollection().toArray()

        await Promise.all([
          bookmarksTable.toCollection().modify((bookmark) => {
            // @ts-ignore
            const foundGame = games.find((game) => game.id === bookmark.gameId)

            bookmark.version = foundGame?.version || '0.0.0'
          }),

          eventsTable.toCollection().modify((event) => {
            // @ts-ignore
            const foundGame = games.find((game) => game.id === event.gameId)

            event.version = foundGame?.version || '0.0.0'
          })
        ])
      } catch (error) {
        throw error
      }
    })
}
