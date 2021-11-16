import React, { useState, useEffect, useRef, useImperativeHandle } from 'react'

import { getCharacterDominateMakeup } from '../../lib/characters'

import {
  Character,
  CharacterMakeup,
  CHARACTER_MASK_TYPE,
  StudioId
} from '../../data/types'

import Cropper from 'react-easy-crop'
import { Slider } from 'antd'

import Mask from './CharacterMask'

import styles from './styles.module.less'

import api from '../../api'

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
      type={type}
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
  { import: () => void },
  {
    show: boolean
    onMaskImageData: () => void
    onMaskImageCropComplete: () => void
  }
>(({ show, onMaskImageData, onMaskImageCropComplete }, ref) => {
  const importMaskImageInputRef = useRef<HTMLInputElement>(null)

  const [maskImageData, setMaskImageData] = useState<
      string | ArrayBuffer | null
    >(null),
    [crop, setCrop] = useState({ x: 0, y: 0 }),
    [zoom, setZoom] = useState(1)

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

  useImperativeHandle(ref, () => ({
    import: () => importMaskImageInputRef.current?.click()
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
          {maskImageData && (
            <div
              style={{
                width: '100%',
                height: '250px',
                bottom: 0
              }}
            >
              <Cropper
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%'
                  },
                  cropAreaStyle: {
                    color: 'hsla(0, 0%, 3%, 0.9)'
                  }
                }}
                image={maskImageData}
                showGrid={false}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onCropComplete={(croppedArea, croppedAreaPixels) =>
                  console.log(croppedAreaPixels)
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

            <button
              onClick={() => {
                if (importMaskImageInputRef.current)
                  importMaskImageInputRef.current.value = ''

                onMaskImageCropComplete()

                setCrop({ x: 0, y: 0 })
                setZoom(1)
                setMaskImageData(null)
              }}
            >
              close
            </button>
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
  const importMaskImageRef = useRef<{ import: () => void }>(null)

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
    onChangeMaskImage: (type: CHARACTER_MASK_TYPE) => {
      console.log(type)
      importMaskImageRef.current?.import()
    }
  }

  return (
    <>
      <ImportMaskImage
        ref={importMaskImageRef}
        show={cropMaskImage}
        onMaskImageData={() => setCropMaskImage(true)}
        onMaskImageCropComplete={() => setCropMaskImage(false)}
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
