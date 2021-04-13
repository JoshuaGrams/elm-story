import React, { useContext } from 'react'
import { EngineContext } from '../../contexts/EngineContext'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { useChapter } from '../../hooks'

import SceneRenderer from './SceneRenderer'

const ChapterRenderer: React.FC<{
  studioId: StudioId
  gameId: GameId
  chapterId: ComponentId | null
}> = ({ studioId, gameId, chapterId }) => {
  const chapter = chapterId
    ? useChapter(studioId, chapterId, [studioId, chapterId])
    : undefined

  const { engine } = useContext(EngineContext)

  return (
    <>
      {chapter && chapter.scenes.length === 0 && (
        <div>{`Chapter '${chapter.title}' requires a scene to render.`}</div>
      )}

      {chapter && (
        <SceneRenderer
          studioId={studioId}
          gameId={gameId}
          sceneId={
            engine.currentScene || engine.startingScene || chapter.scenes[0]
          }
        />
      )}
    </>
  )
}

export default ChapterRenderer
