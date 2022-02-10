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
import {
  BorderInnerOutlined,
  FileImageOutlined,
  ImportOutlined
} from '@ant-design/icons'

export enum IMPORT_IMAGE_TYPE {
  INLINE = 'INLINE'
}

export interface CroppedImage {
  type?: IMPORT_IMAGE_TYPE
  data: Blob | null
  url: string
}

const ImportAndCropImage = React.forwardRef<
  { import: (type?: IMPORT_IMAGE_TYPE) => void },
  {
    cropping: boolean
    showGrid?: boolean
    cropAreaStyle?: React.CSSProperties
    containerStyle?: React.CSSProperties
    controlStyle?: React.CSSProperties
    aspectRatio?: number
    size: { width: number; height: number }
    quality?: number
    onImportImageData: () => void
    onImportImageCropComplete: (image: CroppedImage | null) => void
    onSelectNewImage: () => void
  }
>(
  (
    {
      cropping,
      showGrid,
      cropAreaStyle,
      containerStyle,
      controlStyle,
      aspectRatio,
      size,
      quality,
      onImportImageData,
      onImportImageCropComplete,
      onSelectNewImage
    },
    ref
  ) => {
    const importImageInputRef = useRef<HTMLInputElement>(null)

    const [imageType, setImageType] = useState<IMPORT_IMAGE_TYPE | null>(null),
      [imageData, setImageData] = useState<string | ArrayBuffer | null>(null),
      [crop, setCrop] = useState({ x: 0, y: 0 }),
      [zoom, setZoom] = useState(1),
      [gridEnabled, setGridEnabled] = useState(false),
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
      if (imageData && croppedAreaPixels) {
        const croppedImageData = await getCroppedImageData(
          imageData as string,
          croppedAreaPixels,
          size,
          'webp',
          quality
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
      if (imageData) {
        setCrop({ x: 0, y: 0 })
        setZoom(1)

        onImportImageData()
      }
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
                    showGrid={showGrid || gridEnabled}
                    crop={crop}
                    zoom={zoom}
                    // cropSize={size}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    objectFit="horizontal-cover"
                    // onCropChange={(location) => {
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

                <div className={styles.controls} style={{ ...controlStyle }}>
                  <Slider
                    min={1}
                    max={3}
                    step={0.05}
                    tooltipVisible={false}
                    onChange={(value) => setZoom(value)}
                    value={zoom}
                    className={styles.slider}
                  />

                  <div className={styles.buttons}>
                    <Button
                      className={styles.side}
                      onClick={() => setGridEnabled(!gridEnabled)}
                      title={gridEnabled ? 'Disable grid' : 'Enable grid'}
                    >
                      <BorderInnerOutlined
                        className={gridEnabled ? styles.enabled : ''}
                      />
                    </Button>

                    <div className={styles.middle}>
                      <Button onClick={() => onImportImageCropComplete(null)}>
                        Cancel
                      </Button>

                      <Button
                        onClick={onSave}
                        className={styles.save}
                        type="primary"
                      >
                        Save
                      </Button>
                    </div>

                    <Button
                      className={styles.side}
                      title="Replace image"
                      onClick={onSelectNewImage}
                    >
                      <ImportOutlined />
                    </Button>
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
