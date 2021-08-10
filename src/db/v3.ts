// #220

import Dexie from 'dexie'

import {
  COMPONENT_TYPE,
  ComponentId,
  FolderChildRefs,
  SceneChildRefs,
  GameChildRefs
} from '../data/types'
import { DB_NAME, LIBRARY_TABLE } from '.'

export default (database: Dexie) => {
  // UID is added to base library database name
  if (database.name.includes(DB_NAME.LIBRARY)) {
    database
      .version(3)
      .stores({
        games:
          '&id,children,title,*tags,updated,template,designer,version,engine',
        folders: '&id,children,gameId,parent,title,*tags,updated',
        scenes: '&id,children,gameId,parent,title,*tags,updated'
      })
      .upgrade(async (tx) => {
        try {
          const gamesTable = tx.table(LIBRARY_TABLE.GAMES)

          gamesTable.toCollection().modify((game) => {
            const chapterIds: ComponentId[] = game.chapters,
              gameChildren: GameChildRefs = []

            chapterIds.map((chapterId) =>
              gameChildren.push([COMPONENT_TYPE.FOLDER, chapterId])
            )

            game.children = gameChildren
            delete game.chapters
          })

          const folderTable = tx.table(LIBRARY_TABLE.FOLDERS)

          await folderTable.bulkAdd(
            await tx.table(LIBRARY_TABLE.CHAPTERS).toArray()
          )

          await folderTable.toCollection().modify((folder) => {
            folder.parent = [COMPONENT_TYPE.GAME, null]

            const sceneIds: ComponentId[] = folder.scenes,
              folderChildren: FolderChildRefs = []

            sceneIds.map((sceneId) =>
              folderChildren.push([COMPONENT_TYPE.SCENE, sceneId])
            )

            folder.children = folderChildren
            delete folder.scenes
          })

          const jumpsTable = tx.table(LIBRARY_TABLE.JUMPS)

          await jumpsTable.toCollection().modify((jump) => jump.route.shift())

          const sceneTable = tx.table(LIBRARY_TABLE.SCENES)

          await sceneTable.toCollection().modify((scene) => {
            scene.parent = [COMPONENT_TYPE.FOLDER, scene.chapterId]
            delete scene.chapterId

            const passageIds: ComponentId[] = scene.passages,
              sceneChildren: SceneChildRefs = []

            passageIds.map((passageId) =>
              sceneChildren.push([COMPONENT_TYPE.PASSAGE, passageId])
            )

            scene.children = sceneChildren
            delete scene.passages
          })
        } catch (error) {
          throw error
        }
      })
  }
}
