import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from 'react-query'

import { LibraryDatabase } from '../lib/db'
import { findStartingDestinationLiveEvent } from '../lib/api'

import { WorldId, StudioId } from '../types'

import { EngineContext } from '../contexts/EngineContext'

const StartingDestinationGate: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = React.memo(({ children, studioId, worldId }) => {
  const { engine } = useContext(EngineContext)

  const passageCount: number = useLiveQuery(
    () => new LibraryDatabase(studioId).events.where({ worldId }).count(),
    [],
    -1
  )

  const { data: startingDestinationPassage } = useQuery(
    [`startingDestination-${worldId}`, studioId, worldId, passageCount],
    async () => {
      if (!engine.installed) {
        try {
          const foundStartingDestination = await findStartingDestinationLiveEvent(
            studioId,
            worldId
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
        <div className="engine-warning-message" style={{ padding: '1.4rem' }}>
          Scene and choice or input event child required to render world.
        </div>
      )}

      {(startingDestinationPassage || engine.installed) && <>{children}</>}
    </>
  )
})

StartingDestinationGate.displayName = 'StartingDestinationGate'

export default StartingDestinationGate
