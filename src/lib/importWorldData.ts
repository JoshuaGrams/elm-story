import { ipcRenderer } from 'electron'

import { cloneDeep } from 'lodash'
import semver from 'semver'
import { ValidationError } from 'jsonschema'

import { WORLD_TEMPLATE } from '../data/types'
import { GameDataJSON as GameDataJSON_013 } from './transport/types/0.1.3'
import { GameDataJSON as GameDataJSON_020 } from './transport/types/0.2.0'
import { GameDataJSON as GameDataJSON_030 } from './transport/types/0.3.0'
import { GameDataJSON as GameDataJSON_031 } from './transport/types/0.3.1'
import { GameDataJSON as GameDataJSON_040 } from './transport/types/0.4.0'
import { GameDataJSON as GameDataJSON_050 } from './transport/types/0.5.0'
import { GameDataJSON as GameDataJSON_051 } from './transport/types/0.5.1'
import { WorldDataJSON as WorldDataJSON_060 } from './transport/types/0.6.0'
import { WorldDataJSON as WorldDataJSON_070 } from './transport/types/0.7.0'

import api from '../api'

import validateWorldData from './transport/validate'

import v020Upgrade from './transport/upgrade/0.2.0'
import v040Upgrade from './transport/upgrade/0.4.0'
import v050Upgrade from './transport/upgrade/0.5.0'
import v060Upgrade from './transport/upgrade/0.6.0'
import { WINDOW_EVENT_TYPE } from './events'

