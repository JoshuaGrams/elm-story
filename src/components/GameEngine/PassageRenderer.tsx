import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { usePassage, useRoutesByPassageRef } from '../../hooks'

import ChoicesRenderer from './ChoicesRenderer'

import api from '../../api'
import { CustomElement } from '../ComponentEditor/PassageView'

const PassageRenderer: React.FC<{
  studioId: StudioId
  passageId: ComponentId
}> = ({ studioId, passageId }) => {
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
              passageId={passageId}
              order={passage.choices}
              onChoice={onChoice}
            />
          )}
        </>
      )}
    </>
  )
}

export default PassageRenderer
