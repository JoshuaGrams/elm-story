import { ipcRenderer } from 'electron'
import { v4 as uuid } from 'uuid'

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  useCallback
} from 'react'

import {
  getCharacterDominateMakeup,
  getCroppedImageData
} from '../../lib/characters'

import {
  Character,
  CharacterMakeup,
  CHARACTER_MASK_TYPE,
  StudioId
} from '../../data/types'

import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'
import { Button, Slider, Divider } from 'antd'

import Mask from './CharacterMask'

import styles from './styles.module.less'

import api from '../../api'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

const MaskWrapper: React.FC<{
  studioId: StudioId
  type: CHARACTER_MASK_TYPE
  character: Character
  makeup: CharacterMakeup
  onChangeMaskImage: (type: CHARACTER_MASK_TYPE) => void
}> = ({ studioId, type, character, makeup, onChangeMaskImage }) => {
  const maskDefaults = {
    width: '100%',
    height: '100%',
    aspectRatio: '1/1',
    overlay: true
  }

  const foundMaskIndex = character.masks.findIndex((mask) => mask.type === type)

  return (
    <Mask
      {...maskDefaults}
      studioId={studioId}
      gameId={character.gameId}
      assetId={
        (foundMaskIndex !== -1 && character.masks[foundMaskIndex].assetId) ||
        undefined
      }
      type={type}
      active={foundMaskIndex !== -1 && character.masks[foundMaskIndex].active}
      dominate={{
        drive: makeup.dominate.drive === type,
        energy: makeup.dominate.energy === type
      }}
      contextMenu
      onChangeMaskImage={(type) => onChangeMaskImage(type)}
      onReset={async (type) => {
        const newMasks = [...character.masks]

        if (foundMaskIndex !== -1) {
          try {
            const assetId = newMasks[foundMaskIndex].assetId

            if (type === CHARACTER_MASK_TYPE.NEUTRAL) {
              newMasks[foundMaskIndex].assetId = undefined
            } else {
              newMasks.splice(foundMaskIndex, 1)
            }

            await Promise.all([
              ipcRenderer.invoke(WINDOW_EVENT_TYPE.REMOVE_ASSET, {
                studioId,
                gameId: character.gameId,
                id: assetId,
                ext: 'jpeg'
              }),
              api().characters.saveCharacter(studioId, {
                ...character,
                masks: newMasks
              })
            ])
          } catch (error) {
            throw error
          }
        }
      }}
      onToggle={async (type) => {
        if (type !== CHARACTER_MASK_TYPE.NEUTRAL) {
          const newMasks = [...character.masks]

          if (foundMaskIndex === -1) {
            try {
              await api().characters.saveCharacter(studioId, {
                ...character,
                masks: [...newMasks, { active: true, type, assetId: undefined }]
              })
            } catch (error) {
              throw error
            }
          }

          if (foundMaskIndex !== -1) {
            if (newMasks[foundMaskIndex].assetId) {
              newMasks[foundMaskIndex].active = !character.masks[foundMaskIndex]
                .active
            } else {
              newMasks.splice(foundMaskIndex, 1)
            }

            try {
              await api().characters.saveCharacter(studioId, {
                ...character,
                masks: newMasks
              })
            } catch (error) {
              throw error
            }
          }
        }
      }}
    />
  )
}

const ImportMaskImage = React.forwardRef<
  { import: (type: CHARACTER_MASK_TYPE) => void },
  {
    cropping: boolean
    onMaskImageData: () => void
    onMaskImageCropComplete: (
      mask: {
        type: CHARACTER_MASK_TYPE
        data: Blob | null
        url: string
      } | null
    ) => void
  }
