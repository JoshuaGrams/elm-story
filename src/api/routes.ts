import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ComponentId, GameId, Route, StudioId } from '../data/types'

export async function getRoute(studioId: StudioId, routeId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getRoute(routeId)
  } catch (error) {
    throw error
  }
}

export async function getRoutesByGameRef(
  studioId: StudioId,
  gameId: GameId
): Promise<Route[]> {
  try {
    return await new LibraryDatabase(studioId).getRoutesByGameRef(gameId)
  } catch (error) {
    throw error
  }
}

export async function getPassthroughRoutesByPassageRef(
  studioId: StudioId,
  passageId: ComponentId
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
): Promise<ComponentId> {
  if (!route.id) route.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveRoute(route)
  } catch (error) {
    throw error
  }
}

export async function removeRoute(studioId: StudioId, routeId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeRoute(routeId)
  } catch (error) {
    throw error
  }
}

export async function removeRoutesByPassageRef(
  studioId: StudioId,
  passageId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removeRoutesByPassageRef(passageId)
  } catch (error) {
    throw error
  }
}

export async function removeRoutesByChoiceRef(
  studioId: StudioId,
  choiceId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).removeRoutesByChoiceRef(choiceId)
  } catch (error) {
    throw error
  }
}
