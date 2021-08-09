import logger from '../../lib/logger'

import React from 'react'

import { Game, StudioId } from '../../data/types'

import TitleBar from './TitleBar'

import styles from './styles.module.less'

const GameOutlineNext: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  return (
    <div className={styles.GameOutline}>
      {game.id && (
        <TitleBar
          studioId={studioId}
          game={game}
          onAdd={(gameId) => logger.info(`GameOutlineNext->onAdd:${gameId}`)}
        />
      )}
    </div>
  )
}

export default GameOutlineNext
