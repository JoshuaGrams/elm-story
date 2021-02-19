import { AppDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { StudioDocument } from '../data/types'

const useStudios = (): StudioDocument[] => {
  const studios =
    useLiveQuery(() => new AppDatabase().studios.toArray(), []) || []

  // sort alphabetical by studio title
  if (studios) studios.sort((a, b) => (a.title > b.title ? 1 : -1))

  return studios
}

export default useStudios
