import React, { useState, useEffect } from 'react'

import {
  getCharacterDominateMakeup,
  getCharacterPersonalityMakeup
} from '../../lib/characters'

import {
  Character,
  CharacterMakeup,
  CHARACTER_MASK_TYPE,
  StudioId
} from '../../data/types'

import Mask from './CharacterMask'

import styles from './styles.module.less'

import api from '../../api'

const MaskWrapper: React.FC<{
  studioId: StudioId
  type: CHARACTER_MASK_TYPE
  character: Character
  makeup: CharacterMakeup
}> = ({ studioId, type, character, makeup }) => {
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

const CharacterPersonality: React.FC<{
  studioId: StudioId
  character: Character
}> = ({ studioId, character }) => {
  const [makeup, setMakeup] = useState<CharacterMakeup>({
    aggregate: { desire: 0, energy: 0 },
    dominate: {
      desire: CHARACTER_MASK_TYPE.NEUTRAL,
      energy: CHARACTER_MASK_TYPE.NEUTRAL
    }
  })

  useEffect(() => {
    console.log(makeup)
  }, [makeup])

  useEffect(() => {
    setMakeup(
      getCharacterDominateMakeup(character.masks.filter((mask) => mask.active))
    )
  }, [character.masks])

  return (
    <div className={styles.CharacterPersonality}>
      {/* row 1 col 1 */}
      <div className={`${styles.zone}`}>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.TENSE}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.NERVOUS}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.IRRITATED}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.ANNOYED}
            character={character}
            makeup={makeup}
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
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.LIVELY}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.EXCITED}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.HAPPY}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.CHEERFUL}
            character={character}
            makeup={makeup}
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
                makeup.aggregate.desire < 0 ? makeup.aggregate.desire * -1 : 0
              }%`
            }}
          />
        </div>
      </div>

      {/* row 2 col 2 */}
      <div>
        <div className={`${styles.portrait} ${styles.central}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.NEUTRAL}
            character={character}
            makeup={makeup}
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
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.WEARY}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.BORED}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.SAD}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.GLOOMY}
            character={character}
            makeup={makeup}
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
                makeup.aggregate.energy < 0 ? makeup.aggregate.energy * -1 : 0
              }%`
            }}
          />
        </div>
      </div>

      {/* row 3 col 3 */}
      <div className={`${styles.zone}`}>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.RELAXED}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.CAREFREE}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.CALM}
            character={character}
            makeup={makeup}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <MaskWrapper
            studioId={studioId}
            type={CHARACTER_MASK_TYPE.SERENE}
            character={character}
            makeup={makeup}
          />
        </div>
      </div>
    </div>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
