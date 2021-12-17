import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import {
  Scene,
  ElementId,
  StudioId,
  WorldId,
  SceneParentRef,
  SceneChildRefs
} from '../data/types'

export async function getScene(studioId: StudioId, sceneId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getScene(sceneId)
  } catch (error) {
    throw error
  }
}

export async function saveScene(
  studioId: StudioId,
  scene: Scene
): Promise<ElementId> {
  if (!scene.id) scene.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveScene(scene)
  } catch (error) {
    throw error
  }
}

export async function removeScene(studioId: StudioId, sceneId: ElementId) {
  try {
    await new LibraryDatabase(studioId).removeScene(sceneId)
  } catch (error) {
    throw error
  }
}

export async function getScenesByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Scene[]> {
  try {
    return await new LibraryDatabase(studioId).getScenesByWorldRef(worldId)
  } catch (error) {
    throw error
  }
}

export async function getChildRefsBySceneRef(
  studioId: StudioId,
  sceneId: ElementId
): Promise<SceneChildRefs> {
  try {
    return await new LibraryDatabase(studioId).getChildRefsBySceneRef(sceneId)
  } catch (error) {
    throw error
  }
}

export async function saveSceneTitle(
  studioId: StudioId,
  sceneId: ElementId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveElementTitle(
      sceneId,
      LIBRARY_TABLE.SCENES,
      title
    )
  } catch (error) {
    throw error
  }
}

export async function saveSceneViewTransform(
  studioId: StudioId,
  sceneId: ElementId,
  transform: { x: number; y: number; zoom: number }
) {
  try {
    await new LibraryDatabase(studioId).saveSceneViewTransform(
      sceneId,
      transform
    )
  } catch (error) {
    throw error
  }
}

export async function saveParentRefToScene(
  studioId: StudioId,
  parent: SceneParentRef,
  sceneId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).saveParentRefToScene(parent, sceneId)
  } catch (error) {
    throw error
  }
}

export async function saveChildRefsToScene(
  studioId: StudioId,
  sceneId: ElementId,
  children: SceneChildRefs
) {
  try {
    await new LibraryDatabase(studioId).saveChildRefsToScene(sceneId, children)
  } catch (error) {
    throw error
  }
}
