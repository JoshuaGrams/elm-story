// #288: upgrades 0.4.0 data to 0.5.0
import { cloneDeep } from 'lodash-es'

import { GameDataJSON as GameDataJSON_040 } from '../types/0.4.0'
import {
  GameDataJSON as GameDataJSON_050,
  PassageCollection
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

  return {
    _: {
      ..._,
      engine: '0.5.0'
    },
    choices,
    conditions,
    effects,
    folders,
    inputs,
    jumps,
    passages: upgradedPassages,
    routes,
    scenes,
    variables
  }
}
