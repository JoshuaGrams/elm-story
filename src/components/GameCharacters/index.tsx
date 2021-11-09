import React from 'react'

import { GameId, StudioId } from '../../data/types'

import styles from './styles.module.less'

const GameCharacters: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  return <div className={styles.GameCharacters}>characters</div>
}

GameCharacters.displayName = 'GameCharacters'

export default GameCharacters
