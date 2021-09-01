import logger from '../../lib/logger'

import React, { useContext, useEffect, useState } from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import {
  useChoice,
  useChoicesByPassageRef,
  useRoutesByChoiceRef
} from '../../hooks'

import { processEffectsByRoute, SelectedRouteHandler } from './PassageRenderer'

const ChoiceButtonRenderer: React.FC<{
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

  const { engine, engineDispatch } = useContext(EngineContext)

  const [selectedRoute, setSelectedRoute] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    logger.info(
      `ChoiceButtonRenderer->selectedRoute->useEffect:${selectedRoute}`
    )
  }, [selectedRoute])

  return (
    <>
      {choice?.id && routes && (
        <>
          <SelectedRouteHandler
            studioId={studioId}
            routes={routes}
            onSelectedRoute={(routeId: ComponentId | undefined) =>
              setSelectedRoute(routeId)
            }
          />
          <a
            className={`es-engine-choice-button ${
              !selectedRoute ? 'es-engine-choice-button-disabled' : ''
            }`}
            onClick={
              selectedRoute
                ? async () => {
                    if (choice.id) {
                      const foundRoute = routes.find(
                        (route) => route.id === selectedRoute
                      )

                      if (foundRoute?.id) {
                        const newGameState = await processEffectsByRoute(
                          studioId,
                          engine.gameState,
                          foundRoute.id
                        )

                        newGameState &&
                          engineDispatch({
                            type: ENGINE_ACTION_TYPE.GAME_STATE,
                            gameState: newGameState
                          })

                        // TODO: Choice may point to multiple passages and jumps.
                        // Track, calculate probability. For now, we'll go to the first. #111
                        onChoice(
                          choice.id,
                          foundRoute.destinationId,
                          foundRoute.destinationType
                        )
                      }
                    }
                  }
                : () => null
            }
          >
            {choice.title}
          </a>
        </>
      )}
    </>
  )
}

const ChoicesRenderer: React.FC<{
  studioId: StudioId
  passageId: ComponentId
  order: string[]
  onChoice: (
    choiceId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) => void
}> = ({ studioId, passageId, order, onChoice }) => {
  const choices = useChoicesByPassageRef(studioId, passageId, [
    studioId,
    passageId
  ])

  return (
    <>
      {choices && (
        <div className="es-engine-choices-container">
          {choices
            .sort(
              (a, b) =>
                order.findIndex((choiceRef) => a.id === choiceRef) -
                order.findIndex((choiceRef) => b.id === choiceRef)
            )
            .map(
              (choice) =>
                choice.id && (
                  <ChoiceButtonRenderer
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
