import React, { useContext } from 'react'

import { Character, GameId, StudioId } from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Tabs } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import CharacterInfo from './CharacterInfo'
import CharacterPersonality from './CharacterPersonality'
import CharacterEvents from './CharacterEvents'

import styles from './styles.module.less'
import api from '../../api'

enum TAB_TYPE {
  INFO = 'INFO',
  PERSONALITY = 'PERSONALITY',
  EVENTS = 'EVENTS'
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
  character: Character
}> = ({ studioId, gameId, character }) => {
  const { editorDispatch } = useContext(EditorContext)

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

                  try {
                    character.id &&
                      (await Promise.all([
                        api().passages.removeDeadPersonasFromEvent(
                          studioId,
                          character.id
                        ),
                        api().characters.removeCharacter(studioId, character.id)
                      ]))
                  } catch (error) {
                    throw error
                  }
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
              <CharacterPersonality studioId={studioId} character={character} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Events" key={TAB_TYPE.EVENTS}>
              <CharacterEvents
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
