import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, WorldId, StudioId, Jump } from '../data/types'

const useJumps = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Jump[] | undefined => {
  const jumps = useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  return jumps
}

const useJump = (
  studioId: StudioId,
  jumpId: ElementId,
  deps?: any[]
): Jump | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ id: jumpId }).first(),
    deps || [],
    undefined
  )

const useJumpsBySceneRef = (
  studioId: StudioId,
  sceneId: ElementId,
  deps?: any[]
): Jump[] | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ sceneId }).toArray(),
    deps || [],
    undefined
  )

export { useJump, useJumpsBySceneRef }

export default useJumps
