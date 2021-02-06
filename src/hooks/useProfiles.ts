import { useDatabase } from '../hooks'
import { useLiveQuery } from 'dexie-react-hooks'

import api from '../api'

/**
 * Returns tuple with selected app profile and
 * method for setting the selected app profile.
 */
export const useSelectedProfile = () => {
  const selected = useLiveQuery(
    () => useDatabase().profiles.where({ selected: 1 }).first(),
    []
  )

  return [selected, api().profiles.setSelected] as const
}

/**
 * Returns object with array of app profiles from DB and
 * access to save and remove APIs.
 */
export default () => {
  const profiles =
    useLiveQuery(() => useDatabase().profiles.toArray(), []) || []

  // sort alphabetical by profile name
  if (profiles) profiles.sort((a, b) => (a.name > b.name ? 1 : -1))

  return {
    profiles,
    save: api().profiles.save,
    remove: api().profiles.remove
  }
}
