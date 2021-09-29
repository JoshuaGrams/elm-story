import React, { useContext, useRef } from 'react'
import { useTransition, animated } from 'react-spring'
import { useQuery } from 'react-query'
import useResizeObserver from '@react-hook/resize-observer'

import { scrollElementToBottom } from '../lib'
import { getRecentEvents } from '../lib/api'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'
import { SettingsContext } from '../contexts/SettingsContext'

import Event from './Event'

const EventStream: React.FC = React.memo(() => {
  const eventsRef = useRef<HTMLDivElement>(null)

  const { engine, engineDispatch } = useContext(EngineContext),
    { settings } = useContext(SettingsContext)

  if (!engine.gameInfo) return null

  const { studioId, id: gameId } = engine.gameInfo

  useQuery(
    [`recentEvents-${gameId}`, studioId, gameId],
    async () => {
      try {
        if (engine.currentEvent) {
          const recentEvents = await getRecentEvents(
            studioId,
            gameId,
            engine.currentEvent,
            3
          )

          engineDispatch({
            type: ENGINE_ACTION_TYPE.APPEND_EVENTS_TO_STREAM,
            events: recentEvents,
            reset: true
          })
        }
      } catch (error) {
        throw error
      }

      return true
    },
    { enabled: engine.currentEvent ? true : false, refetchOnMount: 'always' }
  )

  const eventStreamTransitions = useTransition(engine.eventsInStream, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    config: { clamp: true, mass: 100, tension: 500, friction: 60 },
    trail: 50,
    delay: 250,
    keys: engine.eventsInStream.map((event) => event.id)
  })

  useResizeObserver(
    eventsRef,
    () => eventsRef.current && scrollElementToBottom(eventsRef.current)
  )

  return (
    <>
      <div
        id="event-stream"
        style={{
          overflowY: settings.open ? 'hidden' : 'auto',
          top: engine.isEditor ? '0' : 'unset'
        }}
      >
        <div id="events" ref={eventsRef}>
          {eventStreamTransitions((styles, event) => (
            <animated.div style={styles}>
              <Event key={event.id} data={event} />
            </animated.div>
          ))}
        </div>
      </div>
    </>
  )
})

EventStream.displayName = 'EventStream'

export default EventStream
