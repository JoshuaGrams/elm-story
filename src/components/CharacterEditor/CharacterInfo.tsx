import React from 'react'

import { GameId, StudioId } from '../../data/types'

import styles from './styles.module.less'

const CharacterInfo: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = ({ studioId, gameId }) => {
  return <div className={styles.CharacterInfo}>Character Info</div>
}

CharacterInfo.displayName = 'CharacterInfo'

export default CharacterInfo
