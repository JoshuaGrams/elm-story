import { useAppDatabase, useUUID } from '../hooks'
import { useLiveQuery } from 'dexie-react-hooks'

const createProfile = async (name: string): Promise<string> => {
  const id = useUUID()

  try {
    await useAppDatabase().profiles.add({
      id,
      name,
      selected: 0
    })

    return id
  } catch (error) {
    throw new Error(error)
  }
}

const deleteProfile = async (id: string) => {
  try {
    await useAppDatabase().profiles.delete(id)
  } catch (error) {
    throw new Error(error)
  }
}

const setSelectedProfile = async (id: string) => {
  const appDB = useAppDatabase()

  try {
    appDB.transaction('rw', appDB.profiles, async () => {
      // set selected to not selected
      await (await appDB.profiles.where({ selected: 1 }).toArray()).map(
        async (profile) => {
          await appDB.profiles.update(profile.id, { selected: 0 })
        }
      )

      await appDB.profiles.update(id, { selected: 1 })
    })
  } catch (error) {
    throw new Error(error)
  }
}

export const useSelectedProfile = () => {
  const selectedProfile = useLiveQuery(
    () => useAppDatabase().profiles.where({ selected: 1 }).first(),
    []
  )

  return { selectedProfile, setSelectedProfile }
}

export default () => {
  const profiles = useLiveQuery(() => useAppDatabase().profiles.toArray(), [])

  // sort alphabetical by profile name
  if (profiles) profiles.sort((a, b) => (a.name > b.name ? 1 : -1))

  return {
    profiles,
    createProfile,
    deleteProfile
  }
}
