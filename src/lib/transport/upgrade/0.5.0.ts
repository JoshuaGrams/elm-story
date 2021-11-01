// #288: upgrades 0.4.0 data to 0.5.0
import { cloneDeep } from 'lodash-es'

import { GameDataJSON as GameDataJSON_040 } from '../types/0.4.0'
import {
  FolderCollection,
  GameChildRefs,
  GameDataJSON as GameDataJSON_050,
  PassageCollection,
  RootData,
  RouteCollection,
  SceneCollection
} from '../types/0.5.0'

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
}: GameDataJSON_040): GameDataJSON_050 => {
  const clonedPassages = cloneDeep(passages),
    upgradedPassages: PassageCollection = {}

  Object.keys(clonedPassages).map((passageId) => {
    upgradedPassages[passageId] = {
      ...clonedPassages[passageId],
      gameOver: false
    }
  })

  const upgradedRootData: RootData = {
    ..._,
    children: _.children as GameChildRefs
  }

  return {
    _: upgradedRootData,
    choices,
    conditions,
    effects,
    folders: folders as FolderCollection,
    inputs,
    jumps,
    passages: upgradedPassages,
    routes: routes as RouteCollection,
    scenes: scenes as SceneCollection,
    variables
  }
}
