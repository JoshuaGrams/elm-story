import React, { useEffect, useState } from 'react'

import {
  Character,
  CharacterMood,
  GameId,
  StudioId,
  CHARACTER_MOOD_TYPE
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
    <div className={styles.MoodHeader}>
      <Divider style={{ marginTop: '0' }}>
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

const CharacterPersonality: React.FC<{
  studioId: StudioId
  gameId: GameId
  character: Character
}> = ({ studioId, gameId, character }) => {
  const [selectedMoods, setSelectedMoods] = useState<CharacterMood[]>([])

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

  return (
    <div className={styles.CharacterPersonality}>
      <MoodHeader
        selectedMoods={character.moods}
        onMoodSelect={(selectedMood, remove) =>
          remove ? removeMood(selectedMood) : addSelectedMood(selectedMood)
        }
      />

      <div className={styles.moods}>
        {selectedMoods.map((mood) => (
          <CharacterPortrait
            mood={mood}
            width={86}
            onRemove={removeMood}
            key={mood.type}
          />
        ))}
      </div>
    </div>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
