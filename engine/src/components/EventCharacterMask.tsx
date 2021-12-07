import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { EventCharacterPersona } from '../types'

import { EngineContext } from '../contexts/EngineContext'

import { getCharacterMask } from '../lib/api'

const EventCharacterMask: React.FC<{
  persona: EventCharacterPersona
}> = React.memo(({ persona }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const mask = useLiveQuery(
    async () =>
      persona && (await getCharacterMask(studioId, persona?.[0], persona?.[1])),
    [persona]
  )

  return (
    <>
      {mask?.assetId && (
        <div className="character-mask">
          <div
            className="portrait"
            style={{
              backgroundImage: `url(../../data/amber-shores_0.0.45/assets/${mask.assetId}.jpeg)`
            }}
          />
        </div>
      )}
    </>
  )
})

EventCharacterMask.displayName = 'EventCharacterMask'

export default EventCharacterMask
