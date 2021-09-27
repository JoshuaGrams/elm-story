import React from 'react'

import { GameId, StudioId } from '../../data/types'

import Runtime from '../../engine/Runtime'

const GameEngine: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  return (
    <>
      {studioId} {gameId}
      <Runtime studioId={studioId} game={{ id: gameId }} />
    </>
  )
}

export default GameEngine
