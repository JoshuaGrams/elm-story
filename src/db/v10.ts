// #429
import Dexie from 'dexie'

import { LIBRARY_TABLE } from '.'
import { ELEMENT_TYPE, Jump, Scene } from '../data/types'

export default (database: Dexie) => {
  database.version(10).upgrade(async (tx) => {
    const scenesTable = tx.table(LIBRARY_TABLE.SCENES),
      jumpsTable = tx.table(LIBRARY_TABLE.JUMPS)

    const jumps = await jumpsTable.toArray()

    scenesTable.toCollection().modify((scene: Scene) => {
      jumps.map((jump: Jump) => {
        if (jump.id && scene.id === jump.sceneId) {
          scene.children.push([ELEMENT_TYPE.JUMP, jump.id])
        }
      })

      delete scene.jumps
    })
  })
}
