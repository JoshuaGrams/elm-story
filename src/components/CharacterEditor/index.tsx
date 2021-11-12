import React from 'react'

import { useCharacter } from '../../hooks'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { Tabs } from 'antd'

import CharacterInfo from './CharacterInfo'
import CharacterPersonality from './CharacterPersonality'
import CharacterMentions from './CharacterMentions'

enum TAB_TYPE {
  INFO = 'INFO',
  PERSONALITY = 'PERSONALITY',
  MENTIONS = 'MENTIONS'
}

import styles from './styles.module.less'

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
              <CharacterMentions
                studioId={studioId}
                gameId={gameId}
                character={character}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
    </>
  )
}

CharacterEditor.displayName = 'CharacterEditor'

export default CharacterEditor
