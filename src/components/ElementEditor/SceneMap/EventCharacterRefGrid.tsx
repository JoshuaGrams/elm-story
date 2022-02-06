import React, { useContext } from 'react'

import { CHARACTER_MASK_TYPE, ElementId, StudioId } from '../../../data/types'

import { useCharacter } from '../../../hooks'

import {
  ComposerContext,
  COMPOSER_ACTION_TYPE
} from '../../../contexts/ComposerContext'

import CharacterMask from '../../CharacterManager/CharacterMask'

import styles from './styles.module.less'

const CharacterPortrait: React.FC<{
  studioId: StudioId
  characterId: ElementId
}> = ({ studioId, characterId }) => {
  const character = useCharacter(studioId, characterId, [characterId])

  const { composerDispatch } = useContext(ComposerContext)

  return (
    <>
      {character?.id && (
        <div
          className={`${styles.CharacterPortrait} nodrag`}
          title={character.title}
          onClick={() => {
            character?.id &&
              composerDispatch({
                type: COMPOSER_ACTION_TYPE.OPEN_CHARACTER_MODAL,
                characterId: character.id
              })
          }}
        >
          <CharacterMask
            studioId={studioId}
            worldId={character.worldId}
            characterId={character.id}
            type={CHARACTER_MASK_TYPE.NEUTRAL}
            overlay={false}
            aspectRatio="4/5"
            fill
            active
            assetId={
              character.masks.find(
                (mask) => mask.type === CHARACTER_MASK_TYPE.NEUTRAL
              )?.assetId
            }
          />
        </div>
      )}
    </>
  )
}

CharacterPortrait.displayName = 'CharacterPortrait'

const EventCharacterRefGrid: React.FC<{
  studioId: StudioId
  characterIds: ElementId[]
  flatBottom: boolean
}> = ({ studioId, characterIds, flatBottom }) => {
  return (
    <>
      {characterIds.length > 0 && (
        <div
          className={styles.EventCharacterRefGrid}
          style={{
            borderBottomLeftRadius: flatBottom ? '0px' : '5px',
            borderBottomRightRadius: flatBottom ? '0px' : '5px'
          }}
        >
          {characterIds.map((id) => (
            <CharacterPortrait key={id} studioId={studioId} characterId={id} />
          ))}
        </div>
      )}
    </>
  )
}

EventCharacterRefGrid.displayName = 'EventCharacterRefGrid'

export default EventCharacterRefGrid
