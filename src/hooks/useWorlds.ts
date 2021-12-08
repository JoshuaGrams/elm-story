import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, World, WorldId } from '../data/types'

export enum WORLD_SORT {
  NAME = 'NAME',
  DATE = 'DATE'
}

const useWorlds = (
  studioId: StudioId,
  sortBy?: WORLD_SORT,
  deps?: any[]
): World[] | undefined => {
  const worlds = useLiveQuery(
    () => new LibraryDatabase(studioId).worlds.toArray(),
    deps || [],
    undefined
  )

  if (worlds) {
    switch (sortBy) {
      case WORLD_SORT.DATE:
        worlds.sort((a, b) =>
          a.updated && b.updated && a.updated < b.updated ? 1 : -1
        )
        break
      case WORLD_SORT.NAME:
      default:
        worlds.sort((a, b) => (a.title > b.title ? 1 : -1))
    }
  }

  return worlds
}

const useWorld = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): World | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).worlds.where({ id: worldId }).first(),
    deps || [],
    undefined
  )

export { useWorld }

export default useWorlds
