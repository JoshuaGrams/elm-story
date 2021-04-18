import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ComponentId, Effect, SET_OPERATOR_TYPE, StudioId } from '../data/types'

export async function getEffect(studioId: StudioId, effectId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getEffect(effectId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getEffectsByRouteRef(
  studioId: StudioId,
  routeId: ComponentId,
  countOnly?: boolean
): Promise<number | Effect[]> {
  try {
    return await new LibraryDatabase(studioId).getEffectsByRouteRef(
      routeId,
      countOnly || false
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function getEffectsByVariableRef(
  studioId: StudioId,
  variableId: ComponentId
): Promise<Effect[]> {
  try {
    return await new LibraryDatabase(studioId).getEffectsByVariableRef(
      variableId
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveEffect(
  studioId: StudioId,
  effect: Effect
): Promise<ComponentId> {
  if (!effect.id) effect.id = uuid()

  effect.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveEffect(effect)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveEffectSetOperatorType(
  studioId: StudioId,
  effectId: ComponentId,
  newSetOperatorType: SET_OPERATOR_TYPE
) {
  try {
    await new LibraryDatabase(studioId).saveEffectSetOperatorType(
      effectId,
      newSetOperatorType
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveEffectValue(
  studioId: StudioId,
  effectId: ComponentId,
  newValue: string
) {
  try {
    await new LibraryDatabase(studioId).saveEffectValue(effectId, newValue)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeEffect(studioId: StudioId, effectId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeEffect(effectId)
  } catch (error) {
    throw new Error(error)
  }
}
