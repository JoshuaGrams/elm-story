import React from 'react'

import { CHARACTER_MOOD_TYPE } from '../../data/types'

import CharacterPortrait from './CharacterPortrait'

import styles from './styles.module.less'

const portraitDefaults = {
  width: '100%',
  height: '100%',
  aspectRatio: '1/1',
  overlay: true
}

const CharacterPersonality: React.FC = () => {
  return (
    <div className={styles.CharacterPersonality}>
      {/* row 1 col 1 */}
      <div className={`${styles.zone}`}>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.TENSE}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.NERVOUS}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.IRRITATED}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.ANNOYED}
          />
        </div>
      </div>

      {/* row 1 col 2; energetic */}
      <div className={`${styles.bar} ${styles.energetic}`} />

      {/* row 1 col 3 */}
      <div className={`${styles.zone}`}>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.LIVELY}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.EXCITED}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.HAPPY}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.CHEERFUL}
          />
        </div>
      </div>

      {/* row 2 col 1; desireable */}
      <div className={`${styles.bar} ${styles.desirable}`} />

      {/* row 2 col 2 */}
      <div>
        <div className={`${styles.portrait} ${styles.central}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.NEUTRAL}
          />
        </div>
      </div>

      {/* row 2 col 3; desirable*/}
      <div className={`${styles.bar} ${styles.desirable}`} />

      {/* row 3 col 1 */}
      <div className={`${styles.zone}`}>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.WEARY}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.BORED}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.SAD}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.GLOOMY}
          />
        </div>
      </div>

      {/* row 3 col 2; energetic */}
      <div className={`${styles.bar} ${styles.energetic}`} />

      {/* row 3 col 3 */}
      <div className={`${styles.zone}`}>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.RELAXED}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.CAREFREE}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.CALM}
          />
        </div>
        <div className={`${styles.portrait} ${styles.edge}`}>
          <CharacterPortrait
            {...portraitDefaults}
            moodType={CHARACTER_MOOD_TYPE.SERENE}
          />
        </div>
      </div>
    </div>
  )
}

CharacterPersonality.displayName = 'CharacterPersonality'

export default CharacterPersonality
