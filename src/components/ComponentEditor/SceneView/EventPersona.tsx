import React, { useEffect, useState, useContext } from 'react'

import { EventPersona, GameId, StudioId } from '../../../data/types'

import { useCharacter } from '../../../hooks'

import {
  EditorContext,
  EDITOR_ACTION_TYPE
} from '../../../contexts/EditorContext'

import CharacterMask from '../../CharacterEditor/CharacterMask'

import styles from './styles.module.less'

const EventPersonaPane: React.FC<{
  studioId: StudioId
  gameId: GameId
  persona?: EventPersona
}> = ({ studioId, gameId, persona }) => {
  const character = useCharacter(studioId, persona?.[0], [persona?.[0]])

  const { editorDispatch } = useContext(EditorContext)

  const [maskAssetId, setMaskAssetId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (persona && character) {
      const foundMask = character.masks.find((mask) => mask.type === persona[1])

      foundMask && setMaskAssetId(foundMask.assetId)
    }
  }, [persona, character])

  return (
    <>
      {persona && (
        <div className={styles.EventPersona}>
          {character?.id && (
            <>
              <CharacterMask
                studioId={studioId}
                gameId={gameId}
                characterId={character.id}
                type={persona[1]}
                width="100%"
                active
                assetId={maskAssetId}
                fill
              />

              <div className={styles.info}>
                <h1>Persona</h1>
                <h2>Character</h2>
                <p>
                  <span
                    className="nodrag"
                    onClick={() =>
                      character.id &&
                      editorDispatch({
                        type: EDITOR_ACTION_TYPE.OPEN_CHARACTER_MODAL,
                        characterId: character.id
                      })
                    }
                  >
                    {character.title}
                  </span>
                </p>
                <h2>Reference</h2>
                <p>{persona[2] || 'N/A'}</p>
                <h2>Mask</h2>
                <p>{persona[1]}</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

EventPersonaPane.displayName = 'EventPersonaPane'

export default EventPersonaPane
