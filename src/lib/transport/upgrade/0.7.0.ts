// upgrades 0.6.0 data to 0.7.0
import { SceneData, WorldDataJSON as GameDataJSON_060 } from '../types/0.6.0'
import {
  ElementId,
  ELEMENT_TYPE,
  EventCollection,
  SceneCollection,
  WorldDataJSON as WorldDataJSON_070,
  SceneChildRefs,
  ConditionCollection,
  EffectCollection
} from '../types/0.7.0'

export default ({
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
}: GameDataJSON_060): WorldDataJSON_070 => {
  const upgradedEvents: EventCollection = {}

  Object.keys(events).map((eventId) => {
    const clonedEvent = { ...events[eventId] }

    upgradedEvents[eventId] = {
      ...clonedEvent,
      characters: [],
      images: []
    }
  })

  const jumpsByScene: { [sceneId: ElementId]: ElementId[] } = {}

  Object.keys(jumps).map((jumpId) => {
    const clonedJump = { ...jumps[jumpId] }

    if (!jumpId || !clonedJump.sceneId) return

    if (!jumpsByScene[clonedJump.sceneId]) {
      jumpsByScene[clonedJump.sceneId] = []
    }

    jumpsByScene[clonedJump.sceneId].push(jumpId)
  })

  const upgradedScenes: SceneCollection = {}

  Object.keys(scenes).map((sceneId) => {
    const clonedScene = { ...scenes[sceneId] },
      clonedChildren: SceneChildRefs = [...clonedScene.children]

    if (clonedScene.id && jumpsByScene[clonedScene.id]) {
      jumpsByScene[clonedScene.id].map((jumpId) =>
        clonedChildren.push([ELEMENT_TYPE.JUMP, jumpId])
      )
    }

    delete (clonedScene as Partial<SceneData>).jumps

    upgradedScenes[sceneId] = {
      ...clonedScene,
      children: clonedChildren
    }
  })

  // elmstorygames/feedback#276
  const upgradedConditions: ConditionCollection = {}

  Object.keys(conditions).map((conditionId) => {
    const clonedCondition = { ...conditions[conditionId] }

    upgradedConditions[conditionId] = {
      ...clonedCondition,
      compare: [
        ...clonedCondition.compare,
        variables[clonedCondition.variableId].type
      ]
    }
  })

  // elmstorygames/feedback#276
  const upgradedEffects: EffectCollection = {}

  Object.keys(effects).map((effectId) => {
    const clonedEffect = { ...effects[effectId] }

    upgradedEffects[effectId] = {
      ...clonedEffect,
      set: [...clonedEffect.set, variables[clonedEffect.variableId].type]
    }
  })

  return {
    // @ts-ignore
    _,
    characters,
    choices,
    conditions: upgradedConditions,
    effects: upgradedEffects,
    events: upgradedEvents,
    folders,
    inputs,
    jumps,
    paths,
    scenes: upgradedScenes,
    variables
  }
}
