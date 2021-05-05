import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import { Scene, ComponentId, StudioId, GameId } from '../data/types'

export async function getScene(studioId: StudioId, sceneId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getScene(sceneId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveScene(
  studioId: StudioId,
  scene: Scene
): Promise<ComponentId> {
  if (!scene.id) scene.id = uuid()

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

export async function getScenesByGameRef(
  studioId: StudioId,
  gameId: GameId
): Promise<Scene[]> {
  try {
    return await new LibraryDatabase(studioId).getScenesByGameRef(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getPassageRefsBySceneRef(
  studioId: StudioId,
  sceneId: ComponentId
): Promise<ComponentId[]> {
  try {
    return await new LibraryDatabase(studioId).getPassageRefsBySceneRef(sceneId)
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
    await new LibraryDatabase(studioId).saveComponentTitle(
      sceneId,
      LIBRARY_TABLE.SCENES,
      title
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveSceneViewTransform(
  studioId: StudioId,
  sceneId: ComponentId,
  transform: { x: number; y: number; zoom: number }
) {
  try {
    await new LibraryDatabase(studioId).saveSceneViewTransform(
      sceneId,
      transform
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveChapterRefToScene(
  studioId: StudioId,
  chapterId: ComponentId,
  sceneId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).saveChapterRefToScene(
      chapterId,
      sceneId
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function savePassageRefsToScene(
  studioId: StudioId,
  sceneId: ComponentId,
  passages: ComponentId[]
) {
  try {
    await new LibraryDatabase(studioId).savePassageRefsToScene(
      sceneId,
      passages
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveJumpRefsToScene(
  studioId: StudioId,
  sceneId: ComponentId,
  jumps: ComponentId[]
) {
  try {
    await new LibraryDatabase(studioId).saveJumpRefsToScene(sceneId, jumps)
  } catch (error) {
    throw new Error(error)
  }
}
