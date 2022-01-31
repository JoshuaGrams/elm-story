import {
  Character,
  CharacterMask,
  CHARACTER_MASK_TYPE,
  CHARACTER_MASK_VALUES,
  StudioId,
  WorldId
} from '../data/types'

import { Area } from 'react-easy-crop/types'

import {
  names,
  uniqueNamesGenerator
} from 'unique-names-generator'

import api from '../api'

export const getCharacterPersonalityMakeup = (activeMasks: CharacterMask[]) => {
  let value = { drive: 0, energy: 0 }

  activeMasks.map((activeMask) => {
    value.drive += CHARACTER_MASK_VALUES[activeMask.type][0]
    value.energy += CHARACTER_MASK_VALUES[activeMask.type][1]
  })

  value.drive = ((value.drive / 5) * 100) | 0
  value.energy = ((value.energy / 5) * 100) | 0

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
      Math.round(CHARACTER_MASK_VALUES[activeMask.type][0] * 100)
    ])

    energySearchArray.push([
      activeMask.type,
      Math.round(CHARACTER_MASK_VALUES[activeMask.type][1] * 100)
    ])
  })

  if (desireSearchArray.length > 0 && energySearchArray.length > 0) {
    return {
      aggregate: makeup,
      dominate: {
        drive: desireSearchArray.reduce((prev, curr) =>
          Math.abs(curr[1] - makeup.drive) < Math.abs(prev[1] - makeup.drive)
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
      drive: CHARACTER_MASK_TYPE.NEUTRAL,
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

export const createGenericCharacter = async (
  studioId: StudioId,
  worldId: WorldId
): Promise<Character> =>
  await api().characters.saveCharacter(studioId, {
    description: undefined,
    worldId,
    masks: [
      {
        type: CHARACTER_MASK_TYPE.NEUTRAL,
        active: true
      }
    ],
    refs: [],
    tags: [],
    title: uniqueNamesGenerator({
      dictionaries: [names, names],
      length: 2,
      separator: ' '
    })
  })
