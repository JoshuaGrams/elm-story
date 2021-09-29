import React, { useContext, useEffect } from 'react'
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

  const passageCount: number = useLiveQuery(
    () => new LibraryDatabase(studioId).passages.where({ gameId }).count(),
    [],
    0
  )

  const {
    data: startingDestinationPassage,
    isLoading: loadingStartingDestinationPassage
  } = useQuery(
    [`startingLocation-${gameId}`, studioId, gameId, engine],
    async () => {
      if (!engine.installed) {
        try {
          const foundStartingDestination = await findStartingDestinationPassage(
            studioId,
            gameId
          )

          return foundStartingDestination
        } catch (error) {
          throw error
        }
      }

      return true
    },
    {
      enabled: !engine.installed && passageCount > 0 ? true : false
    }
  )

  return (
    <>
      {!loadingStartingDestinationPassage && (
        <>
          {(startingDestinationPassage || engine.installed) && <>{children}</>}
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
