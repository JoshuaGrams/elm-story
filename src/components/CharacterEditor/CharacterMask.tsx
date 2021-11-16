import React from 'react'

import { CHARACTER_MASK_TYPE } from '../../data/types'

import { Dropdown, Menu } from 'antd'

import styles from './styles.module.less'

const CharacterMask: React.FC<{
  type: CHARACTER_MASK_TYPE
  active?: boolean
  dominate?: { desire: boolean; energy: boolean }
  width?: string
  height?: string
  aspectRatio?: string
  overlay?: boolean
  contextMenu?: boolean
  onChangeMaskImage?: (type: CHARACTER_MASK_TYPE) => void
  onToggle?: (type: CHARACTER_MASK_TYPE) => void
}> = ({
  type,
  active,
  dominate,
  width,
  height,
  aspectRatio = '4/5',
  overlay,
  contextMenu,
  onChangeMaskImage,
  onToggle
}) => {
  return (
    <>
      <Dropdown
        disabled={!contextMenu}
        overlay={
          <Menu>
            <Menu.Item
              key="1"
              onClick={() => onChangeMaskImage && onChangeMaskImage(type)}
            >
              Change Mask Image
            </Menu.Item>
          </Menu>
        }
        trigger={['contextMenu']}
      >
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
      </Dropdown>
    </>
  )
}

CharacterMask.displayName = 'CharacterMask'

export default CharacterMask
