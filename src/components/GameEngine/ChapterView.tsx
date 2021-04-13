import React from 'react'

import { ComponentId, GameId, StudioId } from '../../data/types'

import { useChapter } from '../../hooks'

const ChapterView: React.FC<{
  studioId: StudioId
  gameId: GameId
  chapterId: ComponentId
}> = ({ studioId, gameId, chapterId }) => {
  const chapter = useChapter(studioId, chapterId, [studioId, chapterId])

  return <>{chapter && <div>{chapter.title}</div>}</>
}

export default ChapterView
