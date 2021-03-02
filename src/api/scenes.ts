import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { Scene, ComponentId, StudioId } from '../data/types'

export async function saveScene(
  studioId: StudioId,
  scene: Scene
): Promise<ComponentId> {
  if (!scene.id) scene.id = uuid()

  scene.updated = Date.now()

  try {
    return await new LibraryDatabase(studioId).saveScene(scene)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeScene(studioId: StudioId, sceneId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeScene(sceneId)
  } catch (error) {
    throw new Error(error)
  }
}
