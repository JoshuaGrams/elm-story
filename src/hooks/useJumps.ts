import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ComponentId, GameId, StudioId, Jump } from '../data/types'

const useJumps = (
  studioId: StudioId,
  gameId: GameId,
  deps?: any[]
): Jump[] | undefined => {
  const jumps = useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ gameId }).toArray(),
    deps || [],
    undefined
  )

  return jumps
}

const useJump = (
  studioId: StudioId,
  jumpId: ComponentId,
  deps?: any[]
): Jump | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ id: jumpId }).first(),
    deps || [],
    undefined
  )

const useJumpsBySceneRef = (
  studioId: StudioId,
  sceneId: ComponentId,
  deps?: any[]
): Jump[] | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ sceneId }).toArray(),
    deps || [],
    undefined
  )

export { useJump, useJumpsBySceneRef }

export default useJumps
