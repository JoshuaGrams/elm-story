// #373
import Dexie from 'dexie'

import { EngineEventData, EngineGameData } from '../../types/0.5.1'
import { LIBRARY_TABLE } from '.'

// Must match editor version
export default (database: Dexie) => {
  database
    .version(7)
    .stores({
      events:
        '&id,gameId,destination,origin,prev,next,type,updated,[gameId+updated],version'
    })
    .upgrade(async (tx) => {
      try {
        const gamesTable = tx.table<EngineGameData, string>(
            LIBRARY_TABLE.GAMES
          ),
          eventsTable = tx.table<EngineEventData, string>(LIBRARY_TABLE.EVENTS)

        await eventsTable.toCollection().modify(async (event) => {
          const foundGame = await gamesTable.get(event.gameId)

          if (!event.version) event.version = foundGame?.version || '0.0.0'
        })
      } catch (error) {
        throw error
      }
    })
}
