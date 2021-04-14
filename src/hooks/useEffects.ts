import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ComponentId, Effect, GameId, StudioId } from '../data/types'

const useEffects = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): Effect[] | undefined => {
  const effects = useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  return effects
}

const useEffect = (
  studioId: StudioId,
  effectId: ComponentId,
  deps?: any[]
): Effect | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).effects.where({ id: effectId }).first(),
    deps || [],
    undefined
  )

export { useEffect }

export default useEffects
