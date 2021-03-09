import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import { Scene, ComponentId, StudioId, GameId } from '../data/types'

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

export async function getScenesByGameId(
  studioId: StudioId,
  gameId: GameId
): Promise<Scene[]> {
  try {
    return await new LibraryDatabase(studioId).getScenesByGameId(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveSceneTitle(
  studioId: StudioId,
  sceneId: ComponentId,
  title: string
) {
  try {
    return await new LibraryDatabase(studioId).saveComponentTitle(
      sceneId,
      LIBRARY_TABLE.SCENES,
      title
    )
  } catch (error) {
    throw new Error(error)
  }
}