export default (
  worldData: GameDataJSON_013 &
    GameDataJSON_020 &
    GameDataJSON_040 &
    GameDataJSON_050 &
    GameDataJSON_051 &
    WorldDataJSON_060,
  jsonPath: string | undefined,
  skipValidation?: boolean
): {
  errors: string[]
  finish: () => Promise<string[]>
} => {
  let errors: string[] = []
  const { engine: engineVersion } = worldData._

  if (!worldData._?.engine)
    errors = ['Unable to import game data. Missing engine version.']

  if (worldData._?.engine && !skipValidation) {
    errors = [
      ...errors,
      ...validateWorldData(worldData, engineVersion)[1].map(
        (error: ValidationError | { path?: string; message: string }) =>
          `${error.path ? `${error.path}:` : ''} ${error.message}`
      )
    ]
  }

  return {
    errors,
    finish: async (): Promise<string[]> => {
      if (errors.length === 0) {
        let upgradedWorldData:
          | GameDataJSON_020
          | GameDataJSON_040
          | undefined = undefined

        // Upgrade from 0.1.3 to 0.6.0
        if (engineVersion === '0.1.3') {
          upgradedWorldData = v020Upgrade(
            cloneDeep(worldData) as GameDataJSON_013
          )

          upgradedWorldData = v040Upgrade(cloneDeep(upgradedWorldData))
          upgradedWorldData = v050Upgrade(cloneDeep(upgradedWorldData))
          upgradedWorldData = v060Upgrade(cloneDeep(upgradedWorldData))
        }

        // #288
        // Upgrade from 0.2.0+ to 0.6.0
        if (
          semver.gte(engineVersion, '0.2.0') &&
          semver.lt(engineVersion, '0.6.0')
        ) {
          upgradedWorldData = cloneDeep(worldData)

          // feedback#85: input is set to empty object with 0.4.0 upgrade
          // feedback#87: gameOver being switched to false before upgrade to ending
          if (semver.lt(engineVersion, '0.5.0')) {
            upgradedWorldData = v040Upgrade(
              cloneDeep(worldData) as
                | GameDataJSON_020
                | GameDataJSON_030
                | GameDataJSON_031
            )

            upgradedWorldData = v050Upgrade(cloneDeep(upgradedWorldData))
          }

          upgradedWorldData = v060Upgrade(cloneDeep(upgradedWorldData))
        }

        // #411
        if (semver.gte(engineVersion, '0.6.0')) upgradedWorldData = worldData

        if (!upgradedWorldData)
          throw new Error('Unable to import game data. Version conflict.')

        // #411: always set to most recent version of app
        upgradedWorldData._.engine = '0.6.0'

        const {
          _,
          characters,
          choices,
          conditions,
          effects,
          events,
          folders,
          inputs,
          jumps,
          paths,
          scenes,
          variables
        } = upgradedWorldData as WorldDataJSON_060

        try {
          // Save characters
          for await (const [
            __,
            { description, id, masks, refs, title, tags, updated }
          ] of Object.entries(characters)) {
            await api().characters.saveCharacter(_.studioId, {
              description,
              id,
              masks,
              refs,
              title,
              tags,
              updated,
              worldId: _.id
            })
          }

          // Save choices
          for await (const [
            __,
            { id, eventId, tags, title, updated }
          ] of Object.entries(choices)) {
            await api().choices.saveChoice(_.studioId, {
              eventId,
              id,
              tags,
              title,
              updated,
              worldId: _.id
            })
          }

          // Save conditions
          for await (const [
            __,
            { compare, id, pathId, tags, title, updated, variableId }
          ] of Object.entries(conditions)) {
            await api().conditions.saveCondition(_.studioId, {
              compare: [...compare, variables[variableId].type],
              id,
              pathId,
              tags,
              title,
              updated,
              variableId,
              worldId: _.id
            })
          }

          // Save effects
          for await (const [
            __,
            { id, pathId, set, tags, title, updated, variableId }
          ] of Object.entries(effects)) {
            await api().effects.saveEffect(_.studioId, {
              id,
              pathId,
              set,
              tags,
              title,
              updated,
              variableId,
              worldId: _.id
            })
          }

          // Save events
          for await (const [
            __,
            {
              choices,
              content,
              composer,
              ending,
              id,
              input,
              persona,
              sceneId,
              tags,
              title,
              type,
              updated
            }
          ] of Object.entries(events)) {
            await api().events.saveEvent(_.studioId, {
              choices,
              content,
              composer,
              ending,
              id,
              input,
              persona,
              sceneId,
              tags,
              title,
              type,
              updated,
              worldId: _.id
            })
          }

          // Save folders
          for await (const [
            __,
            { children, id, parent, tags, title, updated }
          ] of Object.entries(folders)) {
            await api().folders.saveFolder(_.studioId, {
              children,
              id,
              parent,
              tags,
              title,
              updated,
              worldId: _.id
            })
          }

          // Save inputs
          for await (const [
            __,
            { id, eventId, tags, title, updated, variableId }
          ] of Object.entries(inputs)) {
            await api().inputs.saveInput(_.studioId, {
              id,
              eventId,
              tags,
              title,
              updated,
              variableId,
              worldId: _.id
            })
          }

          // Save jumps
          for await (const [
            __,
            { composer, id, path, sceneId, tags, title, updated }
          ] of Object.entries(jumps)) {
            await api().jumps.saveJump(_.studioId, {
              composer,
              id,
              path,
              sceneId,
              tags,
              title,
              updated,
              worldId: _.id
            })
          }

          // Save paths
          for await (const [
            __,
            {
              conditionsType,
              choiceId,
              destinationId,
              destinationType,
              id,
              inputId,
              originId,
              originType,
              sceneId,
              tags,
              title,
              updated
            }
          ] of Object.entries(paths)) {
            await api().paths.savePath(_.studioId, {
              conditionsType,
              choiceId,
              destinationId,
              destinationType,
              id,
              inputId,
              originId,
              originType,
              sceneId,
              tags,
              title,
              updated,
              worldId: _.id
            })
          }

          // Save scenes
          for await (const [
            __,
            { children, composer, id, jumps, parent, tags, title, updated }
          ] of Object.entries(scenes)) {
            await api().scenes.saveScene(_.studioId, {
              children,
              composer,
              id,
              parent,
              tags,
              title,
              updated,
              worldId: _.id
            })
          }

          // Save variables
          for await (const [
            __,
            { id, initialValue, tags, title, type, updated }
          ] of Object.entries(variables)) {
            await api().variables.saveVariable(_.studioId, {
              id,
              initialValue,
              tags,
              title,
              type,
              updated,
              worldId: _.id
            })
          }

          // Save game data
          await api().worlds.saveWorld(_.studioId, {
            children: _.children,
            copyright: _.copyright,
            description: _.description,
            designer: _.designer,
            engine: _.engine,
            id: _.id,
            jump: _.jump,
            tags: _.tags,
            template: WORLD_TEMPLATE.ADVENTURE,
            title: `${_.title} (Imported)`,
            version: _.version,
            website: _.website
          })

          await ipcRenderer.invoke(WINDOW_EVENT_TYPE.IMPORT_WORLD_ASSETS, {
            studioId: _.studioId,
            worldId: _.id,
            jsonPath
          })
        } catch (error) {
          return [`${error}`]
        }
      }

      return ['Unable to process. Missing studio ID.']
    }
  }
}
