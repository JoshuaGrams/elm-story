import { useDatabase, useUUID } from '../hooks'

export const PROFILE = {
  NOT_SELECTED: 0,
  SELECTED: 1
}

/**
 * Creates app profile.
 * TODO: Link profiles to cloud accounts.
 * @returns id on promise resolve
 */
async function add({
  name,
  selected = PROFILE.NOT_SELECTED,
  id = useUUID()
}: {
  name: string
  selected?: number
  id?: string
}): Promise<string> {
  try {
    await useDatabase().profiles.add({
      id,
      name,
      selected
    })

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

export { add, remove, setSelected }
