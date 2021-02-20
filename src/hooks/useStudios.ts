import { AppDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { StudioDocument } from '../data/types'

const useStudios = (deps?: any[]): StudioDocument[] | undefined => {
  const studios = useLiveQuery(
    () => new AppDatabase().studios.toArray(),
    deps || [],
    undefined
  )

  // sort alphabetical by studio title
  if (studios) studios.sort((a, b) => (a.title > b.title ? 1 : -1))

  return studios
}

export default useStudios
