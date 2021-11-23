// #429
import Dexie from 'dexie'

// Must match editor version
export default (database: Dexie) => {
  database.version(8).stores({
    characters: '&id,gameId,title,*tags,updated',
    passages: '&id,gameOver,gameId,*persona,sceneId,title,*tags,updated'
  })
}
