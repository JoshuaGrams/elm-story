import React, { useContext, useState, useEffect } from 'react'

import { useCharacters } from '../../hooks'

import {
  Character,
  CHARACTER_MASK_TYPE,
  WorldId,
  StudioId
} from '../../data/types'

import { ComposerContext, COMPOSER_ACTION_TYPE } from '../../contexts/ComposerContext'

import { CharacterModal } from '../Modal'
import CharacterMask from '../CharacterManager/CharacterMask'

import styles from './styles.module.less'

const CharacterRow: React.FC<{ studioId: StudioId; character: Character }> = ({
  studioId,
  character
}) => {
  const { composer: editor, composerDispatch: editorDispatch } = useContext(ComposerContext)

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
          type: COMPOSER_ACTION_TYPE.OPEN_CHARACTER_MODAL,
          characterId: character.id
        })
      }
    >
      <div className={styles.mask}>
        {character.id && (
          <CharacterMask
            studioId={studioId}
            worldId={character.worldId}
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

const WorldCharacters: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = ({ studioId, worldId }) => {
  const characters = useCharacters(studioId, worldId, [])

  const { composer: editor, composerDispatch: editorDispatch } = useContext(ComposerContext)

  return (
    <>
      <CharacterModal
        studioId={studioId}
        worldId={worldId}
        characterId={editor.characterModal.id}
        visible={editor.characterModal.visible}
        onCancel={() =>
          editorDispatch({ type: COMPOSER_ACTION_TYPE.CLOSE_CHARACTER_MODAL })
        }
      />

      {characters && (
        <div className={styles.WorldCharacters}>
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

WorldCharacters.displayName = 'WorldCharacters'

export default WorldCharacters
