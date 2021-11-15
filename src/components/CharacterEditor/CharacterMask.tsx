import React from 'react'

import { CHARACTER_MASK_TYPE } from '../../data/types'

import styles from './styles.module.less'

const CharacterMask: React.FC<{
  type: CHARACTER_MASK_TYPE
  active?: boolean
  dominate?: { desire: boolean; energy: boolean }
  width?: string
  height?: string
  aspectRatio?: string
  overlay?: boolean
  onToggle?: (type: CHARACTER_MASK_TYPE) => void
}> = ({
  type,
  active,
  dominate,
  width,
  height,
  aspectRatio = '4/5',
  overlay,
  onToggle
}) => {
  return (
    <div
      className={`${styles.CharacterMask} ${
        dominate?.desire && styles.dominateDesire
      } ${dominate?.energy && styles.dominateEnergy} `}
      style={{
        width: width || 'auto',
        height: height || 'auto'
      }}
      onClick={() => onToggle && onToggle(type)}
    >
      <div className={`${styles.wrapper} ${active && styles.active}`}>
        <div
          className={`${styles.portrait} ${active && styles.active}`}
          style={{ aspectRatio }}
        />
        <div className={`${styles.type} ${overlay ? styles.overlay : ''}`}>
          {type}
        </div>
      </div>
    </div>
  )
}

CharacterMask.displayName = 'CharacterMask'

export default CharacterMask
