import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { ElementId, EventPersona } from '../types'

import { EngineContext } from '../contexts/EngineContext'

import { getCharacterMask } from '../lib/api'

const EventMask: React.FC<{
  eventId: ElementId
  persona: EventPersona
}> = React.memo(({ eventId, persona }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId, id: worldId } = engine.worldInfo

  const mask = useLiveQuery(
    async () => await getCharacterMask(studioId, persona[0], persona[1])
  )

  return (
    <>
      {mask?.assetId && (
        <div
          style={{
            width: '100px',
            height: '125px',
            float: 'left',
            padding: '0.4rem',
            marginRight: '2rem',
            marginBottom: '2rem',
            border: '1px hsl(0, 0%, 40%) solid',
            borderRadius: '2px'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(../../data/amber-shores_0.0.45/assets/${mask.assetId}.jpeg)`,
              backgroundSize: 'cover',
              borderRadius: '2px'
            }}
          />
        </div>
      )}
    </>
  )
})

EventMask.displayName = 'EventMask'

export default EventMask
