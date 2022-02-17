import React, { useContext, useEffect, useRef, useState } from 'react'

import { EngineLiveEventResult } from '../types'
import { ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE } from '../lib'
import { PassthroughIcon } from './EventChoices'
import AcceleratedDiv from './AcceleratedDiv'
import { useSpring } from 'react-spring'
import { EngineContext } from '../contexts/EngineContext'

const LiveEventLoopbackButton: React.FC<{
  onClick?: () => void
  liveEventResult?: EngineLiveEventResult
}> = React.memo(({ onClick, liveEventResult }) => {
  const { engine } = useContext(EngineContext)

  const loopbackRef = useRef<HTMLDivElement>(null)

  const [height, setHeight] = useState(
    liveEventResult?.value === ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE ? -1 : 0
  )

  const [styles, springApi] = useSpring(
    () => ({
      height,
      opacity: 1,
      overflow: 'hidden',
      config: {
        clamp: true
      },
      onRest: () => {
        liveEventResult?.value === ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE &&
          setHeight(-1)
      }
    }),
    [height, liveEventResult?.value]
  )

  useEffect(() => {
    engine.currentLiveEvent !== liveEventResult?.id &&
      liveEventResult?.value === ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE &&
      springApi.start({ delay: 600, height: -1, opacity: 0 })
  }, [liveEventResult?.value])

  useEffect(() => {
    loopbackRef.current &&
      setHeight(loopbackRef.current.getBoundingClientRect().height)
  }, [loopbackRef.current])

  return (
    <>
      {height !== -1 && (
        <AcceleratedDiv style={styles}>
          <div
            ref={loopbackRef}
            className={`event-content-loopback ${
              liveEventResult?.value === ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE
                ? 'event-content-choice-result'
                : ''
            }`}
          >
            <button
              onClick={onClick}
              type={!onClick ? 'submit' : undefined}
              disabled={
                liveEventResult?.value ===
                ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE
                  ? true
                  : false
              }
            >
              {PassthroughIcon}
            </button>
          </div>
        </AcceleratedDiv>
      )}
    </>
  )
})

LiveEventLoopbackButton.displayName = 'LiveEventLoopbackButton'

export default LiveEventLoopbackButton
