import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import {
  ElementId,
  Effect,
  WorldId,
  SET_OPERATOR_TYPE,
  StudioId
} from '../data/types'

export async function getEffect(studioId: StudioId, effectId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getEffect(effectId)
  } catch (error) {
    throw error
  }
}

export async function getEffectsByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Effect[]> {
  try {
    return await new LibraryDatabase(studioId).getEffectsByWorldRef(worldId)
  } catch (error) {
    throw error
  }
}

export async function getEffectsByPathRef(
  studioId: StudioId,
  pathId: ElementId,
  countOnly?: boolean
): Promise<number | Effect[]> {
  try {
    return await new LibraryDatabase(studioId).getEffectsByPathRef(
      pathId,
      countOnly || false
    )
  } catch (error) {
    throw error
  }
}

export async function getEffectsByVariableRef(
  studioId: StudioId,
  variableId: ElementId
): Promise<Effect[]> {
  try {
    return await new LibraryDatabase(studioId).getEffectsByVariableRef(
      variableId
    )
  } catch (error) {
    throw error
  }
}

export async function saveEffect(
  studioId: StudioId,
  effect: Effect
): Promise<ElementId> {
  if (!effect.id) effect.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveEffect(effect)
  } catch (error) {
    throw error
  }
}

export async function saveEffectSetOperatorType(
  studioId: StudioId,
  effectId: ElementId,
  newSetOperatorType: SET_OPERATOR_TYPE
) {
  try {
    await new LibraryDatabase(studioId).saveEffectSetOperatorType(
      effectId,
      newSetOperatorType
    )
  } catch (error) {
    throw error
  }
}

export async function saveEffectValue(
  studioId: StudioId,
  effectId: ElementId,
  newValue: string
) {
  try {
    await new LibraryDatabase(studioId).saveEffectValue(effectId, newValue)
  } catch (error) {
    throw error
  }
}

export async function removeEffect(studioId: StudioId, effectId: ElementId) {
  try {
    await new LibraryDatabase(studioId).removeEffect(effectId)
  } catch (error) {
    throw error
  }
}
