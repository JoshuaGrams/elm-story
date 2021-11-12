import React, { useContext, useState, useEffect } from 'react'

import { useCharacters } from '../../hooks'

import { Character, GameId, StudioId } from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { CharacterModal } from '../Modal'

import styles from './styles.module.less'

const CharacterRow: React.FC<{ character: Character }> = ({ character }) => {
  const { editor, editorDispatch } = useContext(EditorContext)

  const [selected, setSelected] = useState(false)

  useEffect(() => {
    console.log(selected)
  }, [])

  useEffect(() => {
    console.log(editor.characterModal.id)
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
      <div className={styles.portrait} />
      <div className={styles.title}>
        {character.title}
      </div>
    </div>
  )
}

const GameCharacters: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
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
        <div className={styles.GameCharacters}>
          {characters.map((character) => (
            <CharacterRow character={character} key={character.id} />
          ))}
        </div>
      )}
    </>
  )
}

GameCharacters.displayName = 'GameCharacters'

export default GameCharacters
