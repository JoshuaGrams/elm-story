import React, { useContext, useEffect } from 'react'
import logger from '../../../lib/logger'

import { GameId, StudioId } from '../../../data/types'

import { useGame } from '../../../hooks'

import {
  EngineContext,
  ENGINE_ACTION_TYPE
} from '../../../contexts/EngineContext'

import { Button } from 'antd'

import GameEngine from '../../GameEngine'

export const GameViewTools: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = () => {
  const { engine, engineDispatch } = useContext(EngineContext)

  function onRestartGame() {
    engineDispatch({ type: ENGINE_ACTION_TYPE.GAME_RESTART })
  }

  return (
    <div>
      <Button>Edit Styles</Button>
      <Button>Edit State</Button>
      <Button onClick={onRestartGame}>Restart Game</Button>
      <Button>Export</Button>
    </div>
  )
}

const GameView: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = ({ studioId, gameId }) => {
  const game = useGame(studioId, gameId)

  useEffect(() => {
    logger.info(`GameView->useEffect`)
  }, [])

  return (
    <>
      {game && (
        <>
          <GameEngine studioId={studioId} gameId={gameId} />
        </>
      )}
    </>
  )
}

export default GameView
