import React, { useContext } from 'react'
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
    -1
  )

  const { data: startingDestinationPassage } = useQuery(
    [`startingDestination-${gameId}`, studioId, gameId, engine, passageCount],
    async () => {
      if (!engine.installed) {
        try {
          const foundStartingDestination = await findStartingDestinationPassage(
            studioId,
            gameId
          )

          return foundStartingDestination ? true : false
        } catch (error) {
          throw error
        }
      }

      return false
    },
    {
      enabled: !engine.installed && passageCount > 0 ? true : false
    }
  )

  return (
    <>
      {passageCount === 0 && !engine.installed && (
        <div>Scene and passage required to render game.</div>
      )}

      {(startingDestinationPassage || engine.installed) && <>{children}</>}
    </>
  )
})

StartingDestinationGate.displayName = 'StartingDestinationGate'

export default StartingDestinationGate
