import React, { useContext } from 'react'

import { ComponentId, StudioId } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import { useScene } from '../../hooks'

import PassageRenderer from './PassageRenderer'

const SceneRenderer: React.FC<{
  studioId: StudioId
  sceneId: ComponentId
}> = ({ studioId, sceneId }) => {
  const scene = useScene(studioId, sceneId, [studioId, sceneId])

  const { engine } = useContext(EngineContext)

  return (
    <>
      {scene && scene.children.length === 0 && (
        <div>{`Scene '${scene.title}' requires a passage to render.`}</div>
      )}

      {scene && (
        <>
          {(engine.currentPassage ||
            engine.startingPassage ||
            scene.children[0]) && (
            <PassageRenderer
              studioId={studioId}
              passageId={
                engine.currentPassage ||
                engine.startingPassage ||
                scene.children[0][1]
              }
            />
          )}
        </>
      )}
    </>
  )
}

export default SceneRenderer
