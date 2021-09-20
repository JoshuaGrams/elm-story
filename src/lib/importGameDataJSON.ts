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

import api from '../api'

import validateGameData from './transport/validate'

import v020Upgrade from './transport/upgrade/0.2.0'
import v040Upgrade from './transport/upgrade/0.4.0'
import v050Upgrade from './transport/upgrade/0.5.0'

export default (
  gameData: GameDataJSON_013 &
    GameDataJSON_020 &
    GameDataJSON_040 &
    GameDataJSON_050,
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

        if (engineVersion === '0.5.0') upgradedGameData = gameData

        if (!upgradedGameData)
          throw new Error('Unable to import game data. Version conflict.')

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
        } = upgradedGameData as GameDataJSON_050

        try {
          // Save choices
          for await (const [
            __,
            { id, passageId, tags, title, updated }
          ] of Object.entries(choices)) {
            await api().choices.saveChoice(_.studioId, {
              gameId: _.id,
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
              gameId: _.id,
              id,
              routeId,
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
              gameId: _.id,
              id,
              routeId,
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
              gameId: _.id,
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
              gameId: _.id,
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
            { editor, id, route, sceneId, tags, title, updated }
          ] of Object.entries(jumps)) {
            await api().jumps.saveJump(_.studioId, {
              editor,
              gameId: _.id,
              id,
              route,
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
              gameEnd,
              id,
              sceneId,
              tags,
              title,
              input,
              type,
              updated
            }
          ] of Object.entries(passages)) {
            await api().passages.savePassage(_.studioId, {
              choices,
              content,
              editor,
              gameEnd,
              gameId: _.id,
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
            await api().routes.saveRoute(_.studioId, {
              choiceId,
              destinationId,
              destinationType,
              id,
              inputId,
              gameId: _.id,
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
              editor,
              id,
              gameId: _.id,
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
              gameId: _.id,
              tags,
              title,
              type,
              updated
            })
          }

          // Save game data
          await api().games.saveGame(_.studioId, {
            children: _.children,
            id: _.id,
            designer: _.designer,
            engine: _.engine,
            jump: _.jump,
            tags: _.tags,
            title: `${_.title} (Imported)`,
            template: GAME_TEMPLATE.ADVENTURE,
            version: _.version
          })
        } catch (error) {
          return [`${error}`]
        }
      }

      return ['Unable to process. Missing studio ID.']
    }
  }
}
