import React, { useContext } from 'react'

import { ComponentId, COMPONENT_TYPE, GameId, StudioId } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import {
  useChoice,
  useChoicesByPassageRef,
  useRoutesByChoiceRef
} from '../../hooks'

const ChoiceRowRenderer: React.FC<{
  studioId: StudioId
  choiceId: ComponentId
  onChoice: (
    choiceId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) => void
}> = ({ studioId, choiceId, onChoice }) => {
  const choice = useChoice(studioId, choiceId, [studioId, choiceId]),
    routes = useRoutesByChoiceRef(studioId, choiceId, [studioId, choiceId])

  return (
    <>
      {choice && routes && (
        <div
          onClick={() => {
            // TODO: Choice may point to multiple passages and jumps.
            // Track, calculate probability. For now, we'll go to the first.
            choice.id &&
              routes[0] &&
              onChoice(
                choice.id,
                routes[0].destinationId,
                routes[0].destinationType
              )
          }}
        >
          {choice.title} {routes.length === 0 && <span>(No Route)</span>}
        </div>
      )}
    </>
  )
}

const ChoicesRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  passageId: ComponentId
  onChoice: (
    choiceId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) => void
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
          {choices.map(
            (choice) =>
              choice.id && (
                <ChoiceRowRenderer
                  key={choice.id}
                  studioId={studioId}
                  choiceId={choice.id}
                  onChoice={onChoice}
                />
              )
          )}
        </div>
      )}
    </>
  )
}

export default ChoicesRenderer
