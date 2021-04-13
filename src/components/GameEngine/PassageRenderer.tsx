import logger from '../../lib/logger'

import React, { useContext } from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import { usePassage, useRoutesByPassageRef } from '../../hooks'

import ChoicesRenderer from './ChoicesRenderer'

const PassageRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  passageId: ComponentId
}> = ({ studioId, gameId, passageId }) => {
  const passage = usePassage(studioId, passageId, [studioId, passageId]),
    routes = passageId
      ? useRoutesByPassageRef(studioId, passageId, [studioId, passageId])
      : undefined

  const { engine } = useContext(EngineContext)

  function onChoice(choiceId: ComponentId) {
    logger.info(`PassageRenderer->onChoice->${choiceId}`)
  }

  return (
    <>
      {passage && (
        <>
          <div>{passage.title}</div>

          {passage.choices.length === 0 && <div>Game Over</div>}

          {passage.choices.length > 0 && (
            <ChoicesRenderer
              studioId={studioId}
              gameId={gameId}
              passageId={passageId}
              onChoice={onChoice}
            />
          )}
        </>
      )}
    </>
  )
}

export default PassageRenderer
