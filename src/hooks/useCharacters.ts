import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import {
  GameId,
  StudioId,
  Character,
  ComponentId,
  Passage
} from '../data/types'

const useCharacters = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): Character[] | undefined => {
  const characters = useLiveQuery(
    () => new LibraryDatabase(studioId).characters.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  if (characters) characters.sort((a, b) => (a.title > b.title ? 1 : -1))

  return characters
}

const useCharacter = (
  studioId: StudioId,
  characterId: ComponentId | undefined | null,
  deps?: any[]
): Character | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).characters.get(characterId || ''),
    deps || [],
    undefined
  )

const useCharacterEvents = (
  studioId: StudioId,
  characterId: ComponentId | undefined | null,
  deps?: any[]
): Passage[] | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).passages
        .where('persona')
        .equals(characterId || '')
        .toArray(),
    deps || [],
    undefined
  )

export { useCharacter, useCharacterEvents }

export default useCharacters
