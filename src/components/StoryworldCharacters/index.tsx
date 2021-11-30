import React, { useContext, useState, useEffect } from 'react'

import { useCharacters } from '../../hooks'

import {
  Character,
  CHARACTER_MASK_TYPE,
  WorldId,
  StudioId
} from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { CharacterModal } from '../Modal'

import styles from './styles.module.less'
import CharacterMask from '../CharacterManager/CharacterMask'

const CharacterRow: React.FC<{ studioId: StudioId; character: Character }> = ({
  studioId,
  character
}) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  const [selected, setSelected] = useState(false)

  useEffect(() => {
    setSelected(editor.characterModal.id === character.id)
  }, [editor.characterModal.id])

  return (
    <div
      className={`${styles.CharacterRow} ${selected ? styles.selected : ''}`}
      onClick={() =>
        character.id &&
        editorDispatch({
          type: EDITOR_ACTION_TYPE.OPEN_CHARACTER_MODAL,
          characterId: character.id
        })
      }
    >
      <div className={styles.mask}>
        {character.id && (
          <CharacterMask
            studioId={studioId}
            gameId={character.gameId}
            characterId={character.id}
            type={CHARACTER_MASK_TYPE.NEUTRAL}
            overlay={false}
            aspectRatio="4/5"
            active
            assetId={
              character.masks.find(
                (mask) => mask.type === CHARACTER_MASK_TYPE.NEUTRAL
              )?.assetId
            }
          />
        )}
      </div>
      <div className={styles.title}>{character.title}</div>
    </div>
  )
}

CharacterRow.displayName = 'CharacterRow'

const StoryworldCharacters: React.FC<{
  studioId: StudioId
  gameId: WorldId
}> = ({ studioId, gameId }) => {
  const characters = useCharacters(studioId, gameId, [])

  const { editor, editorDispatch } = useContext(EditorContext)

  return (
    <>
      <CharacterModal
        studioId={studioId}
        gameId={gameId}
        characterId={editor.characterModal.id}
        visible={editor.characterModal.visible}
        onCancel={() =>
          editorDispatch({ type: EDITOR_ACTION_TYPE.CLOSE_CHARACTER_MODAL })
        }
      />

      {characters && (
        <div className={styles.StoryworldCharacters}>
          {characters.map((character) => (
            <CharacterRow
              studioId={studioId}
              character={character}
              key={character.id}
            />
          ))}
        </div>
      )}
    </>
  )
}

StoryworldCharacters.displayName = 'StoryworldCharacters'

export default StoryworldCharacters
