import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, WorldId, ElementId, Folder } from '../data/types'

const useFolders = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Folder[] | undefined => {
  const chapters = useLiveQuery(
    () => new LibraryDatabase(studioId).folders.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (chapters) chapters.sort((a, b) => (a.title > b.title ? 1 : -1))

  return chapters
}

const useFolder = (
  studioId: StudioId,
  folderId: ElementId,
  deps?: any[]
): Folder | undefined =>
  useLiveQuery(
    () => new LibraryDatabase(studioId).folders.where({ id: folderId }).first(),
    deps || [],
    undefined
  )

export { useFolder }

export default useFolders
