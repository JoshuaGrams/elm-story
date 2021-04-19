import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { ComponentId, StudioId } from '../../data/types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../../contexts/EngineContext'

import { useScene } from '../../hooks'

import PassageRenderer from './PassageRenderer'

const SceneRenderer: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId, [studioId, sceneId])

  const { engine, engineDispatch } = useContext(EngineContext)

  useEffect(() => {
    logger.info(`SceneRenderer->scene,sceneId->useEffect`)

    // Scene has been removed.
    !scene &&
      sceneId &&
      engine.currentScene &&
      engineDispatch({
        type: ENGINE_ACTION_TYPE.SCENE_CURRENT,
        currentScene: null
      })
  }, [scene, sceneId])

  return (
    <>
      {scene && scene.passages.length === 0 && (
        <div>{`Scene '${scene.title}' requires a passage to render.`}</div>
      )}

      {scene && (
        <>
          {(engine.currentPassage ||
            engine.startingPassage ||
            scene.passages[0]) && (
            <PassageRenderer
              studioId={studioId}
              passageId={
                engine.currentPassage ||
                engine.startingPassage ||
                scene.passages[0]
              }
            />
          )}
        </>
      )}
    </>
  )
}

export default SceneRenderer
