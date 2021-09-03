import logger from '../../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { GameId, StudioId } from '../../../data/types'

import { useGame } from '../../../hooks'

import {
  EngineContext,
  ENGINE_ACTION_TYPE
} from '../../../contexts/EngineContext'

import { Button } from 'antd'

import GameEngine from '../../GameEngine'

import styles from '../TabContent/styles.module.less'

export const GameViewTools: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = () => {
  const { engine, engineDispatch } = useContext(EngineContext)

  function restartGame() {
    engineDispatch({ type: ENGINE_ACTION_TYPE.GAME_RESTART })
    engineDispatch({
      type: ENGINE_ACTION_TYPE.SCROLL_TO,
      scrollTo: { top: 0, left: 0 }
    })
  }

  return (
    <div>
      <Button
        onClick={() =>
          engineDispatch({ type: ENGINE_ACTION_TYPE.TOGGLE_EXPRESSIONS })
        }
      >
        <span
          className={`${
            engine.highlightExpressions ? styles.enabled : styles.disabled
          }`}
        >
          Highlight Expressions
        </span>
      </Button>
      <Button onClick={restartGame}>Restart</Button>
      <Button
        onClick={() =>
          engineDispatch({ type: ENGINE_ACTION_TYPE.TOGGLE_BLOCKED_CHOICES })
        }
      >
        <span
          className={`${
            engine.showBlockedChoices ? styles.enabled : styles.disabled
          }`}
        >
          Show Blocked Choices
        </span>
      </Button>
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
