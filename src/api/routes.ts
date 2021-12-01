import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ElementId, WorldId, Path, StudioId } from '../data/types'

export async function getRoute(studioId: StudioId, routeId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getRoute(routeId)
  } catch (error) {
    throw error
  }
}

export async function getRoutesByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Path[]> {
  try {
    return await new LibraryDatabase(studioId).getRoutesByWorldRef(worldId)
  } catch (error) {
    throw error
  }
}

export async function getPassthroughRoutesByEventsRef(
  studioId: StudioId,
  passageId: ElementId
) {
  try {
    const foundRoutes = await new LibraryDatabase(studioId).paths
      .where({ originId: passageId })
      .toArray()

    return foundRoutes.filter((foundRoute) => foundRoute.choiceId === undefined)
  } catch (error) {
    throw error
  }
}

export async function saveRoute(
  studioId: StudioId,
  route: Path
): Promise<ElementId> {
  if (!route.id) route.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveRoute(route)
  } catch (error) {
    throw error
  }
}

export async function removeRoute(studioId: StudioId, routeId: ElementId) {
  try {
    await new LibraryDatabase(studioId).removeRoute(routeId)
  } catch (error) {
    throw error
  }
}

export async function removeRoutesByEventRef(
  studioId: StudioId,
  eventId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).removeRoutesByEventRef(eventId)
  } catch (error) {
    throw error
  }
}

export async function removeRoutesByChoiceRef(
  studioId: StudioId,
  choiceId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).removeRoutesByChoiceRef(choiceId)
  } catch (error) {
    throw error
  }
}
