import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import {
  COMPARE_OPERATOR_TYPE,
  ComponentId,
  Condition,
  GameId,
  StudioId
} from '../data/types'

export async function getCondition(
  studioId: StudioId,
  conditionId: ComponentId
) {
  try {
    return await new LibraryDatabase(studioId).getCondition(conditionId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getConditionsByGameRef(
  studioId: StudioId,
  gameId: GameId
): Promise<Condition[]> {
  try {
    return await new LibraryDatabase(studioId).getConditionsByGameRef(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getConditionsByRouteRef(
  studioId: StudioId,
  routeId: ComponentId,
  countOnly?: boolean
): Promise<number | Condition[]> {
  try {
    return await new LibraryDatabase(studioId).getConditionsByRouteRef(
      routeId,
      countOnly || false
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function getConditionsByVariableRef(
  studioId: StudioId,
  variableId: ComponentId
): Promise<Condition[]> {
  try {
    return await new LibraryDatabase(studioId).getConditionsByVariableRef(
      variableId
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveCondition(
  studioId: StudioId,
  condition: Condition
): Promise<ComponentId> {
  if (!condition.id) condition.id = uuid()

  condition.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveCondition(condition)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveConditionCompareOperatorType(
  studioId: StudioId,
  conditionId: ComponentId,
  newCompareOperatorType: COMPARE_OPERATOR_TYPE
) {
  try {
    await new LibraryDatabase(studioId).saveConditionCompareOperatorType(
      conditionId,
      newCompareOperatorType
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveConditionValue(
  studioId: StudioId,
  conditionId: ComponentId,
  newValue: string
) {
  try {
    await new LibraryDatabase(studioId).saveConditionValue(
      conditionId,
      newValue
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeCondition(
  studioId: StudioId,
  conditionId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removeCondition(conditionId)
  } catch (error) {
    throw new Error(error)
  }
}
