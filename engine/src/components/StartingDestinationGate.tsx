import React, { useContext, useEffect, useState } from 'react'

import { LibraryDatabase } from '../lib/db'
import { findStartingDestinationLiveEvent } from '../lib/api'

import { WorldId, StudioId } from '../types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const StartingDestinationGate: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = React.memo(({ children, studioId, worldId }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  const [hasStartingDestination, setHasStartingDestination] = useState<
    boolean | undefined
  >(undefined)

  // elmstorygames/feedback#280
  // elmstorygames/feedback#21
  // elmstorygames/feedback#275
  useEffect(() => {
    async function findStartingDestination() {
      engineDispatch({ type: ENGINE_ACTION_TYPE.DEVTOOLS_RESET, reset: false })

      const foundStartingDestination = await findStartingDestinationLiveEvent(
        studioId,
        worldId
      )

      setHasStartingDestination(foundStartingDestination ? true : false)

      if (!foundStartingDestination) {
        await new LibraryDatabase(studioId).live_events
          .where({ worldId })
          .delete()
      }
    }

    findStartingDestination()
  }, [engine.devTools.reset])

  return (
    <>
      {hasStartingDestination === false && (
        <div className="engine-warning-message" style={{ padding: '1.4rem' }}>
          Scene and choice or input event child required to render world.
        </div>
      )}

      {hasStartingDestination && <>{children}</>}
    </>
  )
})

StartingDestinationGate.displayName = 'StartingDestinationGate'

export default StartingDestinationGate
