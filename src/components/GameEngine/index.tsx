import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { GameId, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { useGame, useJumps } from '../../hooks'

import ChapterRenderer from './ChapterRenderer'

const GameEngine: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  const game = useGame(studioId, gameId, [studioId, gameId]),
    jumps = useJumps(studioId, gameId, [studioId, gameId])

  const { engine, engineDispatch } = useContext(EngineContext)

  useEffect(() => {
    logger.info(`GameEngine->game,jumps->useEffect`)

    if (game && jumps) {
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

  return (
    <>
      {game && jumps && (
        <>
          {(engine.currentChapter || engine.startingChapter) && (
            <ChapterRenderer
              studioId={studioId}
              gameId={gameId}
              // @ts-ignore: We are checking this.
              chapterId={engine.currentChapter || engine.startingChapter}
            />
          )}

          <div
            onClick={() =>
              engineDispatch({ type: ENGINE_ACTION_TYPE.GAME_RESTART })
            }
          >
            Restart Game
          </div>

          {game.chapters.length === 0 && (
            <div>
              Game requires at least 1 chapter, scene and passage to play.
            </div>
          )}
        </>
      )}
    </>
  )
}

export default GameEngine
