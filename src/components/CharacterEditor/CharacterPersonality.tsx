import React, { useEffect, useState } from 'react'

import {
  Character,
  CharacterMood,
  GameId,
  StudioId,
  CHARACTER_MOOD_TYPE
} from '../../data/types'

import { Divider, Row, Col, Dropdown, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'

const MoodBox: React.FC<{
  mood: CharacterMood
  onRemove: (moodToRemove: CHARACTER_MOOD_TYPE) => void
}> = ({ mood, onRemove }) => {
  return (
    <Col className={styles.MoodBox}>
      {mood.type}{' '}
      {mood.type !== CHARACTER_MOOD_TYPE.NEUTRAL ? (
        <DeleteOutlined onClick={() => onRemove(mood.type)} />
      ) : (
        ''
      )}
    </Col>
  )
}

MoodBox.displayName = 'MoodBox'

const MoodHeader: React.FC<{
  selectedMoods: CharacterMood[]
  onMoodSelect: (selectedMood: CHARACTER_MOOD_TYPE) => void
}> = ({ selectedMoods, onMoodSelect }) => {
  const availableMoods = Object.keys(CHARACTER_MOOD_TYPE).filter(
    (moodType) =>
      !selectedMoods.find((currentMood) => currentMood.type === moodType)
  )

  const menu: JSX.Element = (
    <div
      className="mood-select-menu"
      style={
        availableMoods.length === 1
          ? { width: '100px', gridTemplateColumns: '100%' }
          : {}
      }
    >
      {availableMoods.map((availableMood) => (
        <Tag onClick={() => onMoodSelect(availableMood as CHARACTER_MOOD_TYPE)}>
          {availableMood}
        </Tag>
      ))}
    </div>
  )

  return (
    <div className={styles.MoodHeader}>
      <Divider style={{ marginTop: '0' }}>
        Moods
        {availableMoods.length > 0 && (
          <>
            {' '}
            <Dropdown
              overlay={menu}
              trigger={['click']}
              className={styles.dropdown}
            >
              <PlusOutlined />
            </Dropdown>
          </>
        )}
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
      moods: [{ type: selectedMood, imageId: undefined }, ...character.moods]
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
        onMoodSelect={addSelectedMood}
      />

      <Row justify="start" className={styles.moods}>
        {selectedMoods.map((mood) => (
          <MoodBox mood={mood} key={mood.type} onRemove={removeMood} />
        ))}
      </Row>
    </div>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
