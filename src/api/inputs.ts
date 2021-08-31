import { Input, ComponentId, GameId, StudioId } from '../data/types'
import { v4 as uuid } from 'uuid'
import { LibraryDatabase } from '../db'

export async function getInput(studioId: StudioId, inputId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getInput(inputId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getInputsByGameRef(
  studioId: StudioId,
  gameId: GameId
): Promise<Input[]> {
  try {
    return await new LibraryDatabase(studioId).getInputsByGameRef(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveInput(studioId: StudioId, input: Input) {
  if (!input.id) input.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveInput(input)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveVariableRefToInput(
  studioId: StudioId,
  inputId: ComponentId,
  variableId?: ComponentId
) {
  try {
    return await new LibraryDatabase(studioId).saveVariableRefToInput(
      inputId,
      variableId
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeInput(studioId: StudioId, inputId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeInput(inputId)
  } catch (error) {
    throw new Error(error)
  }
}
