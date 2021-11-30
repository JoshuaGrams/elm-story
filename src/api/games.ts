import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import {
  StudioId,
  Game,
  WorldId,
  ElementId,
  GameChildRefs
} from '../data/types'

import api from '.'

export async function getGame(
  studioId: StudioId,
  gameId: WorldId
): Promise<Game> {
  try {
    return await new LibraryDatabase(studioId).getGame(gameId)
  } catch (error) {
    throw error
  }
}

export async function getGames(
  studioId: StudioId,
  gameRefs: WorldId[]
): Promise<(Game | undefined)[]> {
  return await new LibraryDatabase(studioId).games.bulkGet(gameRefs)
}

export async function saveGame(studioId: StudioId, game: Game): Promise<Game> {
  if (!game.id) game.id = uuid()

  try {
    await api().studios.saveGameRef(studioId, game.id)

    return await new LibraryDatabase(studioId).saveGame(game)
  } catch (error) {
    throw error
  }
}

export async function saveChildRefsToGame(
  studioId: StudioId,
  gameId: WorldId,
  children: GameChildRefs
) {
  try {
    await new LibraryDatabase(studioId).saveChildRefsToGame(gameId, children)
  } catch (error) {
    throw error
  }
}

export async function saveJumpRefToGame(
  studioId: StudioId,
  gameId: WorldId,
  jumpId: ElementId | null
) {
  try {
    await new LibraryDatabase(studioId).saveJumpRefToGame(gameId, jumpId)
  } catch (error) {
    throw error
  }
}

export async function removeGame(studioId: StudioId, gameId: WorldId) {
  try {
    await api().studios.removeGameRef(studioId, gameId)

    await new LibraryDatabase(studioId).removeGame(studioId, gameId)
  } catch (error) {
    throw error
  }
}