>(({ cropping, onMaskImageData, onMaskImageCropComplete }, ref) => {
  const importMaskImageInputRef = useRef<HTMLInputElement>(null)

  const [maskType, setMaskType] = useState<CHARACTER_MASK_TYPE | null>(null),
    [maskImageData, setMaskImageData] = useState<string | ArrayBuffer | null>(
      null
    ),
    [crop, setCrop] = useState({ x: 0, y: 0 }),
    [zoom, setZoom] = useState(1),
    [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onMaskImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const maskImage = event.target.files[0]

      const reader = new FileReader()

      reader.addEventListener(
        'load',
        () => {
          setMaskImageData(reader.result)
        },
        false
      )

      reader.readAsDataURL(maskImage)
    }
  }

  const onSave = useCallback(async () => {
    if (maskImageData && croppedAreaPixels) {
      const maskData = await getCroppedImageData(
        maskImageData as string,
        croppedAreaPixels
      )

      maskType &&
        maskData &&
        onMaskImageCropComplete({
          type: maskType,
          ...maskData
        })
    }
  }, [maskType, maskImageData, croppedAreaPixels])

  const resetState = () => {
    if (importMaskImageInputRef.current)
      importMaskImageInputRef.current.value = ''

    setMaskType(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setMaskImageData(null)
  }

  useImperativeHandle(ref, () => ({
    import: (type) => {
      setMaskType(type)

      importMaskImageInputRef.current?.click()
    }
  }))

  useEffect(() => {
    maskImageData && onMaskImageData()
  }, [maskImageData])

  useEffect(() => {
    // TODO: hack; hook into transition complete
    !cropping && setTimeout(resetState, 300)
  }, [cropping])

  return (
    <>
      <input
        ref={importMaskImageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onMaskImageSelect}
      />

      <div
        className={`${styles.ImportMaskImage} ${
          cropping && maskImageData ? styles.cropping : ''
        }`}
      >
        <div>
          <h1>{maskType}</h1>

          {maskImageData && (
            <>
              <div className={styles.cropContainer}>
                <Cropper
                  style={{
                    cropAreaStyle: {
                      color: 'hsla(0, 0%, 0%, 0.9)'
                    },
                    containerStyle: {
                      background: 'black'
                    }
                  }}
                  image={maskImageData as string}
                  showGrid={false}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 5}
                  onCropChange={setCrop}
                  onCropComplete={(_, croppedAreaPixels) =>
                    setCroppedAreaPixels(croppedAreaPixels)
                  }
                  onZoomChange={setZoom}
                />
              </div>

              <Slider
                min={1}
                max={3}
                step={0.05}
                tooltipVisible={false}
                onChange={(value) => setZoom(value)}
                value={zoom}
                style={{ marginBottom: '30px' }}
              />

              <div style={{ height: '24px ' }}>
                <div className={styles.buttons}>
                  <Button onClick={() => onMaskImageCropComplete(null)}>
                    Cancel
                  </Button>

                  <Button onClick={onSave}>Save</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
})

const CharacterPersonality: React.FC<{
  studioId: StudioId
  character: Character
}> = ({ studioId, character }) => {
  const importMaskImageRef = useRef<{
    import: (type: CHARACTER_MASK_TYPE) => void
  }>(null)

  const [makeup, setMakeup] = useState<CharacterMakeup>({
    aggregate: { drive: 0, energy: 0 },
    dominate: {
      drive: CHARACTER_MASK_TYPE.NEUTRAL,
      energy: CHARACTER_MASK_TYPE.NEUTRAL
    }
  })

  const [croppingMaskImage, setCroppingMaskImage] = useState(false)

  useEffect(() => {
    setMakeup(
      getCharacterDominateMakeup(character.masks.filter((mask) => mask.active))
    )
  }, [character.masks])

  const maskWrapperDefaults = {
    studioId,
    makeup,
    character,
    onChangeMaskImage: (type: CHARACTER_MASK_TYPE) =>
      importMaskImageRef.current?.import(type)
  }

  return (
    <>
      <ImportMaskImage
        ref={importMaskImageRef}
        cropping={croppingMaskImage}
        onMaskImageData={() => setCroppingMaskImage(true)}
        onMaskImageCropComplete={async (mask) => {
          if (mask?.data) {
            // TODO: error handling
            const newMasks = [...character.masks],
              foundMaskIndex = newMasks.findIndex(
                (newMask) => newMask.type === mask.type
              )

            let assetId: string = uuid()

            if (foundMaskIndex === -1) {
              assetId = uuid()

              newMasks.push({
                type: mask.type,
                active: true,
                assetId: assetId
              })
            }

            if (foundMaskIndex !== -1) {
              if (newMasks[foundMaskIndex].assetId) {
                await ipcRenderer.invoke(WINDOW_EVENT_TYPE.REMOVE_ASSET, {
                  studioId,
                  gameId: character.gameId,
                  id: newMasks[foundMaskIndex].assetId,
                  ext: 'jpeg'
                })
              }

              newMasks[foundMaskIndex].active = true
              newMasks[foundMaskIndex].assetId = assetId
            }

            if (assetId) {
              await ipcRenderer.invoke(WINDOW_EVENT_TYPE.SAVE_ASSET, {
                studioId,
                gameId: character.gameId,
                id: assetId,
                data: await mask.data.arrayBuffer(),
                ext: 'jpeg'
              })

              await api().characters.saveCharacter(studioId, {
                ...character,
                masks: newMasks
              })
            }
          }

          setCroppingMaskImage(false)
        }}
      />

      <div
        className={`${styles.CharacterPersonality} ${
          croppingMaskImage && styles.croppingMaskImage
        }`}
      >
        {/* row 1 col 1 */}
        <div className={`${styles.zone}`}>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.TENSE}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.NERVOUS}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.IRRITATED}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.ANNOYED}
            />
          </div>
        </div>

        {/* row 1 col 2; energy */}
        <div className={styles.bar}>
          <div className={styles.energy}>
            <div
              className={`${styles.value} ${
                makeup.aggregate.energy > 0 ? styles.active : ''
              }`}
            >
              {makeup.aggregate.energy}% <span>Energy</span>
            </div>

            <div
              className={styles.positive}
              style={{
                height: `${
                  makeup.aggregate.energy > 0 ? makeup.aggregate.energy : 0
                }%`
              }}
            />
          </div>
        </div>

        {/* row 1 col 3 */}
        <div className={`${styles.zone}`}>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.LIVELY}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.EXCITED}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.HAPPY}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.CHEERFUL}
            />
          </div>
        </div>

        {/* row 2 col 1; desireable */}
        <div className={styles.bar}>
          <div className={styles.drive}>
            <div
              className={`${styles.value} ${
                makeup.aggregate.drive < 0 ? styles.active : ''
              }`}
            >
              {makeup.aggregate.drive}% <span>Drive</span>
            </div>

            <div
              className={styles.negative}
              style={{
                width: `${
                  makeup.aggregate.drive < 0 ? makeup.aggregate.drive * -1 : 0
                }%`
              }}
            />
          </div>
        </div>

        {/* row 2 col 2 */}
        <div>
          <div className={`${styles.mask} ${styles.central}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.NEUTRAL}
            />
          </div>
        </div>

        {/* row 2 col 3; drive*/}
        <div className={styles.bar}>
          <div className={styles.drive}>
            <div
              className={`${styles.value} ${
                makeup.aggregate.drive > 0 ? styles.active : ''
              }`}
            >
              {makeup.aggregate.drive}% <span>Drive</span>
            </div>

            <div
              className={styles.positive}
              style={{
                width: `${
                  makeup.aggregate.drive > 0 ? makeup.aggregate.drive : 0
                }%`
              }}
            />
          </div>
        </div>

        {/* row 3 col 1 */}
        <div className={`${styles.zone}`}>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.WEARY}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.BORED}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.SAD}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.GLOOMY}
            />
          </div>
        </div>

        {/* row 3 col 2; energy */}
        <div className={styles.bar}>
          <div className={styles.energy}>
            <div
              className={`${styles.value} ${
                makeup.aggregate.energy < 0 ? styles.active : ''
              }`}
            >
              {makeup.aggregate.energy}% <span>Energy</span>
            </div>

            <div
              className={styles.negative}
              style={{
                height: `${
                  makeup.aggregate.energy < 0 ? makeup.aggregate.energy * -1 : 0
                }%`
              }}
            />
          </div>
        </div>

        {/* row 3 col 3 */}
        <div className={`${styles.zone}`}>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.RELAXED}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.CAREFREE}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.CALM}
            />
          </div>
          <div className={`${styles.mask} ${styles.edge}`}>
            <MaskWrapper
              {...maskWrapperDefaults}
              type={CHARACTER_MASK_TYPE.SERENE}
            />
          </div>
        </div>
      </div>
    </>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
