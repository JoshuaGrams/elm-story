import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ComponentId, Route, StudioId } from '../data/types'

export async function saveRoute(
  studioId: StudioId,
  route: Route
): Promise<ComponentId> {
  if (!route.id) route.id = uuid()

  route.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveRoute(route)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeRoute(studioId: StudioId, routeId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeRoute(routeId)
  } catch (error) {
    throw new Error(error)
  }
}
