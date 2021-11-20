import { ipcRenderer } from 'electron'

import React, { useEffect, useState } from 'react'

import {
  CHARACTER_MASK_TYPE,
  CHARACTER_MASK_VALUES,
  GameId,
  StudioId
} from '../../data/types'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { Button, Dropdown } from 'antd'

import styles from './styles.module.less'

const CharacterMask: React.FC<{
  studioId: StudioId
  gameId: GameId
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
  onReset?: (type: CHARACTER_MASK_TYPE) => void
  onToggle?: (type: CHARACTER_MASK_TYPE) => void
}> = React.memo(
  ({
    studioId,
    gameId,
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
    onReset,
    onToggle
  }) => {
    const [maskImagePath, setMaskImagePath] = useState<string | undefined>(
      undefined
    )

    const mask = (
      <div
        className={`${styles.CharacterMask} ${
          dominate?.drive ? styles.dominateDrive : ''
        } ${dominate?.energy ? styles.dominateEnergy : ''} ${
          contextMenu ? styles.interactive : ''
        } ${active ? styles.active : ''}`}
        style={{
          width: width || 'auto',
          height: height || 'auto'
        }}
        onClick={() => onToggle && onToggle(type)}
      >
        <div className={`${styles.wrapper} ${active ? styles.active : ''}`}>
          <div
            className={`${styles.mask} ${active ? styles.active : ''}`}
            style={{
              aspectRatio,
              backgroundImage: maskImagePath ? `url(${maskImagePath})` : ''
            }}
          />

          {overlay && (
            <div
              className={`${styles.overlay} ${styles.type}  ${
                active && styles.active
              }`}
            >
              {type}
            </div>
          )}
        </div>
      </div>
    )

    useEffect(() => {
      async function getMaskImagePath() {
        setMaskImagePath(
          assetId
            ? await ipcRenderer.invoke(WINDOW_EVENT_TYPE.GET_ASSET, {
                studioId,
                gameId,
                id: assetId,
                ext: 'jpeg'
              })
            : undefined
        )
      }

      getMaskImagePath()
    }, [assetId])

    return (
      <>
        {contextMenu && (
          <Dropdown
            disabled={!contextMenu}
            overlayClassName="mask-details-menu"
            placement="topLeft"
            overlay={
              <div className={styles.content}>
                <div className={styles.title}>
                  <h1
                    className={`${active ? styles.active : ''}`}
                    style={{
                      marginBottom:
                        type !== CHARACTER_MASK_TYPE.NEUTRAL ? 'unset' : '0'
                    }}
                  >
                    {type}
                  </h1>
                  {type !== CHARACTER_MASK_TYPE.NEUTRAL && (
                    <h2>
                      <span
                        className={`${styles.drive} ${
                          active ? styles.active : ''
                        } ${dominate?.drive ? styles.dominate : ''}`}
                      >
                        {`${CHARACTER_MASK_VALUES[type][0] > 0 ? '+' : '-'}`}
                        DRIVE
                      </span>{' '}
                      <span
                        className={`${styles.energy} ${
                          active ? styles.active : ''
                        } ${dominate?.energy ? styles.dominate : ''}`}
                      >
                        {`${CHARACTER_MASK_VALUES[type][1] > 0 ? '+' : '-'}`}
                        ENERGY
                      </span>{' '}
                      <span>|</span>{' '}
                      <span className={`${active ? styles.active : ''}`}>
                        {CHARACTER_MASK_VALUES[type][2]}X
                      </span>
                    </h2>
                  )}
                </div>

                <div
                  className={styles.maskImage}
                  style={{
                    backgroundImage: maskImagePath
                      ? `url(${maskImagePath})`
                      : ''
                  }}
                >
                  <div className={styles.buttons}>
                    <div>
                      {type !== CHARACTER_MASK_TYPE.NEUTRAL && (
                        <Button onClick={() => onToggle && onToggle(type)}>
                          {active ? 'Disable' : 'Enable'}
                        </Button>
                      )}

                      <Button
                        onClick={() =>
                          onChangeMaskImage && onChangeMaskImage(type)
                        }
                      >
                        Change
                      </Button>

                      {((active && type !== CHARACTER_MASK_TYPE.NEUTRAL) ||
                        assetId) && (
                        <Button onClick={() => onReset && onReset(type)}>
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            }
            trigger={['contextMenu']}
          >
            {mask}
          </Dropdown>
        )}

        {!contextMenu && mask}
      </>
    )
  }
)

CharacterMask.displayName = 'CharacterMask'

export default CharacterMask
