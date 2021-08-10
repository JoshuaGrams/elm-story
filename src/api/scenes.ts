import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import {
  Scene,
  ComponentId,
  StudioId,
  GameId,
  SceneParentRef,
  SceneChildRefs
} from '../data/types'

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

export async function saveParentRefToScene(
  studioId: StudioId,
  parent: SceneParentRef,
  sceneId: ComponentId
) {
  try {
    await new LibraryDatabase(studioId).saveParentRefToScene(parent, sceneId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveChildRefsToScene(
  studioId: StudioId,
  sceneId: ComponentId,
  children: SceneChildRefs
) {
  try {
    await new LibraryDatabase(studioId).saveChildRefsToScene(sceneId, children)
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
