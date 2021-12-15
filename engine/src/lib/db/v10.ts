// #429
import Dexie from 'dexie'

import { ELEMENT_TYPE, SceneData, JumpData } from '../../types'
import { LIBRARY_TABLE } from '.'

// Must match composer version
export default (database: Dexie) => {
  database.version(10).upgrade(async (tx) => {
    const scenesTable = tx.table(LIBRARY_TABLE.SCENES),
      jumpsTable = tx.table(LIBRARY_TABLE.JUMPS)

    const jumps = await jumpsTable.toArray()

    scenesTable.toCollection().modify((scene: SceneData) => {
      jumps.map((jump: JumpData) => {
        if (jump.id && scene.id === jump.sceneId) {
          scene.children.push([ELEMENT_TYPE.JUMP, jump.id])
        }
      })
    })
  })
}
