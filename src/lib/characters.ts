import {
  CharacterMask,
  CHARACTER_MASK_TYPE,
  CHARACTER_MASK_VALUES
} from '../data/types'

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
