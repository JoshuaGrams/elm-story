// #288: upgrades 0.2.0-0.3.X data to 0.4.0
import { cloneDeep } from 'lodash-es'

import { PASSAGE_TYPE } from '../../../data/types'
import { GameDataJSON as GameDataJSON_020 } from '../types/0.2.0'
import { GameDataJSON as GameDataJSON_030 } from '../types/0.3.0'
import { GameDataJSON as GameDataJSON_031 } from '../types/0.3.1'
import {
  GameDataJSON as GameDataJSON_040,
  PassageCollection
} from '../types/0.4.0'

export default ({
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
}:
  | GameDataJSON_020
  | GameDataJSON_030
  | GameDataJSON_031): GameDataJSON_040 => {
  const clonedPassages = cloneDeep(passages),
    upgradedPassages: PassageCollection = {}

  Object.keys(clonedPassages).map((passageId) => {
    upgradedPassages[passageId] = {
      ...clonedPassages[passageId],
      type: PASSAGE_TYPE.CHOICE
    }
  })

  return {
    _: {
      ..._,
      engine: '0.4.0'
    },
    choices,
    conditions,
    effects,
    folders,
    inputs: {},
    jumps,
    passages: upgradedPassages,
    routes,
    scenes,
    variables
  }
}
