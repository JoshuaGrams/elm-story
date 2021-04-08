import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ComponentId, StudioId, Variable } from '../data/types'

export async function getVariable(studioId: StudioId, variableId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getVariable(variableId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveScene(
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
