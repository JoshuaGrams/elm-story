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
import { Button, Slider } from 'antd'

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
      character={character}
      type={type}
      imageId={
        foundMaskIndex !== -1
          ? character.masks[foundMaskIndex].imageId
          : undefined
      }
      active={
        type === CHARACTER_MASK_TYPE.NEUTRAL ||
        (foundMaskIndex !== -1 && character.masks[foundMaskIndex].active)
      }
      dominate={{
        desire: makeup.dominate.desire === type,
        energy: makeup.dominate.energy === type
      }}
      contextMenu
      onChangeMaskImage={(type) => onChangeMaskImage(type)}
      onToggle={async (type) => {
        if (type !== CHARACTER_MASK_TYPE.NEUTRAL) {
          const newMasks = [...character.masks]

          if (foundMaskIndex === -1) {
            try {
              await api().characters.saveCharacter(studioId, {
                ...character,
                masks: [...newMasks, { active: true, type, imageId: undefined }]
              })
            } catch (error) {
              throw error
            }
          }

          if (foundMaskIndex !== -1) {
            newMasks[foundMaskIndex].active = !character.masks[foundMaskIndex]
              .active

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
    show: boolean
    onMaskImageData: () => void
    onMaskImageCropComplete: (
      mask: {
        type: CHARACTER_MASK_TYPE
        data: Blob | null
        url: string
      } | null
    ) => void
  }
>(({ show, onMaskImageData, onMaskImageCropComplete }, ref) => {
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

      resetState()
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

  return (
    <>
      <input
        ref={importMaskImageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onMaskImageSelect}
      />

      {show && (
        <div className={styles.ImportMaskImage}>
          {maskType}

          {maskImageData && (
            <div className={styles.cropContainer}>
              <Cropper
                style={{
                  cropAreaStyle: {
                    color: 'hsla(0, 0%, 3%, 0.90)'
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
          )}

          <div style={{ height: '24px ' }}>
            <Slider
              min={1}
              max={3}
              step={0.05}
              tooltipVisible={false}
              onChange={(value) => setZoom(value)}
              value={zoom}
            />

            <Button
              onClick={() => {
                onMaskImageCropComplete(null)

                resetState()
              }}
            >
              Cancel
            </Button>

            <Button onClick={onSave}>Save</Button>
          </div>
        </div>
      )}
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
    aggregate: { desire: 0, energy: 0 },
    dominate: {
      desire: CHARACTER_MASK_TYPE.NEUTRAL,
      energy: CHARACTER_MASK_TYPE.NEUTRAL
    }
  })

  const [cropMaskImage, setCropMaskImage] = useState(false)

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
        show={cropMaskImage}
        onMaskImageData={() => setCropMaskImage(true)}
        onMaskImageCropComplete={async (mask) => {
          if (mask?.data) {
            // TODO: need to find mask in character... if it doesn't exist, create
            // TODO: if an asset already exists, need to replace it
            // TODO: error handling
            const newMasks = [...character.masks],
              foundMaskIndex = newMasks.findIndex(
                (newMask) => newMask.type === mask.type
              )

            if (foundMaskIndex !== -1) {
              const assetId = uuid()

              newMasks[foundMaskIndex].imageId = assetId

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

              console.log(
                await ipcRenderer.invoke(WINDOW_EVENT_TYPE.GET_ASSET_PATH, {
                  studioId,
                  gameId: character.gameId,
                  id: assetId,
                  ext: 'jpeg'
                })
              )
            }
          }

          setCropMaskImage(false)
        }}
      />

      {!cropMaskImage && (
        <div className={styles.CharacterPersonality}>
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

          {/* row 1 col 2; energetic */}
          <div className={styles.bar}>
            <div className={styles.energetic}>
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
            <div className={styles.desirable}>
              <div
                className={styles.negative}
                style={{
                  width: `${
                    makeup.aggregate.desire < 0
                      ? makeup.aggregate.desire * -1
                      : 0
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

          {/* row 2 col 3; desirable*/}
          <div className={styles.bar}>
            <div className={styles.desirable}>
              <div
                className={styles.positive}
                style={{
                  width: `${
                    makeup.aggregate.desire > 0 ? makeup.aggregate.desire : 0
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

          {/* row 3 col 2; energetic */}
          <div className={styles.bar}>
            <div className={styles.energetic}>
              <div
                className={styles.negative}
                style={{
                  height: `${
                    makeup.aggregate.energy < 0
                      ? makeup.aggregate.energy * -1
                      : 0
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
      )}
    </>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
