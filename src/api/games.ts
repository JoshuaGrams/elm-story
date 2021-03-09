import { LibraryDatabase } from '../db'
import { v4 as uuid } from 'uuid'

import { StudioId, Game, GameId, ComponentId } from '../data/types'

import api from '.'

export async function getGame(
  studioId: StudioId,
  gameId: GameId
): Promise<Game> {
  try {
    return await new LibraryDatabase(studioId).getGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}

export async function getGames(
  studioId: StudioId,
  gameRefs: GameId[]
): Promise<(Game | undefined)[]> {
  return await new LibraryDatabase(studioId).games.bulkGet(gameRefs)
}

export async function saveGame(
  studioId: StudioId,
  game: Game
): Promise<GameId> {
  if (!game.id) game.id = uuid()

  game.updated = Date.now()

  try {
    await api().studios.saveGameRef(studioId, game.id)

    return await new LibraryDatabase(studioId).saveGame(game)
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveChapterRefsToGame(
  studioId: StudioId,
  gameId: GameId,
  chapters: ComponentId[]
) {
  try {
    await new LibraryDatabase(studioId).saveChapterRefsToGame(gameId, chapters)
  } catch (error) {
    throw new Error(error)
  }
}

export async function removeGame(studioId: StudioId, gameId: GameId) {
  try {
    await api().studios.removeGameRef(studioId, gameId)

    await new LibraryDatabase(studioId).removeGame(gameId)
  } catch (error) {
    throw new Error(error)
  }
}
