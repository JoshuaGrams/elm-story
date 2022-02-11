// ES 0.7
// - elmstorygames / feedback#128
import Dexie from 'dexie'

import { LIBRARY_TABLE } from '.'
import { ElementId, ELEMENT_TYPE, Event, Jump, Scene } from '../data/types'

export default (database: Dexie) => {
  database
    .version(10)
    .stores({
      events:
        '&id,*characters,ending,*images,worldId,*persona,sceneId,title,*tags,updated'
    })
    .upgrade(async (tx) => {
      const eventsTable = tx.table(LIBRARY_TABLE.EVENTS),
        jumpsTable = tx.table(LIBRARY_TABLE.JUMPS),
        scenesTable = tx.table(LIBRARY_TABLE.SCENES)

      const jumps: Jump[] = await jumpsTable.toArray(),
        jumpsByScene: { [sceneId: ElementId]: ElementId[] } = {}

      jumps.map((jump) => {
        if (!jump.id || !jump.sceneId) return

        if (!jumpsByScene[jump.sceneId]) {
          jumpsByScene[jump.sceneId] = []
        }

        jumpsByScene[jump.sceneId].push(jump.id)
      })

      await Promise.all([
        scenesTable.toCollection().modify((scene: Scene) => {
          if (scene.id && jumpsByScene[scene.id]) {
            jumpsByScene[scene.id].map((jumpId) =>
              scene.children.push([ELEMENT_TYPE.JUMP, jumpId])
            )
          }

          // @ts-ignore 0.6 data
          delete scene.jumps
        }),
        eventsTable.toCollection().modify((event: Event) => {
          event.characters = []
          event.images = []
        }),
        tx
          .table(LIBRARY_TABLE.WORLDS)
          .toCollection()
          .modify((world) => {
            world.engine = '0.7.0'
          })
      ])
    })
}
