import logger from '../../logger'

import AJV, { Schema } from 'ajv/dist/2020'

import { GameDataJSON as GameDataJSON_013 } from '../types/0.1.3'
import { GameDataJSON as GameDataJSON_020 } from '../types/0.2.0'
import { GameDataJSON as GameDataJSON_030 } from '../types/0.3.0'
import { GameDataJSON as GameDataJSON_031 } from '../types/0.3.1'
import { GameDataJSON as GameDataJSON_040 } from '../types/0.4.0'
import { GameDataJSON as GameDataJSON_050 } from '../types/0.5.0'
import { GameDataJSON as GameDataJSON_051 } from '../types/0.5.1'
import { WorldDataJSON as WorldDataJSON_060 } from '../types/0.6.0'
import { WorldDataJSON as WorldDataJSON_070 } from '../types/0.7.0'
import { WorldDataJSON as WorldDataJSON_071 } from '../types/0.7.1'

export type ValidationError = {
  path?: string
  message: string
  params?: { [key: string]: {} }
}

function isValidData(data: any, schema: Schema): [boolean, ValidationError[]] {
  const ajv = new AJV({ allErrors: true, strict: 'log' }),
    validate = ajv.compile(schema)

  const valid = validate(data),
    errors: ValidationError[] = []

  validate.errors?.map((error) => {
    errors.push({
      path: error.instancePath,
      message: error.message || 'Unknown error',
      params: error.params
    })
  })

  return valid && errors.length === 0 ? [true, []] : [false, errors]
}

export default (
  worldData:
    | GameDataJSON_013
    | GameDataJSON_020
    | GameDataJSON_030
    | GameDataJSON_031
    | GameDataJSON_040
    | GameDataJSON_050
    | GameDataJSON_051
    | WorldDataJSON_060
    | WorldDataJSON_070
    | WorldDataJSON_071,
  version: string
): [boolean, ValidationError[]] => {
  try {
    return isValidData(worldData, require(`../schema/${version}.json`))
  } catch (error) {
    logger.info(error)

    return [
      false,
      [
        {
          message: `Unable to validate storyworld data. Schema '${version}' is not supported.`
        }
      ]
    ]
  }
}
