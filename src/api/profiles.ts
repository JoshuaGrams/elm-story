import { useDatabase, useUUID } from '../hooks'

export const PROFILE = {
  NOT_SELECTED: 0,
  SELECTED: 1
}

/**
 * Saves app profile.
 * TODO: Link profiles to cloud accounts.
 * @returns id on promise resolve
 */
async function save({
  name,
  selected = PROFILE.NOT_SELECTED,
  id = useUUID(),
  exists = false
}: {
  name: string
  selected?: number
  id?: string
  exists?: boolean
}): Promise<string> {
  const appDB = useDatabase()

  try {
    if (exists) {
      appDB.transaction('rw', appDB.profiles, async () => {
        const existingProfile = await appDB.profiles.where({ id }).first()

        if (existingProfile) {
          await appDB.profiles.update(id, { name })
        } else {
          throw new Error('Unable to update existing profile. Does not exist.')
        }
      })
    } else {
      await appDB.profiles.add({
        id,
        name,
        selected
      })
    }

    return id
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Delete app profile.
 * TODO: How does this affect cloud accounts?
 */
async function remove(id: string) {
  try {
    await useDatabase().profiles.delete(id)
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Set selected app profile.
 * TODO: How does this affect cloud accounts?
 */
async function setSelected(id: string) {
  const appDB = useDatabase()

  try {
    appDB.transaction('rw', appDB.profiles, async () => {
      // set selected to not selected
      await (
        await appDB.profiles.where({ selected: PROFILE.SELECTED }).toArray()
      ).map(async (profile) => {
        await appDB.profiles.update(profile.id, {
          selected: PROFILE.NOT_SELECTED
        })
      })

      await appDB.profiles.update(id, { selected: PROFILE.SELECTED })
    })
  } catch (error) {
    throw new Error(error)
  }
}

export { save, remove, setSelected }
