import React from 'react'

import { GameId, StudioId } from '../../data/types'

import styles from './styles.module.less'

const CharacterPersonality: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = ({ studioId, gameId }) => {
  return (
    <div className={styles.CharacterPersonality}>Character Personality</div>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
