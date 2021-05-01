import { v4 as uuid } from 'uuid'

import { GameDataJSON } from './getGameDataJSON'
import { GAME_TEMPLATE, StudioId } from '../data/types'

import {
  isRootDataValid,
  isChapterCollectionValid,
  isChoiceCollectionValid,
  isConditionCollectionValid,
  isEffectCollectionValid,
  isJumpCollectionValid,
  isPassageCollectionValid,
  isRouteCollectionValid,
  isSceneCollectionValid,
  isVariableCollectionValid
} from './validateGameDataJSON'

import api from '../api'
import { ValidationError } from 'jsonschema'

export default async (
  {
    _,
    chapters,
    choices,
    conditions,
    effects,
    jumps,
    passages,
    routes,
    scenes,
    variables
  }: GameDataJSON,
  studioId: StudioId
): Promise<string[]> => {
  let errors: string[] = []

  const [, rootDataErrors] = isRootDataValid(_),
    [, chapterCollectionErrors] = isChapterCollectionValid(chapters),
    [, choiceCollectionErrors] = isChoiceCollectionValid(choices),
    [, conditionCollectionErrors] = isConditionCollectionValid(conditions),
    [, effectsCollectionErrors] = isEffectCollectionValid(effects),
    [, jumpCollectionErrors] = isJumpCollectionValid(jumps),
    [, passageCollectionErrors] = isPassageCollectionValid(passages),
    [, routeCollectionErrors] = isRouteCollectionValid(routes),
    [, sceneCollectionErrors] = isSceneCollectionValid(scenes),
    [, variableCollectionErrors] = isVariableCollectionValid(variables)

  if (rootDataErrors && rootDataErrors.length > 0)
    errors = [
      ...errors,
      ...rootDataErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `_: ${error.message}`
      )
    ]

  if (chapterCollectionErrors && chapterCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...chapterCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `chapters: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (choiceCollectionErrors && choiceCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...choiceCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `choices: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (conditionCollectionErrors && conditionCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...conditionCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `conditions: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (effectsCollectionErrors && effectsCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...effectsCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `effects: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (jumpCollectionErrors && jumpCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...jumpCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `jumps: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (passageCollectionErrors && passageCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...passageCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `passages: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (routeCollectionErrors && routeCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...routeCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `routes: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (sceneCollectionErrors && sceneCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...sceneCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `scenes: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (variableCollectionErrors && variableCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...variableCollectionErrors.map(
        (error: ValidationError | { path?: string; message: string }) =>
          `variables: ${error.path ? JSON.stringify(error.path) + ': ' : ''}${
            error.message
          }`
      )
    ]

  if (errors.length === 0) {
    try {
      const studio = await api().studios.getStudio(studioId),
        newGameId = uuid()

      if (!studio) return ['Missing studio.']

      // TODO: #195, #198
      // if (!studio) {
      //   logger.info(
      //     `importGameDataJSON->Studio doesn't exist. Creating: ${_.studioTitle}->${_.studioId}`
      //   )

      //   // TODO: We should also select the studio
      //   await api().studios.saveStudio({
      //     games: [_.id],
      //     id: _.studioId,
      //     tags: [],
      //     title: _.studioTitle
      //   })
      // }

      if (studio) {
        // TODO: #196, #197
        // const existingGameIndex = studio.games.findIndex(
        //   (gameRef) => gameRef === _.id
        // )

        // if (existingGameIndex === -1)
        // await api().studios.saveStudio({
        //   ...studio,
        //   games: [newGameId, ...studio.games]
        // })

        // Save chapters
        for await (const [
          __,
          { id, scenes, tags, title, updated }
        ] of Object.entries(chapters)) {
          await api().chapters.saveChapter(studioId, {
            gameId: newGameId,
            id,
            scenes,
            tags,
            title,
            updated
          })
        }

        // Save choices
        for await (const [
          __,
          { id, passageId, tags, title, updated }
        ] of Object.entries(choices)) {
          await api().choices.saveChoice(studioId, {
            gameId: newGameId,
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
          await api().conditions.saveCondition(studioId, {
            compare: [...compare, variables[variableId].type],
            gameId: newGameId,
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
          await api().effects.saveEffect(studioId, {
            gameId: newGameId,
            id,
            routeId,
            tags,
            set,
            title,
            updated,
            variableId
          })
        }

        // Save jumps
        for await (const [
          __,
          { editor, id, route, tags, title, updated }
        ] of Object.entries(jumps)) {
          await api().jumps.saveJump(studioId, {
            editor,
            gameId: newGameId,
            id,
            route,
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
          await api().passages.savePassage(studioId, {
            choices,
            content,
            editor,
            gameId: newGameId,
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
          await api().routes.saveRoute(studioId, {
            choiceId,
            destinationId,
            destinationType,
            id,
            gameId: newGameId,
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
          { chapterId, editor, id, jumps, passages, tags, title, updated }
        ] of Object.entries(scenes)) {
          await api().scenes.saveScene(studioId, {
            chapterId,
            editor,
            id,
            gameId: newGameId,
            jumps,
            passages,
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
          await api().variables.saveVariable(studioId, {
            id,
            initialValue,
            gameId: newGameId,
            tags,
            title,
            type,
            updated
          })
        }

        // Save game data
        await api().games.saveGame(studioId, {
          chapters: _.chapters,
          id: newGameId,
          designer: _.designer,
          engine: _.engine,
          jump: _.jump,
          tags: _.tags,
          title: `${_.title} (Imported)`,
          template: GAME_TEMPLATE.ADVENTURE,
          version: _.version
        })
      }
    } catch (error) {
      return [`${error}`]
    }
  }

  return errors
}
