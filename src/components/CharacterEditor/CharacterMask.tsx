import { ipcRenderer } from 'electron'

import React, { useEffect, useState } from 'react'

import { CHARACTER_MASK_TYPE, StudioId } from '../../data/types'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { Dropdown, Menu } from 'antd'

import styles from './styles.module.less'

const CharacterMask: React.FC<{
  studioId: StudioId
  character: Character
  type: CHARACTER_MASK_TYPE
  assetId?: string
  active?: boolean
  dominate?: { drive: boolean; energy: boolean }
  width?: string
  height?: string
  aspectRatio?: string
  overlay?: boolean
  contextMenu?: boolean
  onChangeMaskImage?: (type: CHARACTER_MASK_TYPE) => void
  onToggle?: (type: CHARACTER_MASK_TYPE) => void
}> = ({
  studioId,
  character,
  type,
  assetId,
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
  const [maskImagePath, setMaskImagePath] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    async function getMaskImagePath() {
      if (assetId) {
        setMaskImagePath(
          await ipcRenderer.invoke(WINDOW_EVENT_TYPE.GET_ASSET_PATH, {
            studioId,
            gameId: character.gameId,
            id: assetId,
            ext: 'jpeg'
          })
        )
      }
    }

    getMaskImagePath()
  }, [assetId])

  useEffect(() => {
    console.log(maskImagePath)
  }, [maskImagePath])

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
            dominate?.drive && styles.dominateDesire
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
              style={{
                aspectRatio,
                backgroundImage: maskImagePath ? `url(${maskImagePath})` : ''
              }}
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
