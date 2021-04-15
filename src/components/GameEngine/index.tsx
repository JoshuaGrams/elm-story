import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { GameId, GameState, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { useGame, useJumps, useVariables } from '../../hooks'

import ChapterRenderer from './ChapterRenderer'
import GameStateView from './GameStateView'

const GameEngine: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  const game = useGame(studioId, gameId, [studioId, gameId]),
    variables = useVariables(studioId, gameId, [studioId, gameId]),
    jumps = useJumps(studioId, gameId, [studioId, gameId])

  const { engine, engineDispatch } = useContext(EngineContext)

  useEffect(() => {
    logger.info(`GameEngine->game,jumps->useEffect`)

    if (game && variables && jumps) {
      if (game.jump) {
        const foundJump = jumps?.find((jump) => jump.id === game.jump)

        engineDispatch({
          type: ENGINE_ACTION_TYPE.PASSAGE_START,
          startingPassage: foundJump?.route[2] || null
        })

        engineDispatch({
          type: ENGINE_ACTION_TYPE.SCENE_START,
          startingScene: foundJump?.route[1] || null
        })

        engineDispatch({
          type: ENGINE_ACTION_TYPE.CHAPTER_START,
          startingChapter: foundJump?.route[0] || null
        })
      }

      if (!game.jump) {
        if (game.chapters.length > 0) {
          engineDispatch({
            type: ENGINE_ACTION_TYPE.PASSAGE_START,
            startingPassage: null
          })

          engineDispatch({
            type: ENGINE_ACTION_TYPE.SCENE_START,
            startingScene: null
          })

          engineDispatch({
            type: ENGINE_ACTION_TYPE.CHAPTER_START,
            startingChapter: game.chapters[0]
          })
        }
      }

      if (game.chapters.length === 0) {
        engineDispatch({
          type: ENGINE_ACTION_TYPE.CHAPTER_START,
          startingChapter: null
        })

        engineDispatch({
          type: ENGINE_ACTION_TYPE.CHAPTER_CURRENT,
          currentChapter: null
        })
      }
    }
  }, [game, jumps])

  useEffect(() => {
    logger.info(`GameEngine->variables->useEffect`)

    if (variables) {
      const newGameState: GameState = {}

      variables.map((variable) => {
        if (variable.id) {
          newGameState[variable.id] = {
            title: variable.title,
            type: variable.type,
            defaultValue: `${variable.defaultValue}`,
            currentValue: `${
              newGameState[variable.id]?.currentValue || variable.defaultValue
            }`
          }
        }
      })

      engineDispatch({
        type: ENGINE_ACTION_TYPE.GAME_STATE,
        gameState: newGameState
      })
    }
  }, [variables])

  useEffect(() => {
    logger.info(`GameEngine->engine.gameState->useEffect`)
  }, [variables, engine.gameState])

  return (
    <>
      {game && variables && jumps && (
        <div className="elm-story-engine">
          {(engine.currentChapter || engine.startingChapter) && (
            <ChapterRenderer
              studioId={studioId}
              gameId={gameId}
              // @ts-ignore: We are checking this.
              chapterId={engine.currentChapter || engine.startingChapter}
            />
          )}

          {game.chapters.length === 0 && (
            <div>
              Game requires at least 1 chapter, scene and passage to play.
            </div>
          )}

          <GameStateView />
        </div>
      )}
    </>
  )
}

export default GameEngine
