import React, { useEffect, useState } from 'react'

import { CHARACTER_MASK_TYPE, GameId, StudioId } from '../../../data/types'

import { useCharacter } from '../../../hooks'

import CharacterMask from '../../CharacterEditor/CharacterMask'

const PassagePersona: React.FC<{
  studioId: StudioId
  gameId: GameId
  persona?: [string, CHARACTER_MASK_TYPE]
}> = ({ studioId, gameId, persona }) => {
  const character = useCharacter(studioId, persona?.[0], [persona?.[0]])

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
        <div style={{ width: '100%', height: 'auto' }}>
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

              <div
                style={{
                  position: 'absolute',
                  background: 'hsla(0, 0%, 0%, 0.8',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: '10px'
                }}
              >
                {character.title}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

PassagePersona.displayName = 'PassagePersona'

export default PassagePersona
