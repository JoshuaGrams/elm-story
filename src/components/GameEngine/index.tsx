import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { GameId, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { useGame, useJumps } from '../../hooks'

import ChapterView from './ChapterView'

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
      if (!engine.startingChapter && game.jump) {
        const foundJump = jumps?.find((jump) => jump.id === game.jump)

        foundJump?.route[0] &&
          engineDispatch({
            type: ENGINE_ACTION_TYPE.CHAPTER_START,
            startingChapter: foundJump.route[0]
          })
      }

      !engine.startingChapter &&
        !game.jump &&
        engineDispatch({
          type: ENGINE_ACTION_TYPE.CHAPTER_START,
          startingChapter: game?.chapters[0]
        })
    }
  }, [game, jumps])

  return (
    <>
      {game && jumps && engine.startingChapter && (
        <ChapterView
          studioId={studioId}
          gameId={gameId}
          chapterId={engine.currentChapter || engine.startingChapter}
        />
      )}
    </>
  )
}

export default GameEngine
