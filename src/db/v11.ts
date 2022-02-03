// ES 0.7
import Dexie from 'dexie'

import { LIBRARY_TABLE } from '.'
import { Event } from '../data/types'

export default (database: Dexie) => {
  database
    .version(11)
    .stores({
      events:
        '&id,*characters,ending,worldId,*persona,sceneId,title,*tags,updated'
    })
    .upgrade(async (tx) => {
      const eventsTable = tx.table(LIBRARY_TABLE.EVENTS)

      eventsTable.toCollection().modify((event: Event) => {
        event.characters = []
        event.images = [] // when deleting from content or event; asset manager
      })
    })
}
