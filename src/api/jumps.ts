import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ElementId, WorldId, Jump, JumpRoute, StudioId } from '../data/types'

export async function getJump(studioId: StudioId, jumpId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getJump(jumpId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getJumpsByGameRef(
  studioId: StudioId,
  gameId: WorldId
): Promise<Jump[]> {
  try {
    return await new LibraryDatabase(studioId).getJumpsByGameRef(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getJumpsBySceneRef(
  studioId: StudioId,
  sceneId: ElementId
): Promise<Jump[]> {
  try {
    return await new LibraryDatabase(studioId).getJumpsBySceneRef(sceneId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getJumpsByPassageRef(
  studioId: StudioId,
  passageId: ElementId
): Promise<Jump[]> {
  try {
    return await new LibraryDatabase(studioId).getJumpsByPassageRef(passageId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveJump(studioId: StudioId, jump: Jump): Promise<Jump> {
  if (!jump.id) jump.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveJump(jump)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveJumpRoute(
  studioId: StudioId,
  jumpId: ElementId,
  jumpRoute: JumpRoute
): Promise<void> {
  try {
    await new LibraryDatabase(studioId).saveJumpRoute(jumpId, jumpRoute)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeJump(studioId: StudioId, jumpId: ElementId) {
  try {
    await new LibraryDatabase(studioId).removeJump(jumpId)
  } catch (error) {
    throw new Error(error)
  }
}
