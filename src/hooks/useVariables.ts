import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, WorldId, StudioId, Variable } from '../data/types'

const useVariables = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Variable[] | undefined => {
  const variables = useLiveQuery(
    () => new LibraryDatabase(studioId).variables.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (variables) variables.sort((a, b) => (a.title > b.title ? 1 : -1))

  return variables
}

const useVariable = (
  studioId: StudioId,
  variableId: ElementId,
  deps?: any[]
): Variable | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).variables.where({ id: variableId }).first(),
    deps || [],
    undefined
  )

export { useVariable }

export default useVariables
