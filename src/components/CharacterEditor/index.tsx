import React, { useContext } from 'react'

import { useCharacter } from '../../hooks'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Button, Tabs } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import CharacterInfo from './CharacterInfo'
import CharacterPersonality from './CharacterPersonality'
import CharacterMentions from './CharacterMentions'

import styles from './styles.module.less'
import api from '../../api'

enum TAB_TYPE {
  INFO = 'INFO',
  PERSONALITY = 'PERSONALITY',
  INVENTORY = 'INVENTORY',
  MENTIONS = 'MENTIONS'
}

const RemoveCharacterButton: React.FC<{ onRemove: () => void }> = ({
  onRemove
}) => {
  return (
    <div className={styles.RemoveCharacterButton} onClick={onRemove}>
      <DeleteOutlined />
    </div>
  )
}

RemoveCharacterButton.displayName = 'RemoveCharacterButton'

const CharacterEditor: React.FC<{
  studioId: StudioId
  gameId: GameId
  characterId: ComponentId
}> = ({ studioId, gameId, characterId }) => {
  const character = useCharacter(studioId, characterId, [characterId])

  const { editor, editorDispatch } = useContext(EditorContext)

  return (
    <>
      {character && (
        <div className={styles.CharacterEditor}>
          <Tabs
            defaultActiveKey={TAB_TYPE.INFO}
            tabBarExtraContent={
              <RemoveCharacterButton
                onRemove={async () => {
                  editorDispatch({
                    type: EDITOR_ACTION_TYPE.CLOSE_CHARACTER_MODAL
                  })

                  api().characters.removeCharacter(studioId, characterId)
                }}
              />
            }
          >
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
            <Tabs.TabPane tab="Inventory" key={TAB_TYPE.INVENTORY}>
              Character Inventory
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
