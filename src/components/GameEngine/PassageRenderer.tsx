import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'
import { cloneDeep } from 'lodash'

import { ComponentId, COMPONENT_TYPE, GameId, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import {
  usePassage,
  useRouteEffectsByRouteRef,
  useRoutesByPassageRef
} from '../../hooks'

import ChoicesRenderer from './ChoicesRenderer'

import api from '../../api'
import { CustomElement } from '../ComponentEditor/PassageView'

const EffectHandler: React.FC<{
  studioId: StudioId
  routeId: ComponentId
}> = ({ studioId, routeId }) => {
  const effects = useRouteEffectsByRouteRef(studioId, routeId, [
    studioId,
    routeId
  ])

  const { engine, engineDispatch } = useContext(EngineContext)

  useEffect(() => {
    async function executeEffect() {
      if (effects) {
        const newGameState = cloneDeep(engine.gameState)

        effects.map((effect) => {
          if (effect.id && newGameState[effect.variableId]) {
            newGameState[effect.variableId].currentValue = effect.set[2]
          }
        })

        engineDispatch({
          type: ENGINE_ACTION_TYPE.GAME_STATE,
          gameState: newGameState
        })
      }
    }

    effects && executeEffect()
  }, [effects])

  return null
}

const PassageRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  passageId: ComponentId
}> = ({ studioId, gameId, passageId }) => {
  const passage = usePassage(studioId, passageId, [studioId, passageId]),
    routes = useRoutesByPassageRef(studioId, passageId, [studioId, passageId])

  const { engine, engineDispatch } = useContext(EngineContext)

  async function onChoice(
    choiceId: ComponentId,
    destinationId: ComponentId,
    destinationType: COMPONENT_TYPE
  ) {
    logger.info(
      `PassageRenderer->onChoice->${choiceId}
      destinationId: ${destinationId}
      destinationType: ${destinationType}`
    )

    if (destinationType === COMPONENT_TYPE.PASSAGE) {
      engineDispatch({
        type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
        currentPassage: destinationId
      })
    }

    if (destinationType === COMPONENT_TYPE.JUMP) {
      const jump = await api().jumps.getJump(studioId, destinationId)

      engineDispatch({
        type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
        currentPassage: jump.route[2] || null
      })

      engineDispatch({
        type: ENGINE_ACTION_TYPE.SCENE_CURRENT,
        currentScene: jump.route[1] || null
      })

      engineDispatch({
        type: ENGINE_ACTION_TYPE.CHAPTER_CURRENT,
        currentChapter: jump.route[0] || null
      })
    }
  }

  useEffect(() => {
    logger.info(`PassageRenderer->passage,passageId->useEffect`)

    // Passage has been removed.
    !passage &&
      passageId &&
      engine.currentPassage &&
      engineDispatch({
        type: ENGINE_ACTION_TYPE.PASSAGE_CURRENT,
        currentPassage: null
      })
  }, [passage, passageId])

  return (
    <>
      {passage && routes && (
        <>
          {routes.map(
            (route) =>
              route.id && (
                <EffectHandler
                  studioId={studioId}
                  routeId={route.id}
                  key={route.id}
                />
              )
          )}

          <div>
            {passage.content &&
              JSON.parse(passage.content).map(
                (descendant: CustomElement, index: number) => (
                  <p className="passage-paragraph" key={`p-${index}`}>
                    {descendant.children[0].text || <>&#65279;</>}
                  </p>
                )
              )}
          </div>

          {passage.choices.length === 0 && <div>Game Over</div>}

          {passage.choices.length > 0 && (
            <ChoicesRenderer
              studioId={studioId}
              gameId={gameId}
              passageId={passageId}
              onChoice={onChoice}
            />
          )}
        </>
      )}
    </>
  )
}

export default PassageRenderer
