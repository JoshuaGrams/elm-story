import { Validator, Schema, ValidationError } from 'jsonschema'

import { GameDataJSON as GameDataJSON_013 } from '../types/0.1.3'
import { GameDataJSON as GameDataJSON_020 } from '../types/0.2.0'
import { GameDataJSON as GameDataJSON_030 } from '../types/0.3.0'

function isValidData(data: any, schema: Schema): [boolean, ValidationError[]] {
  const { errors } = new Validator().validate(data, schema)

  return errors.length === 0 ? [true, []] : [false, errors]
}

export default (
  gameData: GameDataJSON_013 | GameDataJSON_020 | GameDataJSON_030,
  version: string
): [boolean, ValidationError[] | { path?: string; message: string }[]] => {
  try {
    return isValidData(gameData, require(`../schema/${version}.json`))
  } catch (error) {
    return [
      false,
      [
        {
          message: `Unable to validate game data. Schema '${version}' is not supported.`
        }
      ]
    ]
  }
}
