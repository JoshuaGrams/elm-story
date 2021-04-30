import { GameDataJSON } from './getGameDataJSON'

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

export default async ({
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
}: GameDataJSON): Promise<string[]> => {
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
      ...rootDataErrors.map((error) => `_: ${error.message}`)
    ]

  if (chapterCollectionErrors && chapterCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...chapterCollectionErrors.map(
        (error) => `chapters: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (choiceCollectionErrors && choiceCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...choiceCollectionErrors.map(
        (error) => `choices: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (conditionCollectionErrors && conditionCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...conditionCollectionErrors.map(
        (error) => `conditions: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (effectsCollectionErrors && effectsCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...effectsCollectionErrors.map(
        (error) => `effects: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (jumpCollectionErrors && jumpCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...jumpCollectionErrors.map(
        (error) => `jumps: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (passageCollectionErrors && passageCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...passageCollectionErrors.map(
        (error) => `passages: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (routeCollectionErrors && routeCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...routeCollectionErrors.map(
        (error) => `routes: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (sceneCollectionErrors && sceneCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...sceneCollectionErrors.map(
        (error) => `scenes: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (variableCollectionErrors && variableCollectionErrors.length > 0)
    errors = [
      ...errors,
      ...variableCollectionErrors.map(
        (error) => `variables: ${JSON.stringify(error.path)}: ${error.message}`
      )
    ]

  if (errors.length === 0) {
    const studio = await api().studios.getStudio(_.studioId)

    console.log(studio)
  }

  return errors
}
