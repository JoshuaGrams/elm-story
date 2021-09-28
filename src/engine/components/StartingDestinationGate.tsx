import React, { useEffect, useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from 'react-query'

import { LibraryDatabase } from '../../db'
import { findStartingDestinationPassage } from '../lib/api'

import { GameId, StudioId } from '../../data/types'

import { EngineContext } from '../contexts/EngineContext'

const StartingDestinationGate: React.FC<{
  studioId: StudioId
  gameId: GameId
}> = React.memo(({ children, studioId, gameId }) => {
  const { engine } = useContext(EngineContext)

  const passageCount = useLiveQuery(() =>
    new LibraryDatabase(studioId).passages.where({ gameId }).count()
  )

  const {
    data: startingDestinationPassage,
    isLoading: loadingStartingDestinationPassage
  } = useQuery(
    [`startingLocation-${gameId}`, studioId, gameId],
    async () => {
      try {
        return await findStartingDestinationPassage(studioId, gameId)
      } catch (error) {
        throw error
      }
    },
    {
      enabled:
        !engine.installed && passageCount && passageCount > 0 ? true : false
    }
  )

  return (
    <>
      {!loadingStartingDestinationPassage && (
        <>
          {startingDestinationPassage && <>{children}</>}
          {!startingDestinationPassage && (
            <div>Scene and passage required to render game.</div>
          )}
        </>
      )}
    </>
  )
})

StartingDestinationGate.displayName = 'StartingDestinationGate'

export default StartingDestinationGate
