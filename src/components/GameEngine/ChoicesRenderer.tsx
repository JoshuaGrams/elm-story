import React, { useContext } from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import { useChoicesByPassageRef } from '../../hooks'

const ChoicesRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  passageId: ComponentId
  onChoice: (choiceId: ComponentId) => void
}> = ({ studioId, gameId, passageId, onChoice }) => {
  const choices = useChoicesByPassageRef(studioId, passageId, [
    studioId,
    passageId
  ])

  const { engine } = useContext(EngineContext)

  return (
    <>
      {choices && (
        <div>
          {choices.map((choice) => (
            <div
              key={choice.id}
              onClick={() => choice.id && onChoice(choice.id)}
            >
              {choice.title}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default ChoicesRenderer
