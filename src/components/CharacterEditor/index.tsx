import React from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { Tabs } from 'antd'

import CharacterInfo from './CharacterInfo'
import CharacterPersonality from './CharacterPersonality'

enum TAB_TYPE {
  INFO = 'INFO',
  PERSONALITY = 'PERSONALITY'
}

import styles from './styles.module.less'

const CharacterEditor: React.FC<{
  studioId: StudioId
  gameId: GameId
  characterId: ComponentId
}> = ({ studioId, gameId, characterId }) => {
  // get character data

  return (
    <div className={styles.CharacterEditor}>
      <Tabs defaultActiveKey={TAB_TYPE.INFO}>
        <Tabs.TabPane tab="Info" key={TAB_TYPE.INFO}>
          <CharacterInfo studioId={studioId} gameId={gameId} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Personality" key={TAB_TYPE.PERSONALITY}>
          <CharacterPersonality studioId={studioId} gameId={gameId} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

CharacterEditor.displayName = 'CharacterEditor'

export default CharacterEditor
