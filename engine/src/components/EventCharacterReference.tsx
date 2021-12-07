import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { EventCharacterPersona } from '../types'

import { EngineContext } from '../contexts/EngineContext'

import { getCharacterReference } from '../lib/api'

const EventCharacterReference: React.FC<{
  persona: EventCharacterPersona
}> = React.memo(({ persona }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const reference = useLiveQuery(
    async () =>
      persona &&
      (await getCharacterReference(studioId, persona?.[0], persona?.[2])),
    [persona]
  )

  return (
    <>
      {reference && (
        <span className={`character-reference`}>{reference} &mdash; </span>
      )}
    </>
  )
})

EventCharacterReference.displayName = 'EventCharacterReference'

export default EventCharacterReference
