import {
  CharacterMask,
  CHARACTER_MASK_TYPE,
  CHARACTER_MASK_VALUES
} from '../data/types'

import { Area } from 'react-easy-crop/types'

export const getCharacterPersonalityMakeup = (activeMasks: CharacterMask[]) => {
  let value = { desire: 0, energy: 0 }

  activeMasks.map((activeMask) => {
    value.desire += CHARACTER_MASK_VALUES[activeMask.type][0]
    value.energy += CHARACTER_MASK_VALUES[activeMask.type][1]
  })

  value.desire = (value.desire / 5) * 100
  value.energy = (value.energy / 5) * 100

  return value
}

export const getCharacterDominateMakeup = (activeMasks: CharacterMask[]) => {
  const makeup = getCharacterPersonalityMakeup(activeMasks)

  const desireSearchArray: Array<[CHARACTER_MASK_TYPE, number]> = [
      [CHARACTER_MASK_TYPE.NEUTRAL, 0]
    ],
    energySearchArray: Array<[CHARACTER_MASK_TYPE, number]> = [
      [CHARACTER_MASK_TYPE.NEUTRAL, 0]
    ]

  activeMasks.map((activeMask) => {
    desireSearchArray.push([
      activeMask.type,
      CHARACTER_MASK_VALUES[activeMask.type][0] * 100
    ])

    energySearchArray.push([
      activeMask.type,
      CHARACTER_MASK_VALUES[activeMask.type][1] * 100
    ])
  })

  if (desireSearchArray.length > 0 && energySearchArray.length > 0) {
    return {
      aggregate: makeup,
      dominate: {
        desire: desireSearchArray.reduce((prev, curr) =>
          Math.abs(curr[1] - makeup.desire) < Math.abs(prev[1] - makeup.desire)
            ? curr
            : prev
        )[0],
        energy: energySearchArray.reduce((prev, curr) =>
          Math.abs(curr[1] - makeup.energy) < Math.abs(prev[1] - makeup.energy)
            ? curr
            : prev
        )[0]
      }
    }
  }

  return {
    aggregate: makeup,
    dominate: {
      desire: CHARACTER_MASK_TYPE.NEUTRAL,
      energy: CHARACTER_MASK_TYPE.NEUTRAL
    }
  }
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))

    image.src = url
  })

export const getCroppedImageData = async (
  src: string,
  pixelCrop: Area
): Promise<{ data: Blob | null; url: string } | null> => {
  const image = await createImage(src),
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d')

  canvas.width = 200
  canvas.height = 250

  context?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    200,
    250
  )

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve({ data: file, url: canvas.toDataURL('image/jpeg') })
    }, 'image/jpeg')
  })
}
