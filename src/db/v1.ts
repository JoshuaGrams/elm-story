import Dexie from 'dexie'

import { DB_NAME } from '.'

export default (database: Dexie) => {
  if (database.name === DB_NAME.APP) {
    database.version(1).stores({
      studios: '&id,title,*tags,updated',
      editors: '&id,updated'
    })
  }

  // UID is added to base library database name
  if (database.name.includes(DB_NAME.LIBRARY)) {
    database.version(1).stores({
      games: '&id,title,*tags,updated,template,director,version,engine',
      jumps: '&id,gameId,sceneId,title,*tags,updated,*route',
      chapters: '&id,gameId,title,*tags,updated',
      scenes: '&id,gameId,chapterId,title,*tags,updated',
      routes:
        '&id,gameId,sceneId,title,originId,choiceId,originType,destinationId,destinationType,*tags,updated',
      conditions: '&id,gameId,routeId,variableId,title,*tags,updated',
      effects: '&id,gameId,routeId,variableId,title,*tags,updated',
      passages: '&id,gameId,sceneId,title,*tags,updated',
      choices: '&id,gameId,passageId,title,*tags,updated',
      variables: '&id,gameId,title,type,*tags,updated'
    })
  }
}
