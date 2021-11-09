import React from 'react'

import { GameId, StudioId } from '../../data/types'

import { Tabs } from 'antd'

import CharacterInfo from './CharacterInfo'
import CharacterPersonality from './CharacterPersonality'

enum TAB_TYPE {
  INFO = 'INFO',
  PERSONALITY = 'PERSONALITY'
}

import styles from './styles.module.less'

const CharacterEditor: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  return (
    <div className={styles.CharacterEditor}>
      <Tabs defaultActiveKey={TAB_TYPE.INFO} centered>
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
