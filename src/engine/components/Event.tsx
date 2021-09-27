import { v4 as uuid } from 'uuid'

import React, { useContext } from 'react'

import {
  AUTO_ENGINE_BOOKMARK_KEY,
  ENGINE_GAME_OVER_RESULT_VALUE,
  ENGINE_LOOPBACK_RESULT_VALUE
} from '../lib'
import {
  getEvent,
  getEventInitial,
  processEffectsByRoute,
  saveBookmarkEvent,
  saveEvent,
  saveEventDate,
  saveEventNext,
  saveEventResult
} from '../lib/api'

import {
  ComponentId,
  PASSAGE_TYPE,
  EngineEventData,
  EngineEventStateCollection,
  ENGINE_EVENT_TYPE
} from '../types/0.5.0'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import EventPassage from './EventPassage'

export type NextEventProcessor = ({
  destinationId,
  eventResult: choiceResult,
  originId,
  passageType,
  routeId,
  state
}: {
  destinationId: ComponentId
  eventResult: string
  originId?: ComponentId
  passageType: PASSAGE_TYPE
  routeId?: ComponentId
  state?: EngineEventStateCollection // override of event state for input type
}) => Promise<void>

const Event: React.FC<{ data: EngineEventData }> = ({ data }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  if (!engine.gameInfo) return null

  const { studioId, id: gameId } = engine.gameInfo

  const gotoNextEvent: NextEventProcessor = async ({
    destinationId,
    eventResult,
    originId,
    passageType,
    routeId,
    state
  }) => {
    try {
      await saveEventResult(studioId, data.id, eventResult)

      const nextEventId = uuid()

      let eventType: ENGINE_EVENT_TYPE | undefined

      switch (eventResult) {
        case ENGINE_GAME_OVER_RESULT_VALUE:
          eventType = ENGINE_EVENT_TYPE.RESTART
          break
        case ENGINE_LOOPBACK_RESULT_VALUE:
          eventType =
            ENGINE_EVENT_TYPE[
              passageType === PASSAGE_TYPE.CHOICE
                ? 'CHOICE_LOOPBACK'
                : 'INPUT_LOOPBACK'
            ]
          break
        default:
          eventType = ENGINE_EVENT_TYPE[passageType]
          break
      }

      const initialEvent =
        eventType === ENGINE_EVENT_TYPE.RESTART
          ? await getEventInitial(studioId, gameId)
          : undefined

      if (eventType) {
        await Promise.all([
          saveEventNext(studioId, data.id, nextEventId),
          saveEvent(studioId, {
            gameId,
            id: nextEventId,
            destination: destinationId,
            origin: originId,
            state:
              initialEvent?.state ||
              (routeId &&
                (await processEffectsByRoute(
                  studioId,
                  routeId,
                  state || data.state
                ))) ||
              data.state,
            prev: data.id,
            type: eventType,
            updated: Date.now()
          })
        ])

        const updatedBookmark = await saveBookmarkEvent(
          studioId,
          `${AUTO_ENGINE_BOOKMARK_KEY}${gameId}`,
          nextEventId
        )

        await saveEventDate(studioId, nextEventId, updatedBookmark?.updated)

        const nextEvent = await getEvent(studioId, nextEventId)

        if (nextEvent) {
          const currentEvent = await getEvent(studioId, data.id)

          if (currentEvent) {
            engineDispatch({
              type: ENGINE_ACTION_TYPE.UPDATE_EVENT_IN_STREAM,
              event: currentEvent
            })

            engineDispatch({
              type: ENGINE_ACTION_TYPE.APPEND_EVENTS_TO_STREAM,
              events: [nextEvent],
              reset: eventType === ENGINE_EVENT_TYPE.RESTART
            })

            engineDispatch({
              type: ENGINE_ACTION_TYPE.SET_CURRENT_EVENT,
              id: nextEventId
            })
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <div
      className={`event ${engine.currentEvent !== data.id ? 'event-past' : ''}`}
    >
      <EventPassage
        passageId={data.destination}
        event={data}
        onRouteFound={gotoNextEvent}
      />
    </div>
  )
}

Event.displayName = 'Event'

export default Event
