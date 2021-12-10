import { Input, ElementId, WorldId, StudioId } from '../data/types'
import { v4 as uuid } from 'uuid'
import { LibraryDatabase } from '../db'

export async function getInput(studioId: StudioId, inputId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getInput(inputId)
  } catch (error) {
    throw error
  }
}

export async function getInputsByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Input[]> {
  try {
    return await new LibraryDatabase(studioId).getInputsByWorldRef(worldId)
  } catch (error) {
    throw error
  }
}

export async function saveInput(studioId: StudioId, input: Input) {
  if (!input.id) input.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveInput(input)
  } catch (error) {
    throw error
  }
}

export async function saveVariableRefToInput(
  studioId: StudioId,
  inputId: ElementId,
  variableId?: ElementId
) {
  try {
    return await new LibraryDatabase(studioId).saveVariableRefToInput(
      inputId,
      variableId
    )
  } catch (error) {
    throw error
  }
}

export async function removeInput(studioId: StudioId, inputId: ElementId) {
  try {
    await new LibraryDatabase(studioId).removeInput(inputId)
  } catch (error) {
    throw error
  }
}
