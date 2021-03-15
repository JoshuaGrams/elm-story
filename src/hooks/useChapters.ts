import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, GameId, Chapter, ComponentId } from '../data/types'

const useChapters = (
  studioId: StudioId,
  gameId: GameId
): Chapter[] | undefined => {
  const chapters = useLiveQuery(() =>
    new LibraryDatabase(studioId).chapters.where({ gameId }).toArray()
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (chapters) chapters.sort((a, b) => (a.title > b.title ? 1 : -1))

  return chapters
}

const useChapter = (
  studioId: StudioId,
  chapterId: ComponentId,
  deps?: any[]
): Chapter | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).chapters.where({ id: chapterId }).first(),
    deps || [],
    undefined
  )

export { useChapter }

export default useChapters
