import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ElementId, WorldId, Route, StudioId } from '../data/types'

export async function getRoute(studioId: StudioId, routeId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getRoute(routeId)
  } catch (error) {
    throw error
  }
}

export async function getRoutesByGameRef(
  studioId: StudioId,
  gameId: WorldId
): Promise<Route[]> {
  try {
    return await new LibraryDatabase(studioId).getRoutesByGameRef(gameId)
  } catch (error) {
    throw error
  }
}

export async function getPassthroughRoutesByPassageRef(
  studioId: StudioId,
  passageId: ElementId
) {
  try {
    const foundRoutes = await new LibraryDatabase(studioId).routes
      .where({ originId: passageId })
      .toArray()

    return foundRoutes.filter((foundRoute) => foundRoute.choiceId === undefined)
  } catch (error) {
    throw error
  }
}

export async function saveRoute(
  studioId: StudioId,
  route: Route
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

export async function removeRoutesByPassageRef(
  studioId: StudioId,
  passageId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).removeRoutesByPassageRef(passageId)
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
