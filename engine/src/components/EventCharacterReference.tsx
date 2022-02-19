import React, { useContext, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { ENGINE_MOTION, EventCharacterPersona } from '../types'

import { EngineContext } from '../contexts/EngineContext'

import { useSpring, config } from 'react-spring'
import AcceleratedDiv from './AcceleratedDiv'

import { getCharacterReference } from '../lib/api'
import { SettingsContext } from '../contexts/SettingsContext'

const EventCharacterReference: React.FC<{
  persona: EventCharacterPersona
}> = React.memo(({ persona }) => {
  const { engine } = useContext(EngineContext),
    { settings } = useContext(SettingsContext)

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const [styles, api] = useSpring(() => ({
    immediate: settings.motion === ENGINE_MOTION.REDUCED,
    from: {
      opacity: 0
    },
    config: config.gentle
  }))

  const reference = useLiveQuery(
    async () =>
      persona &&
      (await getCharacterReference(studioId, persona?.[0], persona?.[2])),
    [persona]
  )

  useEffect(() => {
    if (reference) api.start({ opacity: 1 })
  }, [reference])

  return (
    <AcceleratedDiv style={styles} className={`event-character-reference`}>
      {reference}
    </AcceleratedDiv>
  )
})

EventCharacterReference.displayName = 'EventCharacterReference'

export default EventCharacterReference
