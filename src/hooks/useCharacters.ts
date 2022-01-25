import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { WorldId, StudioId, Character, ElementId, Event } from '../data/types'

const useCharacters = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Character[] | undefined => {
  const characters = useLiveQuery(
    () => new LibraryDatabase(studioId).characters.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  if (characters) characters.sort((a, b) => (a.title > b.title ? 1 : -1))

  return characters
}

const useCharacter = (
  studioId: StudioId,
  characterId: ElementId | undefined | null, // undefined: loading, null: does not exist
  deps?: any[]
): Character | undefined | null =>
  useLiveQuery(
    async () =>
      (await new LibraryDatabase(studioId).characters.get(characterId || '')) ||
      null,
    deps || [],
    undefined
  )

const useCharacterEvents = (
  studioId: StudioId,
  characterId: ElementId | undefined | null,
  deps?: any[]
  // [events with persona, events with references]
): [Event[], Event[]] | undefined =>
  useLiveQuery(
    async () => {
      const personaEvents = await new LibraryDatabase(studioId).events
        .where('persona')
        .equals(characterId || '')
        .toArray()

      const referenceEvents = await new LibraryDatabase(studioId).events
        .where('characters')
        .equals(characterId || '')
        .toArray()

      return [personaEvents, referenceEvents]
    },
    deps || [],
    undefined
  )

export { useCharacter, useCharacterEvents }

export default useCharacters
