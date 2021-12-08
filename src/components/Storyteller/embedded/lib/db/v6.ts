// #373
import Dexie from 'dexie'

// Must match editor version
export default (database: Dexie) => {
  database.version(6).stores({
    bookmarks: '&id,gameId,event,updated',
    choices: '&id,gameId,passageId',
    conditions: '&id,gameId,routeId,variableId',
    effects: '&id,gameId,routeId,variableId',
    events:
      '&id,gameId,destination,origin,prev,next,type,updated,[gameId+updated]',
    games: '&id,title,*tags,updated,template,designer,version,engine',
    inputs: '&id,gameId,passageId,variableId',
    jumps: '&id,gameId,sceneId',
    passages: '&id,gameId,gameOver,sceneId',
    routes:
      '&id,gameId,sceneId,originId,choiceId,inputId,originType,destinationId,destinationType',
    scenes: '&id,gameId,children',
    settings: '&id,gameId',
    variables: '&id,gameId,type'
  })
}
