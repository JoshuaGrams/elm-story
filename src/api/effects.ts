import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ComponentId, Effect, StudioId } from '../data/types'

export async function getEffect(studioId: StudioId, effectId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getEffect(effectId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getEffectsByRouteRef(
  studioId: StudioId,
  routeId: ComponentId
): Promise<Effect[]> {
  try {
    return await new LibraryDatabase(studioId).getEffectsByRouteRef(routeId)
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
