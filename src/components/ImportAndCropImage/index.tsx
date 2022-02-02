import { getCroppedImageData } from '../../lib'
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'

import { Area } from 'react-easy-crop/types'

import Cropper from 'react-easy-crop'
import { Button, Slider } from 'antd'

import styles from './styles.module.less'

export enum IMPORT_IMAGE_TYPE {
  INLINE = 'INLINE'
}

const ImportAndCropImage = React.forwardRef<
  { import: (type?: IMPORT_IMAGE_TYPE) => void },
  {
    cropping: boolean
    cropAreaStyle?: React.CSSProperties
    containerStyle?: React.CSSProperties
    aspectRatio?: number
    size: { width: number; height: number }
    onImportImageData: () => void
    onImportImageCropComplete: (
      image: {
        type?: IMPORT_IMAGE_TYPE
        data: Blob | null
        url: string
      } | null
    ) => void
  }
>(
  (
    {
      cropping,
      cropAreaStyle,
      containerStyle,
      aspectRatio,
      onImportImageData,
      onImportImageCropComplete,
      size
    },
    ref
  ) => {
    const importImageInputRef = useRef<HTMLInputElement>(null)

    const [imageType, setImageType] = useState<IMPORT_IMAGE_TYPE | null>(null),
      [imageData, setImageData] = useState<string | ArrayBuffer | null>(null),
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
            setImageData(reader.result)
          },
          false
        )

        reader.readAsDataURL(maskImage)
      }
    }

    const onSave = useCallback(async () => {
      console.log('test')
      if (imageData && croppedAreaPixels) {
        console.log('here')
        const croppedImageData = await getCroppedImageData(
          imageData as string,
          croppedAreaPixels,
          size,
          'webp'
        )

        croppedImageData &&
          onImportImageCropComplete({
            type: imageType || undefined,
            ...croppedImageData
          })
      }
    }, [imageType, imageData, croppedAreaPixels])

    const resetState = () => {
      if (importImageInputRef.current) importImageInputRef.current.value = ''

      setImageType(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setImageData(null)
    }

    useImperativeHandle(ref, () => ({
      import: (type) => {
        setImageType(type || null)

        importImageInputRef.current?.click()
      }
    }))

    useEffect(() => {
      imageData && onImportImageData()
    }, [imageData])

    useEffect(() => {
      // TODO: hack; hook into transition complete
      !cropping && setTimeout(resetState, 300)
    }, [cropping])

    return (
      <>
        <input
          ref={importImageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onMaskImageSelect}
        />

        <div
          className={`${styles.ImportAndCropImage} ${
            cropping && imageData ? styles.cropping : ''
          }`}
        >
          <>
            {imageType && <h1>{imageType}</h1>}

            {imageData && (
              <>
                <div className={styles.cropContainer}>
                  <Cropper
                    style={{
                      cropAreaStyle: {
                        color: 'hsla(0, 0%, 0%, 0.9)',
                        ...cropAreaStyle
                      },
                      containerStyle: {
                        ...containerStyle
                      }
                    }}
                    image={imageData as string}
                    showGrid={false}
                    crop={crop}
                    zoom={zoom}
                    // cropSize={size}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    objectFit="horizontal-cover"
                    // onCropChange={(location) => {
                    //   console.log(location)
                    //   console.log(zoom)
                    //   setCrop({
                    //     x: location.x < 0 ? 0 : location.x,
                    //     y: location.y < 0 ? 0 : location.y
                    //   })
                    // }}
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
                    <Button onClick={() => onImportImageCropComplete(null)}>
                      Cancel
                    </Button>

                    <Button onClick={onSave}>Save</Button>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </>
    )
  }
)

ImportAndCropImage.displayName = 'ImportAndCropImage'

export default ImportAndCropImage
