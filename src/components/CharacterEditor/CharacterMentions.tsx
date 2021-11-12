import React from 'react'

import { Character, GameId, StudioId } from '../../data/types'

const CharacterMentions: React.FC<{
  studioId: StudioId
  gameId: GameId
  character: Character
}> = ({ studioId, gameId, character }) => {
  return <div>Character Mentions for "{character.title}".</div>
}

CharacterMentions.displayName = 'CharacterMentions'

export default CharacterMentions
