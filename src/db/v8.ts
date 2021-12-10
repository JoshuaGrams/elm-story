// #429
import Dexie from 'dexie'

import { LIBRARY_TABLE } from '.'
import { ELEMENT_TYPE, PATH_CONDITIONS_TYPE } from '../data/types'

// Must match editor version
export default (database: Dexie) => {
  database
    .version(8)
    .stores({
      bookmarks: '&id,worldId,liveEventId,updated,version',
      characters: '&id,worldId,title,*tags,updated',
      choices: '&id,worldId,eventId,title,*tags,updated',
      conditions: '&id,worldId,pathId,variableId,title,*tags,updated',
      effects: '&id,worldId,pathId,variableId,title,*tags,updated',
      events: '&id,ending,worldId,*persona,sceneId,title,*tags,updated',
      folders: '&id,children,worldId,parent,title,*tags,updated',
      inputs: '&id,worldId,eventId,variableId,title,*tags,updated',
      jumps: '&id,worldId,sceneId,title,*tags,updated,*path',
      live_events:
        '&id,worldId,destination,origin,prev,next,type,updated,[worldId+updated],version',
      paths:
        '&id,worldId,sceneId,title,originId,choiceId,conditionsType,inputId,originType,destinationId,destinationType,*tags,updated',
      scenes: '&id,children,worldId,parent,title,*tags,updated',
      settings: '&id,worldId',
      variables: '&id,worldId,title,type,*tags,updated',
      worlds:
        '&id,children,title,*tags,updated,template,designer,version,engine'
    })
    .upgrade(async (tx) => {
      const worldsTable = tx.table(LIBRARY_TABLE.WORLDS),
        pathsTable = tx.table(LIBRARY_TABLE.PATHS),
        liveEventsTable = tx.table(LIBRARY_TABLE.LIVE_EVENTS),
        eventsTable = tx.table(LIBRARY_TABLE.EVENTS)

      await Promise.all([
        worldsTable.bulkAdd(await tx.table('games').toArray()),
        pathsTable.bulkAdd(await tx.table('routes').toArray()),
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

            condition.pathId = condition.pathId
            delete condition.pathId
          }),
        tx
          .table(LIBRARY_TABLE.EFFECTS)
          .toCollection()
          .modify((effect) => {
            effect.worldId = effect.gameId
            delete effect.gameId

            effect.pathId = effect.routeId
            delete effect.routeId
          }),
        tx
          .table(LIBRARY_TABLE.EVENTS)
          .toCollection()
          .modify((event) => {
            event.ending = event.gameOver
            delete event.gameOver

            if (event.editor) {
              event.composer = {
                sceneMapPosX: event.editor.componentEditorPosX,
                sceneMapPosY: event.editor.componentEditorPosY
              }

              delete event.editor.componentEditorPosX
              delete event.editor.componentEditorPosY
            }

            event.worldId = event.gameId
            delete event.gameId
          }),
        tx
          .table(LIBRARY_TABLE.FOLDERS)
          .toCollection()
          .modify((folder) => {
            folder.parent =
              folder.parent[0] === 'GAME'
                ? [ELEMENT_TYPE.WORLD, null]
                : folder.parent

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
            jump.path = [...jump.route]

            if (jump.editor) {
              jump.composer = {
                sceneMapPosX: jump.editor.componentEditorPosX,
                sceneMapPosY: jump.editor.componentEditorPosY
              }

              delete jump.editor.componentEditorPosX
              delete jump.editor.componentEditorPosY
            }

            jump.worldId = jump.gameId
            delete jump.gameId
          }),
        tx
          .table(LIBRARY_TABLE.LIVE_EVENTS)
          .toCollection()
          .modify((liveEvent) => {
            liveEvent.worldId = liveEvent.gameId
            delete liveEvent.gameId
          }),
        tx
          .table(LIBRARY_TABLE.PATHS)
          .toCollection()
          .modify((path) => {
            if (path.destinationType === 'PASSAGE') {
              path.destinationType = ELEMENT_TYPE.EVENT
            }

            path.worldId = path.gameId
            delete path.gameId

            path.conditionsType = PATH_CONDITIONS_TYPE.ALL
          }),
        tx
          .table(LIBRARY_TABLE.SCENES)
          .toCollection()
          .modify((scene) => {
            scene.parent =
              scene.parent[0] === 'GAME'
                ? [ELEMENT_TYPE.WORLD, null]
                : scene.parent

            scene.children = scene.children.map(
              (child: [ELEMENT_TYPE, string]) => [ELEMENT_TYPE.EVENT, child[1]]
            )

            if (scene.editor) {
              scene.composer = {
                sceneMapTransformX: scene.editor.componentEditorTransformX,
                sceneMapTransformY: scene.editor.componentEditorTransformY,
                sceneMapTransformZoom: scene.editor.componentEditorTransformZoom
              }

              delete scene.editor.componentEditorTransformX
              delete scene.editor.componentEditorTransformY
              delete scene.editor.componentEditorTransformZoom
            }

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
