import React, { useContext } from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import { useChoicesByPassageRef } from '../../hooks'

const ChoicesRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  passageId: ComponentId | null
}> = ({ studioId, gameId, passageId }) => {
  const choices = passageId
    ? useChoicesByPassageRef(studioId, passageId, [studioId, passageId])
    : undefined

  const { engine } = useContext(EngineContext)

  return (
    <>
      {choices && (
        <div>
          {choices.map((choice) => (
            <div key={choice.id}>{choice.title}</div>
          ))}
        </div>
      )}
    </>
  )
}

export default ChoicesRenderer
