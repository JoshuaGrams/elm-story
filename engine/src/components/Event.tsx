import React, { useCallback, useContext, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { useSpring } from 'react-spring'
import { useLiveQuery } from 'dexie-react-hooks'

import { findDestinationEvent, getLiveEventInitial, getEvent } from '../lib/api'
import { LibraryDatabase } from '../lib/db'

import {
  ElementId,
  ELEMENT_TYPE,
  EVENT_TYPE,
  EngineLiveEventData,
  EngineLiveEventStateCollection,
  EngineEventData,
  EnginePathData,
  EngineLiveEventResult
} from '../types'
import {
  ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE,
  ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE,
  ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE
} from '../lib'
import { NextLiveEventProcessor } from './LiveEvent'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import EventCharacterMask from './EventCharacterMask'
import EventContent from './EventContent'
import EventChoices, { PassthroughIcon } from './EventChoices'
import EventInput from './EventInput'
import AcceleratedDiv from './AcceleratedDiv'

export type PathProcessor = ({
  originId: origin,
  result,
  path,
  state
}: {
  originId?: ElementId
  result: EngineLiveEventResult
  path?: EnginePathData
  state?: EngineLiveEventStateCollection
}) => Promise<void>

// TODO: move to event
// TODO: only used with EventInput?
export function translateLiveEventResultValue(value: string) {
  let finalValue: JSX.Element

  switch (value) {
    case ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE:
      finalValue = <>{PassthroughIcon}</>
      break
    case ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE:
      finalValue = <>{PassthroughIcon}</>
      break
    case ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE:
      finalValue = <>Restart</>
      break
    default:
      finalValue = <>{value}</>
      break
  }

  return (
    <>
      <span className="event-content-choice-icon">&raquo;</span>{' '}
      <span>{finalValue}</span>
    </>
  )
}

export const Event: React.FC<{
  eventId: ElementId
  liveEvent: EngineLiveEventData
  animated: boolean
  onPathFound: NextLiveEventProcessor
}> = React.memo(({ eventId, liveEvent, animated, onPathFound }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const eventRef = useRef<HTMLDivElement>(null)

  const [introDone, setIntroDone] = useState(false)

  const { studioId, id: worldId } = engine.worldInfo

  const event = useLiveQuery(
    async () => {
      const foundEvent = await new LibraryDatabase(studioId).events.get(eventId)

      return foundEvent || null
    },
    [eventId],
    undefined
  )

  const processPath: PathProcessor = useCallback(
    async ({ originId, result, path, state }) => {
      try {
        let foundEvent: EngineEventData | undefined

        if (path) {
          foundEvent = await getEvent(
            studioId,
            await findDestinationEvent(
              studioId,
              path.destinationId,
              path.destinationType
            )
          )
        }

        if (!path) {
          if (
            result.value !== ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE &&
            originId
          ) {
            foundEvent = await getEvent(studioId, originId)
          }

          if (result.value === ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE) {
            const initialEvent = await getLiveEventInitial(studioId, worldId)

            if (initialEvent) {
              foundEvent = await getEvent(studioId, initialEvent.destination)
            }
          }
        }

        if (foundEvent) {
          onPathFound({
            destinationId: foundEvent.id,
            liveEventResult: result,
            originId:
              path?.destinationType === ELEMENT_TYPE.EVENT
                ? originId || liveEvent.destination
                : undefined,
            eventType: foundEvent.type,
            pathId: path?.id,
            state
          })
        } else {
          throw 'Unable to process path. Could not find event.'
        }
      } catch (error) {
        throw error
      }
    },
    [event, liveEvent]
  )

  const [styles, api] = useSpring(() => ({
    height: 0,
    config: { clamp: true },
    overflow: 'hidden',
    immediate: !animated || introDone
  }))

  useResizeObserver(eventRef, () => {
    if (eventRef.current) {
      api.start({
        immediate: !animated || introDone,
        height: eventRef.current.getBoundingClientRect().height + 1, // handles border bottom change,
        onRest: () => setIntroDone(true)
      })
    }
  })

  return (
    <AcceleratedDiv style={{ ...styles, transform: 'translate3d(0,0,0)' }}>
      <div
        className="event-content"
        style={{
          borderBottom:
            liveEvent.id === engine.currentLiveEvent
              ? 'none'
              : 'var(--event-content-bottom-border)'
        }}
        ref={eventRef}
      >
        {event?.id && (
          <>
            <div
              style={{
                display: event.persona ? 'grid' : 'unset',
                gridTemplateColumns: event.persona ? '20% auto' : 'unset',
                paddingLeft: event.persona ? '1.4rem' : 'unset'
              }}
              className={`${event.persona ? 'event-content-with-persona' : ''}`}
            >
              {event.persona && (
                <EventCharacterMask eventId={eventId} persona={event.persona} />
              )}

              <EventContent
                studioId={studioId}
                worldId={worldId}
                eventId={event.id}
                content={event.content}
                persona={event.persona}
                state={liveEvent.state}
              />
            </div>

            {event.type === EVENT_TYPE.CHOICE && (
              <EventChoices
                event={event}
                liveEvent={liveEvent}
                onSubmitPath={processPath}
              />
            )}

            {event.type === EVENT_TYPE.INPUT && (
              <EventInput
                event={event}
                liveEvent={liveEvent}
                onSubmitPath={processPath}
              />
            )}
          </>
        )}
        {event === null && (
          <div
            className="engine-warning-message"
            style={{ padding: '1.4rem', paddingTop: 0 }}
          >
            Event missing or has been removed.{' '}
            <a
              onClick={async () => {
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_INSTALLED,
                  installed: false
                })
              }}
            >
              Refresh
            </a>{' '}
            event stream.
          </div>
        )}
      </div>
    </AcceleratedDiv>
  )
})

Event.displayName = 'Event'

export default Event
