import { AppDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { ProfileDocument } from '../data/types'

const useProfiles = (): ProfileDocument[] => {
  const profiles =
    useLiveQuery(() => new AppDatabase().profiles.toArray(), []) || []

  // sort alphabetical by profile title
  if (profiles) profiles.sort((a, b) => (a.title > b.title ? 1 : -1))

  return profiles
}

export default useProfiles
