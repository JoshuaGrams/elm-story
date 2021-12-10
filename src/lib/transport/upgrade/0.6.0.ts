// #288: upgrades 0.5.X data to 0.6.0
import { pick } from 'lodash-es'

import { GameDataJSON as GameDataJSON_051 } from '../types/0.5.1'
import {
  ELEMENT_TYPE,
  ChoiceCollection,
  ConditionCollection,
  EffectCollection,
  EventCollection,
  FolderCollection,
  InputCollection,
  JumpCollection,
  PathCollection,
  SceneCollection,
  WorldDataJSON as WorldDataJSON_060,
  PATH_CONDITIONS_TYPE
} from '../types/0.6.0'

export default ({
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
}: GameDataJSON_051): WorldDataJSON_060 => {
  const upgradedChoices: ChoiceCollection = {}

  Object.keys(choices).map((choiceId) => {
    const choice = choices[choiceId]

    upgradedChoices[choiceId] = {
      ...pick(choice, ['id', 'tags', 'title', 'updated']),
      eventId: choice.passageId
    }
  })

  const upgradedConditions: ConditionCollection = {}

  Object.keys(conditions).map((conditionId) => {
    const condition = conditions[conditionId]

    upgradedConditions[conditionId] = {
      ...pick(condition, [
        'compare',
        'id',
        'tags',
        'title',
        'updated',
        'variableId'
      ]),
      pathId: condition.routeId
    }
  })

  const upgradedEffects: EffectCollection = {}

  Object.keys(effects).map((effectId) => {
    const effect = effects[effectId]

    upgradedEffects[effectId] = {
      ...pick(effect, ['id', 'set', 'tags', 'title', 'updated', 'variableId']),
      pathId: effect.routeId
    }
  })

  const events: EventCollection = {}

  Object.keys(passages).map((passageId) => {
    const passage = { ...passages[passageId] }

    events[passageId] = {
      ...pick(passage, [
        'choices',
        'content',
        'id',
        'input',
        'sceneId',
        'tags',
        'title',
        'type',
        'updated'
      ]),
      composer: {
        sceneMapPosX: passage.editor?.componentEditorPosX,
        sceneMapPosY: passage.editor?.componentEditorPosY
      },
      ending: passage.gameOver
    }
  })

  const upgradedFolders: FolderCollection = {}

  Object.keys(folders).map((folderId) => {
    const folder = { ...folders[folderId] }

    upgradedFolders[folderId] = {
      ...pick(folder, ['children', 'id', 'tags', 'title', 'updated']),
      // @ts-ignore
      parent:
        folder.parent[0] === 'GAME' ? [ELEMENT_TYPE.WORLD, null] : folder.parent
    }
  })

  const upgradedInputs: InputCollection = {}

  Object.keys(inputs).map((inputId) => {
    const input = { ...inputs[inputId] }

    upgradedInputs[inputId] = {
      ...pick(input, ['id', 'tags', 'title', 'updated', 'variableId']),
      eventId: input.passageId
    }
  })

  const upgradedJumps: JumpCollection = {}

  Object.keys(jumps).map((jumpId) => {
    const jump = { ...jumps[jumpId] }

    upgradedJumps[jumpId] = {
      ...pick(jump, ['id', 'sceneId', 'tags', 'title', 'updated']),
      composer: {
        sceneMapPosX: jump.editor?.componentEditorPosX,
        sceneMapPosY: jump.editor?.componentEditorPosY
      },
      path: [...jump.route]
    }
  })

  const paths: PathCollection = {}

  Object.keys(routes).map((routeId) => {
    const route = { ...routes[routeId] }

    paths[routeId] = {
      ...pick(route, [
        'choiceId',
        'destinationId',
        'id',
        'inputId',
        'originId',
        'originType',
        'sceneId',
        'tags',
        'title',
        'updated'
      ]),
      conditionsType: PATH_CONDITIONS_TYPE.ALL,
      // @ts-ignore
      destinationType:
        route.destinationType === 'PASSAGE'
          ? ELEMENT_TYPE.EVENT
          : route.destinationType
    }
  })

  const upgradedScenes: SceneCollection = {}

  Object.keys(scenes).map((sceneId) => {
    const scene = { ...scenes[sceneId] }

    upgradedScenes[sceneId] = {
      ...pick(scene, ['id', 'jumps', 'tags', 'title', 'updated']),
      children: scene.children.map((child) => [ELEMENT_TYPE.EVENT, child[1]]),
      composer: {
        sceneMapTransformX: scene.editor?.componentEditorTransformX,
        sceneMapTransformY: scene.editor?.componentEditorTransformY,
        sceneMapTransformZoom: scene.editor?.componentEditorTransformZoom
      },
      // @ts-ignore
      parent:
        scene.parent[0] === 'GAME' ? [ELEMENT_TYPE.WORLD, null] : scene.parent
    }
  })

  return {
    // @ts-ignore
    _,
    characters: {},
    choices: upgradedChoices,
    conditions: upgradedConditions,
    effects: upgradedEffects,
    events,
    folders: upgradedFolders,
    inputs: upgradedInputs,
    jumps: upgradedJumps,
    paths,
    scenes: upgradedScenes,
    variables
  }
}
