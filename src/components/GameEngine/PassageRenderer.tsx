import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { ComponentId, COMPONENT_TYPE, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { usePassage, useRoutesByPassageRef } from '../../hooks'

import ChoicesRenderer from './ChoicesRenderer'

import { CustomElement } from '../ComponentEditor/PassageView'

import api from '../../api'

const PassageContent: React.FC<{ title: string; content: string }> = ({
  title,
  content
}) => {
  const parsedContent: CustomElement[] = JSON.parse(content)

  if (parsedContent.length > 0 && !parsedContent[0].children[0].text) {
  }

  return (
    <>
      {parsedContent.length > 0 && !parsedContent[0].children[0].text && (
        <div className="es-engine-passage-no-content">{`Passage "${title}" is missing content.`}</div>
      )}

      {parsedContent.length > 0 &&
        parsedContent[0].children[0].text &&
        parsedContent.map((descendant: CustomElement, index: number) => (
          <p
            className={`${'es-engine-passage-p'} ${
              !descendant.children[0].text ? 'es-engine-passage-p-empty' : ''
            }`}
            key={`p-${index}`}
          >
            {descendant.children[0].text || <>&#65279;</>}
          </p>
        ))}
    </>
  )
}

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
        currentPassage: jump.route[1] || null
      })

      engineDispatch({
        type: ENGINE_ACTION_TYPE.SCENE_CURRENT,
        currentScene: jump.route[0] || null
      })
    }

    engineDispatch({
      type: ENGINE_ACTION_TYPE.SCROLL_TO,
      scrollTo: { top: 0, left: 0 }
    })
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
          <PassageContent title={passage.title} content={passage.content} />

          {passage.choices.length === 0 && (
            <div className="es-engine-game-over-message">The End</div>
          )}

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
