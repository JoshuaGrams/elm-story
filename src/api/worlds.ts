import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import {
  StudioId,
  World,
  WorldId,
  ElementId,
  WorldChildRefs
} from '../data/types'

import api from '.'

export async function getWorld(
  studioId: StudioId,
  worldId: WorldId
): Promise<World> {
  try {
    return await new LibraryDatabase(studioId).getWorld(worldId)
  } catch (error) {
    throw error
  }
}

export async function getWorlds(
  studioId: StudioId,
  worldRefs: WorldId[]
): Promise<(World | undefined)[]> {
  return await new LibraryDatabase(studioId).worlds.bulkGet(worldRefs)
}

export async function saveWorld(
  studioId: StudioId,
  world: World
): Promise<World> {
  if (!world.id) world.id = uuid()

  try {
    await api().studios.saveWorldRef(studioId, world.id)

    return await new LibraryDatabase(studioId).saveWorld(world)
  } catch (error) {
    throw error
  }
}

export async function saveChildRefsToWorld(
  studioId: StudioId,
  worldId: WorldId,
  children: WorldChildRefs
) {
  try {
    await new LibraryDatabase(studioId).saveChildRefsToWorld(worldId, children)
  } catch (error) {
    throw error
  }
}

export async function saveJumpRefToWorld(
  studioId: StudioId,
  worldId: WorldId,
  jumpId: ElementId | null
) {
  try {
    await new LibraryDatabase(studioId).saveJumpRefToWorld(worldId, jumpId)
  } catch (error) {
    throw error
  }
}

export async function removeWorld(studioId: StudioId, worldId: WorldId) {
  try {
    await api().studios.removeWorldRef(studioId, worldId)

    await new LibraryDatabase(studioId).removeWorld(studioId, worldId)
  } catch (error) {
    throw error
  }
}
