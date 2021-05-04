import { GameDataJSON } from './getGameDataJSON'
import { GAME_TEMPLATE } from '../data/types'

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

export default (
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
  skipValidation?: boolean
): {
  errors: string[]
  finish: () => Promise<string[]>
} => {
  let errors: string[] = []

  if (!skipValidation) {
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
            `conditions: ${
              error.path ? JSON.stringify(error.path) + ': ' : ''
            }${error.message}`
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
  }

  return {
    errors,
    finish: async (): Promise<string[]> => {
      if (errors.length === 0) {
        try {
          // Save chapters
          for await (const [
            __,
            { id, scenes, tags, title, updated }
          ] of Object.entries(chapters)) {
            await api().chapters.saveChapter(_.studioId, {
              gameId: _.id,
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

          // Save jumps
          for await (const [
            __,
            { editor, id, route, tags, title, updated }
          ] of Object.entries(jumps)) {
            await api().jumps.saveJump(_.studioId, {
              editor,
              gameId: _.id,
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
            { chapterId, editor, id, jumps, passages, tags, title, updated }
          ] of Object.entries(scenes)) {
            await api().scenes.saveScene(_.studioId, {
              chapterId,
              editor,
              id,
              gameId: _.id,
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
            chapters: _.chapters,
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
