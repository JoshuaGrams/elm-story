import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import {
  COMPARE_OPERATOR_TYPE,
  ElementId,
  Condition,
  WorldId,
  StudioId
} from '../data/types'

export async function getCondition(studioId: StudioId, conditionId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getCondition(conditionId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getConditionsByGameRef(
  studioId: StudioId,
  gameId: WorldId
): Promise<Condition[]> {
  try {
    return await new LibraryDatabase(studioId).getConditionsByGameRef(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getConditionsByRouteRef(
  studioId: StudioId,
  routeId: ElementId,
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
  variableId: ElementId
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
): Promise<ElementId> {
  if (!condition.id) condition.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveCondition(condition)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveConditionCompareOperatorType(
  studioId: StudioId,
  conditionId: ElementId,
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
  conditionId: ElementId,
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
  conditionId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).removeCondition(conditionId)
  } catch (error) {
    throw new Error(error)
  }
}
