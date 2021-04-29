import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import { ComponentId, StudioId, Variable, VARIABLE_TYPE } from '../data/types'

export async function getVariable(studioId: StudioId, variableId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getVariable(variableId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveVariable(
  studioId: StudioId,
  variable: Variable
): Promise<ComponentId> {
  if (!variable.id) variable.id = uuid()

  variable.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveVariable(variable)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeVariable(
  studioId: StudioId,
  variableId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removeVariable(variableId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveVariableTitle(
  studioId: StudioId,
  variableId: ComponentId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveComponentTitle(
      variableId,
      LIBRARY_TABLE.VARIABLES,
      title
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveVariableType(
  studioId: StudioId,
  variableId: ComponentId,
  type: VARIABLE_TYPE
) {
  try {
    return await new LibraryDatabase(studioId).saveVariableType(
      variableId,
      type
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveVariableDefaultValue(
  studioId: StudioId,
  variableId: ComponentId,
  initialValue: string
) {
  try {
    return await new LibraryDatabase(studioId).saveVariableDefaultValue(
      variableId,
      initialValue
    )
  } catch (error) {
    throw new Error(error)
  }
}
