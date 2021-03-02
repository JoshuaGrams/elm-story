import { AppDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { Studio, StudioId } from '../data/types'

const useStudios = (deps?: any[]): Studio[] | undefined => {
  const studios = useLiveQuery(
    () => new AppDatabase().studios.toArray(),
    deps || [],
    undefined
  )

  // sort alphabetical by studio title
  if (studios) studios.sort((a, b) => (a.title > b.title ? 1 : -1))

  return studios
}

const useSelectedStudio = (
  studioId: StudioId,
  deps?: any[]
): Studio | undefined =>
  useLiveQuery(
    () => new AppDatabase().studios.where({ id: studioId }).first(),
    deps || [],
    undefined
  )

export { useSelectedStudio }

export default useStudios
