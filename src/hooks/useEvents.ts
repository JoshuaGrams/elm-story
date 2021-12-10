import { LibraryDatabase } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

import { StudioId, Event, WorldId, ElementId } from '../data/types'

const useEvents = (
  studioId: StudioId,
  worldId: WorldId,
  deps?: any[]
): Event[] | undefined => {
  const events = useLiveQuery(
    () => new LibraryDatabase(studioId).events.where({ worldId }).toArray(),
    deps || [],
    undefined
  )

  // TODO: sort by how user has ordered them in the editor?
  // TODO:...or don't sort and let editor track order?
  if (events) events.sort((a, b) => (a.title > b.title ? 1 : -1))

  return events
}

const useEventsBySceneRef = (
  studioId: StudioId,
  sceneId: ElementId,
  deps?: any[]
): Event[] | undefined => {
  const events = useLiveQuery(
    () => new LibraryDatabase(studioId).events.where({ sceneId }).toArray(),
    deps || [],
    undefined
  )

  return events
}

const useEvent = (
  studioId: StudioId,
  eventId: ElementId | undefined | null,
  deps?: any[]
): Event | undefined =>
  useLiveQuery(
    () =>
      new LibraryDatabase(studioId).events.where({ id: eventId || '' }).first(),
    deps || [],
    undefined
  )

export { useEventsBySceneRef, useEvent }

export default useEvents
