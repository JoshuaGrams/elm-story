import { LibraryDatabase, LIBRARY_TABLE } from '../db'
import { v4 as uuid } from 'uuid'

import {
  Folder,
  ComponentId,
  GameId,
  StudioId,
  FolderChildRefs
} from '../data/types'

export async function getFolder(studioId: StudioId, folderId: ComponentId) {
  try {
    return await new LibraryDatabase(studioId).getFolder(folderId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveFolder(
  studioId: StudioId,
  chapter: Folder
): Promise<ComponentId> {
  if (!chapter.id) chapter.id = uuid()

  try {
    return await new LibraryDatabase(studioId).saveFolder(chapter)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeFolder(studioId: StudioId, folderId: ComponentId) {
  try {
    await new LibraryDatabase(studioId).removeFolder(folderId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getFoldersByGameRef(
  studioId: StudioId,
  gameId: GameId
): Promise<Folder[]> {
  try {
    return await new LibraryDatabase(studioId).getFoldersByGameRef(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getChildRefsByFolderRef(
  studioId: StudioId,
  folderId: ComponentId
): Promise<FolderChildRefs> {
  try {
    return await new LibraryDatabase(studioId).getChildRefsByFolderRef(folderId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveFolderTitle(
  studioId: StudioId,
  folderId: ComponentId,
  title: string
) {
  try {
    await new LibraryDatabase(studioId).saveComponentTitle(
      folderId,
      LIBRARY_TABLE.FOLDERS,
      title
    )
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveChildRefsToFolder(
  studioId: StudioId,
  folderId: ComponentId,
  children: FolderChildRefs
) {
  try {
    await new LibraryDatabase(studioId).saveChildRefsToFolder(
      folderId,
      children
    )
  } catch (error) {
    throw new Error(error)
  }
}
