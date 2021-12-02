import { cloneDeep } from 'lodash'
import semver from 'semver'
import { ValidationError } from 'jsonschema'

import { GAME_TEMPLATE } from '../data/types'
import { GameDataJSON as GameDataJSON_013 } from './transport/types/0.1.3'
import { GameDataJSON as GameDataJSON_020 } from './transport/types/0.2.0'
import { GameDataJSON as GameDataJSON_030 } from './transport/types/0.3.0'
import { GameDataJSON as GameDataJSON_031 } from './transport/types/0.3.1'
import { GameDataJSON as GameDataJSON_040 } from './transport/types/0.4.0'
import { GameDataJSON as GameDataJSON_050 } from './transport/types/0.5.0'
import { GameDataJSON as GameDataJSON_051 } from './transport/types/0.5.1'

import api from '../api'

import validateGameData from './transport/validate'

import v020Upgrade from './transport/upgrade/0.2.0'
import v040Upgrade from './transport/upgrade/0.4.0'
import v050Upgrade from './transport/upgrade/0.5.0'

export default (
  gameData: GameDataJSON_013 &
    GameDataJSON_020 &
    GameDataJSON_040 &
    GameDataJSON_050 &
    GameDataJSON_051,
  skipValidation?: boolean
): {
  errors: string[]
  finish: () => Promise<string[]>
} => {
  let errors: string[] = []
  const { engine: engineVersion } = gameData._

  if (!gameData._?.engine)
    errors = ['Unable to import game data. Missing engine version.']

  if (gameData._?.engine && !skipValidation) {
    errors = [
      ...errors,
      ...validateGameData(gameData, engineVersion)[1].map(
        (error: ValidationError | { path?: string; message: string }) =>
          `${error.path ? `${error.path}:` : ''} ${error.message}`
      )
    ]
  }

  return {
    errors,
    finish: async (): Promise<string[]> => {
      if (errors.length === 0) {
        let upgradedGameData:
          | GameDataJSON_020
          | GameDataJSON_040
          | undefined = undefined

        // Upgrade from 0.1.3 to 0.5.0
        if (engineVersion === '0.1.3') {
          upgradedGameData = v020Upgrade(
            cloneDeep(gameData) as GameDataJSON_013
          )

          upgradedGameData = v040Upgrade(cloneDeep(upgradedGameData))
          upgradedGameData = v050Upgrade(cloneDeep(upgradedGameData))
        }

        // #288
        // Upgrade from 0.2.0+ to 0.5.0
        if (
          semver.gt(engineVersion, '0.2.0') &&
          semver.lt(engineVersion, '0.5.0')
        ) {
          upgradedGameData = v040Upgrade(
            cloneDeep(gameData) as
              | GameDataJSON_020
              | GameDataJSON_030
              | GameDataJSON_031
          )

          upgradedGameData = v050Upgrade(cloneDeep(upgradedGameData))
        }

        // #411
        if (semver.gte(engineVersion, '0.5.0')) upgradedGameData = gameData

        if (!upgradedGameData)
          throw new Error('Unable to import game data. Version conflict.')

        // #411: always set to most recent version of app
        upgradedGameData._.engine = '0.5.1'

        const {
          _,
          choices,
          conditions,
          effects,
          folders,
          inputs,
          jumps,
          passages,
          routes,
          scenes,
          variables
        } = upgradedGameData as GameDataJSON_051

        try {
          // Save choices
          for await (const [
            __,
            { id, passageId, tags, title, updated }
          ] of Object.entries(choices)) {
            await api().choices.saveChoice(_.studioId, {
              worldId: _.id,
              id,
              passageId,
              tags,
              title,
              updated
            })
          }

          // Save conditions
          for await (const [
            __,
            { compare, id, routeId, tags, title, updated, variableId }
          ] of Object.entries(conditions)) {
            await api().conditions.saveCondition(_.studioId, {
              compare: [...compare, variables[variableId].type],
              worldId: _.id,
              id,
              pathId: routeId,
              tags,
              title,
              updated,
              variableId
            })
          }

          // Save effects
          for await (const [
            __,
            { id, routeId, set, tags, title, updated, variableId }
          ] of Object.entries(effects)) {
            await api().effects.saveEffect(_.studioId, {
              worldId: _.id,
              id,
              pathId: routeId,
              tags,
              set,
              title,
              updated,
              variableId
            })
          }

          // Save folders
          for await (const [
            __,
            { children, id, parent, tags, title, updated }
          ] of Object.entries(folders)) {
            await api().folders.saveFolder(_.studioId, {
              children,
              worldId: _.id,
              id,
              parent,
              tags,
              title,
              updated
            })
          }

          // Save inputs
          for await (const [
            __,
            { id, passageId, tags, title, updated, variableId }
          ] of Object.entries(inputs)) {
            await api().inputs.saveInput(_.studioId, {
              worldId: _.id,
              id,
              passageId,
              tags,
              title,
              updated,
              variableId
            })
          }

          // Save jumps
          for await (const [
            __,
            { editor, id, path, sceneId, tags, title, updated }
          ] of Object.entries(jumps)) {
            await api().jumps.saveJump(_.studioId, {
              composer: editor,
              worldId: _.id,
              id,
              path,
              sceneId,
              tags,
              title,
              updated
            })
          }

          // Save passages
          for await (const [
            __,
            {
              choices,
              content,
              editor,
              ending,
              id,
              sceneId,
              tags,
              title,
              input,
              type,
              updated
            }
          ] of Object.entries(passages)) {
            await api().events.saveEvent(_.studioId, {
              choices,
              content,
              composer: editor,
              ending,
              worldId: _.id,
              id,
              input,
              sceneId,
              tags,
              title,
              type,
              updated
            })
          }

          // Save routes
          for await (const [
            __,
            {
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
          ] of Object.entries(routes)) {
            await api().paths.saveRoute(_.studioId, {
              choiceId,
              destinationId,
              destinationType,
              id,
              inputId,
              worldId: _.id,
              originId,
              originType,
              sceneId,
              tags,
              title,
              updated
            })
          }

          // Save scenes
          for await (const [
            __,
            { children, editor, id, jumps, parent, tags, title, updated }
          ] of Object.entries(scenes)) {
            await api().scenes.saveScene(_.studioId, {
              children,
              composer: editor,
              id,
              worldId: _.id,
              jumps,
              parent,
              tags,
              title,
              updated
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
              worldId: _.id,
              tags,
              title,
              type,
              updated
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
            template: GAME_TEMPLATE.ADVENTURE,
            title: `${_.title} (Imported)`,
            version: _.version,
            website: _.website
          })
        } catch (error) {
          return [`${error}`]
        }
      }

      return ['Unable to process. Missing studio ID.']
    }
  }
}
