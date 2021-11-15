import React from 'react'

import { CHARACTER_MOOD_TYPE } from '../../data/types'

import styles from './styles.module.less'

const CharacterPortrait: React.FC<{
  moodType: CHARACTER_MOOD_TYPE
  width?: string
  height?: string
  aspectRatio?: string
  overlay?: boolean
  onRemove?: (moodType: CHARACTER_MOOD_TYPE) => void
}> = ({ moodType, width, height, aspectRatio = '4/5', overlay, onRemove }) => {
  return (
    <div
      className={styles.CharacterPortrait}
      style={{
        width: width || 'auto',
        height: height || 'auto'
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.portrait} style={{ aspectRatio }} />
        <div className={`${styles.moodType} ${overlay ? styles.overlay : ''}`}>
          {moodType}
        </div>
      </div>
    </div>
  )
}

CharacterPortrait.displayName = 'CharacterPortrait'

export default CharacterPortrait
