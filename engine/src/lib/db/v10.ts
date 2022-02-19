// #429
import Dexie from 'dexie'

import {
  ELEMENT_TYPE,
  SceneData,
  JumpData,
  ElementId,
  EventData,
  EngineSettingsData,
  ENGINE_FONT,
  ENGINE_MOTION,
  ENGINE_SIZE
} from '../../types'
import { LIBRARY_TABLE } from '.'

// Must match composer version
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
        scenesTable = tx.table(LIBRARY_TABLE.SCENES),
        settingsTable = tx.table(LIBRARY_TABLE.SETTINGS)

      const jumps: JumpData[] = await jumpsTable.toArray(),
        jumpsByScene: { [sceneId: ElementId]: ElementId[] } = {}

      jumps.map((jump) => {
        if (!jump.id || !jump.sceneId) return

        if (!jumpsByScene[jump.sceneId]) {
          jumpsByScene[jump.sceneId] = []
        }

        jumpsByScene[jump.sceneId].push(jump.id)
      })

      await Promise.all([
        scenesTable.toCollection().modify((scene: SceneData) => {
          if (scene.id && jumpsByScene[scene.id]) {
            jumpsByScene[scene.id].map((jumpId) =>
              scene.children.push([ELEMENT_TYPE.JUMP, jumpId])
            )
          }

          // @ts-ignore 0.6 data
          delete scene.jumps
        }),
        eventsTable.toCollection().modify((event: EventData) => {
          event.characters = []
          event.images = []
        }),
        settingsTable.toCollection().modify((setting: EngineSettingsData) => {
          setting.font = ENGINE_FONT.SANS
          setting.motion = ENGINE_MOTION.FULL
          setting.size = ENGINE_SIZE.DEFAULT
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
