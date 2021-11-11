import React from 'react'

import { useCharacters } from '../../hooks'

import { GameId, StudioId } from '../../data/types'

import styles from './styles.module.less'

const GameCharacters: React.FC<{ studioId: StudioId; gameId: GameId }> = ({
  studioId,
  gameId
}) => {
  const characters = useCharacters(studioId, gameId, [])

  return (
    <>
      {characters && (
        <div className={styles.GameCharacters}>
          {characters.map((character) => (
            <div onClick={() => console.log(character.id)}>
              {character.title}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

GameCharacters.displayName = 'GameCharacters'

export default GameCharacters
