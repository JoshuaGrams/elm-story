// #429
import Dexie from 'dexie'

import { LIBRARY_TABLE } from '.'
import { ELEMENT_TYPE } from '../data/types'

// Must match editor version
export default (database: Dexie) => {
  database
    .version(8)
    .stores({
      bookmarks: '&id,worldId,event,updated,version',
      characters: '&id,worldId,title,*tags,updated',
      conditions: '&id,worldId,routeId,variableId,title,*tags,updated',
      effects: '&id,worldId,routeId,variableId,title,*tags,updated',
      events: '&id,ending,worldId,*persona,sceneId,title,*tags,updated',
      folders: '&id,children,worldId,parent,title,*tags,updated',
      inputs: '&id,worldId,eventId,variableId,title,*tags,updated',
      jumps: '&id,worldId,sceneId,title,*tags,updated,*route',
      live_events:
        '&id,worldId,destination,origin,prev,next,type,updated,[gameId+updated],version',
      routes:
        '&id,worldId,sceneId,title,originId,choiceId,inputId,originType,destinationId,destinationType,*tags,updated',
      scenes: '&id,children,worldId,parent,title,*tags,updated',
      settings: '&id,worldId',
      variables: '&id,worldId,title,type,*tags,updated',
      worlds:
        '&id,children,title,*tags,updated,template,designer,version,engine'
    })
    .upgrade(async (tx) => {
      const worldsTable = tx.table(LIBRARY_TABLE.WORLDS),
        liveEventsTable = tx.table(LIBRARY_TABLE.LIVE_EVENTS),
        eventsTable = tx.table(LIBRARY_TABLE.EVENTS)

      await Promise.all([
        worldsTable.bulkAdd(await tx.table('games').toArray()),
        liveEventsTable.bulkAdd(await tx.table('events').toArray()),
        eventsTable.clear()
      ])

      await eventsTable.bulkAdd(await tx.table('passages').toArray())

      await Promise.all([
        tx
          .table(LIBRARY_TABLE.BOOKMARKS)
          .toCollection()
          .modify((bookmark) => {
            bookmark.worldId = bookmark.gameId
            delete bookmark.gameId
          }),
        tx
          .table(LIBRARY_TABLE.CHOICES)
          .toCollection()
          .modify((choice) => {
            choice.worldId = choice.gameId
            delete choice.gameId

            choice.eventId = choice.passageId
            delete choice.passageId
          }),
        tx
          .table(LIBRARY_TABLE.CONDITIONS)
          .toCollection()
          .modify((condition) => {
            condition.worldId = condition.gameId
            delete condition.gameId
          }),
        tx
          .table(LIBRARY_TABLE.EFFECTS)
          .toCollection()
          .modify((effect) => {
            effect.worldId = effect.gameId
            delete effect.gameId
          }),
        tx
          .table(LIBRARY_TABLE.EVENTS)
          .toCollection()
          .modify((event) => {
            event.ending = event.gameOver
            delete event.gameOver

            event.worldId = event.gameId
            delete event.gameId
          }),
        tx
          .table(LIBRARY_TABLE.FOLDERS)
          .toCollection()
          .modify((folder) => {
            if (folder.parent[0] === ELEMENT_TYPE.GAME) {
              folder.parent = [ELEMENT_TYPE.WORLD, null]
            }

            folder.worldId = folder.gameId
            delete folder.gameId
          }),
        tx
          .table(LIBRARY_TABLE.INPUTS)
          .toCollection()
          .modify((input) => {
            input.worldId = input.gameId
            delete input.gameId

            input.eventId = input.passageId
            delete input.passageId
          }),
        tx
          .table(LIBRARY_TABLE.JUMPS)
          .toCollection()
          .modify((jump) => {
            jump.worldId = jump.gameId
            delete jump.gameId
          }),
        tx
          .table(LIBRARY_TABLE.ROUTES)
          .toCollection()
          .modify((route) => {
            if (route.destinationType === ELEMENT_TYPE.PASSAGE) {
              route.destinationType = ELEMENT_TYPE.EVENT
            }

            route.worldId = route.gameId
            delete route.gameId
          }),
        tx
          .table(LIBRARY_TABLE.SCENES)
          .toCollection()
          .modify((scene) => {
            const newChildren: [ELEMENT_TYPE, string][] = []

            scene.children.map((child: [ELEMENT_TYPE, string]) => {
              if (child[0] === ELEMENT_TYPE.PASSAGE) {
                newChildren.push([ELEMENT_TYPE.EVENT, child[1]])
              } else {
                newChildren.push(child)
              }
            })

            scene.children = newChildren

            scene.worldId = scene.gameId
            delete scene.gameId
          }),
        tx
          .table(LIBRARY_TABLE.SETTINGS)
          .toCollection()
          .modify((setting) => {
            setting.worldId = setting.gameId
            delete setting.gameId
          }),
        tx
          .table(LIBRARY_TABLE.VARIABLES)
          .toCollection()
          .modify((variable) => {
            variable.worldId = variable.gameId
            delete variable.gameId
          }),
        tx
          .table(LIBRARY_TABLE.WORLDS)
          .toCollection()
          .modify((world) => {
            world.engine = '0.6.0'
          })
      ])
    })
}
