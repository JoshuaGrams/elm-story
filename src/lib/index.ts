import { Area } from 'react-easy-crop/types'
import {
  uniqueNamesGenerator,
  adjectives,
  colors
} from 'unique-names-generator'

export const getSvgUrl = (svg: string) =>
  `data:image/svg+xml;base64,${btoa(svg)}`

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))

    image.src = url
  })

export const getCroppedImageData = async (
  src: string,
  pixelCrop: Area,
  size: {
    width: number
    height: number
  },
  format?: 'png' | 'webp',
  quality?: number
): Promise<{ data: Blob | null; url: string } | null> => {
  const image = await createImage(src),
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d')

  canvas.width = size.width
  canvas.height = size.height

  context?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size.width,
    size.height
  )

  return new Promise((resolve) => {
    canvas.toBlob(
      (file) => {
        resolve({
          data: file,
          url: canvas.toDataURL(`image/${format || 'jpeg'}`)
        })
      },
      `image/${format || 'jpeg'}`,
      quality || 1
    )
  })
}

export const capitalizeString = (text: string) =>
  text.replace(
    /(^\w|\s\w)(\S*)/g,
    (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
  )

export const getRandomElementName = (length?: number) => {
  let randomName = ''

  if (!length) length = 1

  for (let i = 0; i < length; i++) {
    randomName += `${uniqueNamesGenerator({
      dictionaries: [i === 0 ? colors : adjectives],
      length: 1
    })}`

    if (i !== length - 1) randomName += ' '
  }

  return capitalizeString(randomName)
}
