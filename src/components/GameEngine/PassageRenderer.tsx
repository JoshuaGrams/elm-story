import React, { useContext } from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import { usePassage } from '../../hooks'

import ChoicesRenderer from './ChoicesRenderer'

const PassageRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  passageId: ComponentId | null
}> = ({ studioId, gameId, passageId }) => {
  const passage = passageId
    ? usePassage(studioId, passageId, [studioId, passageId])
    : undefined

  const { engine } = useContext(EngineContext)

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
            />
          )}
        </>
      )}
    </>
  )
}

export default PassageRenderer
