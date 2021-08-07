import { cloneDeep } from 'lodash'
import { ValidationError } from 'jsonschema'

import { GAME_TEMPLATE } from '../data/types'
import { GameDataJSON as GameDataJSON_013 } from './transport/types/0.1.3'
import { GameDataJSON as GameDataJSON_020 } from './transport/types/0.2.0'

import api from '../api'

import validateGameData from './transport/validate'

import v020 from './transport/upgrade/0.2.0'

export default (
  gameData: GameDataJSON_013 & GameDataJSON_020,
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
        const upgradedGameData =
          engineVersion === '0.1.3'
            ? v020(cloneDeep(gameData) as GameDataJSON_013)
            : gameData

        const {
          _,
          choices,
          conditions,
          effects,
          folders,
          jumps,
          passages,
          routes,
          scenes,
          variables
        } = upgradedGameData

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
            { choices, content, editor, id, sceneId, tags, title, updated }
          ] of Object.entries(passages)) {
            await api().passages.savePassage(_.studioId, {
              choices,
              content,
              editor,
              gameId: _.id,
              id,
              sceneId,
              tags,
              title,
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
