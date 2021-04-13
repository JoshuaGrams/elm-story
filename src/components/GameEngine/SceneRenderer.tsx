import React, { useContext } from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { EngineContext } from '../../contexts/EngineContext'

import { useScene } from '../../hooks'

import PassageRenderer from './PassageRenderer'

const SceneRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  sceneId: ComponentId | null
}> = ({ studioId, gameId, sceneId }) => {
  const scene = sceneId
    ? useScene(studioId, sceneId, [studioId, sceneId])
    : undefined

  const { engine } = useContext(EngineContext)

  return (
    <>
      {scene && scene.passages.length === 0 && (
        <div>{`Scene '${scene.title}' requires a passage to render.`}</div>
      )}

      {scene && (
        <PassageRenderer
          studioId={studioId}
          gameId={gameId}
          passageId={
            engine.currentPassage || engine.startingPassage || scene.passages[0]
          }
        />
      )}
    </>
  )
}

export default SceneRenderer
