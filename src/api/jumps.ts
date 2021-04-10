import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { ComponentId, Jump, JumpRoute, StudioId } from '../data/types'

export async function getJump(studioId: StudioId, jumpId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getJump(jumpId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveJump(studioId: StudioId, jump: Jump): Promise<Jump> {
  if (!jump.id) jump.id = uuid()

  jump.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveJump(jump)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveJumpRoute(
  studioId: StudioId,
  jumpId: ComponentId,
  jumpRoute: JumpRoute
): Promise<void> {
  try {
    await new LibraryDatabase(studioId).saveJumpRoute(jumpId, jumpRoute)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeJump(studioId: StudioId, jumpId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeJump(jumpId)
  } catch (error) {
    throw new Error(error)
  }
}
