import React from 'react'

import { Game, StudioId } from '../../data/types'

const GameOutlineNext: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  return <>{game.id && <div>GameOutlineNext</div>}</>
}

export default GameOutlineNext
