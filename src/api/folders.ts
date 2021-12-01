import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import {
  Folder,
  ElementId,
  WorldId,
  StudioId,
  FolderChildRefs,
  FolderParentRef
} from '../data/types'

export async function getFolder(studioId: StudioId, folderId: ElementId) {
  try {
    return await new LibraryDatabase(studioId).getFolder(folderId)
  } catch (error) {
    throw error
  }
}

export async function saveFolder(
  studioId: StudioId,
  folder: Folder
): Promise<ElementId> {
  if (!folder.id) folder.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveFolder(folder)
  } catch (error) {
    throw error
  }
}

export async function removeFolder(studioId: StudioId, folderId: ElementId) {
  try {
    await new LibraryDatabase(studioId).removeFolder(folderId)
  } catch (error) {
    throw error
  }
}

export async function getFoldersByWorldRef(
  studioId: StudioId,
  worldId: WorldId
): Promise<Folder[]> {
  try {
    return await new LibraryDatabase(studioId).getFoldersByWorldRef(worldId)
  } catch (error) {
    throw error
  }
}

export async function getChildRefsByFolderRef(
  studioId: StudioId,
  folderId: ElementId
): Promise<FolderChildRefs> {
  try {
    return await new LibraryDatabase(studioId).getChildRefsByFolderRef(folderId)
  } catch (error) {
    throw error
  }
}

export async function saveFolderTitle(
  studioId: StudioId,
  folderId: ElementId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveElementTitle(
      folderId,
      LIBRARY_TABLE.FOLDERS,
      title
    )
  } catch (error) {
    throw error
  }
}

export async function saveParentRefToFolder(
  studioId: StudioId,
  parent: FolderParentRef,
  folderId: ElementId
) {
  try {
    await new LibraryDatabase(studioId).saveParentRefToFolder(parent, folderId)
  } catch (error) {
    throw error
  }
}

export async function saveChildRefsToFolder(
  studioId: StudioId,
  folderId: ElementId,
  children: FolderChildRefs
) {
  try {
    await new LibraryDatabase(studioId).saveChildRefsToFolder(
      folderId,
      children
    )
  } catch (error) {
    throw error
  }
}
