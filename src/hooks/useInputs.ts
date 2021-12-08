import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { Input, ElementId, WorldId, StudioId } from '../data/types'

const useInputs = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Input[] | undefined => {
  const inputs = useLiveQuery(
    () => new LibraryDatabase(studioId).inputs.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  return inputs
}

const useInput = (
  studioId: StudioId,
  inputId: ElementId,
  deps?: any[]
): Input | undefined => {
  const input = useLiveQuery(
    () => new LibraryDatabase(studioId).inputs.where({ id: inputId }).first(),
    deps || [],
    undefined
  )

  return input
}

export { useInput }

export default useInputs
