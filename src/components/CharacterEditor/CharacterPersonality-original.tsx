import React, { useEffect, useState } from 'react'

import {
  Character,
  CharacterMood,
  GameId,
  StudioId,
  CHARACTER_MOOD_TYPE,
  CHARACTER_TEMPERAMENT_VALUES
} from '../../data/types'

import { Divider, Dropdown, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'
import CharacterPortrait from './CharacterPortrait'

const MoodHeader: React.FC<{
  selectedMoods: CharacterMood[]
  onMoodSelect: (selectedMood: CHARACTER_MOOD_TYPE, remove: boolean) => void
}> = ({ selectedMoods, onMoodSelect }) => {
  const menu: JSX.Element = (
    <div className="mood-select-menu">
      {Object.keys(CHARACTER_MOOD_TYPE)
        .filter((moodType) => moodType !== CHARACTER_MOOD_TYPE.NEUTRAL)
        .map((moodType) => {
          const isSelectedMood = selectedMoods.find(
            (selectedMood) => selectedMood.type === moodType
          )
            ? true
            : false

          return (
            <Tag
              onClick={() =>
                onMoodSelect(moodType as CHARACTER_MOOD_TYPE, isSelectedMood)
              }
              className={`${isSelectedMood ? 'selected-mood' : ''}`}
              key={moodType}
            >
              {moodType}
            </Tag>
          )
        })}
    </div>
  )

  return (
    <div className={`${styles.header} ${styles.MoodHeader}`}>
      <Divider style={{ marginTop: '0' }} className={styles.title}>
        <Dropdown
          overlay={menu}
          trigger={['click']}
          className={styles.dropdown}
          placement="bottomCenter"
        >
          <span className={styles.title}>
            Moods <PlusOutlined />
          </span>
        </Dropdown>
      </Divider>
    </div>
  )
}

MoodHeader.displayName = 'MoodHeader'

function getTemperValues(selectedMoods: CharacterMood[]) {
  let temperValue = { desire: 0, energy: 0 }

  selectedMoods.map((selectedMood) => {
    temperValue.desire += CHARACTER_TEMPERAMENT_VALUES[selectedMood.type][0]
    temperValue.energy += CHARACTER_TEMPERAMENT_VALUES[selectedMood.type][1]
  })

  temperValue.desire = (temperValue.desire / 5) * 100
  temperValue.energy = (temperValue.energy / 5) * 100

  console.log(temperValue)

  return temperValue
}

const CharacterPersonality: React.FC<{
  studioId: StudioId
  gameId: GameId
  character: Character
}> = ({ studioId, gameId, character }) => {
  const [selectedMoods, setSelectedMoods] = useState<CharacterMood[]>([]),
    [temperValues, setTemperValues] = useState({ desire: 0, energy: 0 })

  const addSelectedMood = async (selectedMood: CHARACTER_MOOD_TYPE) => {
    await api().characters.saveCharacter(studioId, {
      ...character,
      moods: [...character.moods, { type: selectedMood, imageId: undefined }]
    })
  }

  const removeMood = async (moodToRemove: CHARACTER_MOOD_TYPE) => {
    // TODO: what happens if the baseMood is removed?
    api().characters.saveCharacter(studioId, {
      ...character,
      moods: character.moods.filter((mood) => mood.type !== moodToRemove)
    })
  }

  useEffect(() => {
    setSelectedMoods([
      character.baseMood,
      ...character.moods.filter((mood) => mood.type !== character.baseMood.type)
    ])
  }, [character.baseMood, character.moods])

  useEffect(() => {
    setTemperValues(getTemperValues(selectedMoods))

    const temperValues = getTemperValues(selectedMoods)

    // console.log(temperValues)

    const desireTemperValueArray: Array<[CHARACTER_MOOD_TYPE, number]> = [],
      energyTemperValueArray: Array<[CHARACTER_MOOD_TYPE, number]> = []

    selectedMoods.map((selectedMood) => {
      desireTemperValueArray.push([
        selectedMood.type,
        CHARACTER_TEMPERAMENT_VALUES[selectedMood.type][0] * 100
      ])
      energyTemperValueArray.push([
        selectedMood.type,
        CHARACTER_TEMPERAMENT_VALUES[selectedMood.type][1] * 100
      ])
    })

    console.log(desireTemperValueArray)

    if (
      desireTemperValueArray.length > 0 &&
      energyTemperValueArray.length > 0
    ) {
      // dominate mask (desire)
      console.log(
        desireTemperValueArray.reduce((prev, curr) =>
          Math.abs(curr[1] - temperValues.desire) <
          Math.abs(prev[1] - temperValues.desire)
            ? curr
            : prev
        )
      )

      // dominate mask (energy)
      console.log(
        energyTemperValueArray.reduce((prev, curr) =>
          Math.abs(curr[1] - temperValues.energy) <
          Math.abs(prev[1] - temperValues.energy)
            ? curr
            : prev
        )
      )
    }
  }, [selectedMoods])

  return (
    <div className={styles.CharacterPersonality}>
      <div className={styles.Temperament}>
        <div className={styles.header}>
          <Divider className={styles.title}>Temperament</Divider>
        </div>

        <div className={`${styles.bar} ${styles.desire}`}>
          <div className={styles.title}>DESIRABLE</div>

          <div className={styles.wrapper}>
            <div
              className={`${styles.negative}`}
              style={{
                width: `${
                  temperValues.desire > 0 ? 0 : temperValues.desire * -1
                }%`
              }}
            />
            <div className={styles.divider} />
            <div
              className={`${styles.positive}`}
              style={{
                width: `${temperValues.desire < 0 ? 0 : temperValues.desire}%`
              }}
            />
          </div>
        </div>

        <div className={`${styles.bar} ${styles.energy}`}>
          <div className={styles.title}>ENERGETIC</div>

          <div className={styles.wrapper}>
            <div
              className={`${styles.negative}`}
              style={{
                width: `${
                  temperValues.energy > 0 ? 0 : temperValues.energy * -1
                }%`
              }}
            />
            <div className={styles.divider} />
            <div
              className={`${styles.positive}`}
              style={{
                width: `${temperValues.energy < 0 ? 0 : temperValues.energy}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.Moods}>
        <MoodHeader
          selectedMoods={character.moods}
          onMoodSelect={(selectedMood, remove) =>
            remove ? removeMood(selectedMood) : addSelectedMood(selectedMood)
          }
        />

        <div className={styles.moodGrid}>
          {selectedMoods.map((mood) => (
            <CharacterPortrait
              mood={mood}
              width="100%"
              onRemove={removeMood}
              key={mood.type}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
