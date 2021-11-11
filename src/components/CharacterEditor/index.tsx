import React from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { Tabs } from 'antd'

import CharacterInfo from './CharacterInfo'
import CharacterPersonality from './CharacterPersonality'

enum TAB_TYPE {
  INFO = 'INFO',
  PERSONALITY = 'PERSONALITY',
  MENTIONS = 'MENTIONS'
}

import styles from './styles.module.less'
import { useCharacter } from '../../hooks'

const CharacterEditor: React.FC<{
  studioId: StudioId
  gameId: GameId
  characterId: ComponentId
}> = ({ studioId, gameId, characterId }) => {
  const character = useCharacter(studioId, characterId, [characterId])

  return (
    <>
      {character && (
        <div className={styles.CharacterEditor}>
          <Tabs defaultActiveKey={TAB_TYPE.INFO}>
            <Tabs.TabPane tab="Info" key={TAB_TYPE.INFO}>
              <CharacterInfo
                studioId={studioId}
                gameId={gameId}
                character={character}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Personality" key={TAB_TYPE.PERSONALITY}>
              <CharacterPersonality
                studioId={studioId}
                gameId={gameId}
                character={character}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Mentions" key={TAB_TYPE.MENTIONS}>
              Character Mentions
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
    </>
  )
}

CharacterEditor.displayName = 'CharacterEditor'

export default CharacterEditor
