import React from 'react'

import { GameId, StudioId } from '../../data/types'

import Runtime from '../../engine/Runtime'

const GameEngine: React.FC<{ studioId: StudioId; gameId: GameId }> = React.memo(
  ({ studioId, gameId }) => {
    return (
      <div id="runtime">
        <Runtime studioId={studioId} game={{ id: gameId }} />
      </div>
    )
  }
)

export default GameEngine
