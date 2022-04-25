// upgrades 0.7.0 data to 0.7.1
import { WorldDataJSON as GameDataJSON_070 } from '../types/0.7.0'
import { WorldDataJSON as WorldDataJSON_071 } from '../types/0.7.1'

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
}: GameDataJSON_070): WorldDataJSON_071 => {
  return {
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
  }
}
