import { v4 as uuid } from 'uuid'

import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import {
  ElementId,
  EVENT_TYPE,
  EngineLiveEventData,
  EngineLiveEventStateCollection,
  ENGINE_LIVE_EVENT_TYPE,
  EngineLiveEventResult
} from '../types'
import {
  AUTO_ENGINE_BOOKMARK_KEY,
  ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE,
  ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE
} from '../lib'

import { LibraryDatabase } from '../lib/db'

import {
  getLiveEvent,
  getLiveEventInitial,
  processEffectsByRoute,
  saveBookmarkLiveEvent,
  saveLiveEvent,
  saveLiveEventDate,
  saveLiveEventNext,
  saveLiveEventResult
} from '../lib/api'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import Event from './Event'

export type NextLiveEventProcessor = ({
  destinationId,
  liveEventResult,
  originId,
  eventType,
  pathId,
  state
}: {
  destinationId: ElementId
  liveEventResult: EngineLiveEventResult
  originId?: ElementId
  eventType: EVENT_TYPE
  pathId?: ElementId
  state?: EngineLiveEventStateCollection // override of event state for input type
}) => Promise<void>

const LiveEvent: React.FC<{ data: EngineLiveEventData }> = ({ data }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId, id: worldId } = engine.worldInfo

  const liveEvent = useLiveQuery(
    () => new LibraryDatabase(studioId).live_events.get(data.id),
    []
  )

  const gotoNextLiveEvent: NextLiveEventProcessor = async ({
    destinationId,
    liveEventResult,
    originId,
    eventType,
    pathId,
    state
  }) => {
    try {
      await saveLiveEventResult(studioId, data.id, liveEventResult)

      const nextLiveEventId = uuid()

      let liveEventType: ENGINE_LIVE_EVENT_TYPE | undefined

      switch (liveEventResult.value) {
        case ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE:
          liveEventType = ENGINE_LIVE_EVENT_TYPE.RESTART
          break
        case ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE:
          liveEventType =
            ENGINE_LIVE_EVENT_TYPE[
              eventType === EVENT_TYPE.CHOICE
                ? 'CHOICE_LOOPBACK'
                : 'INPUT_LOOPBACK'
            ]
          break
        default:
          liveEventType = ENGINE_LIVE_EVENT_TYPE[eventType]
          break
      }

      const initialLiveEventFromRestart =
        liveEventType === ENGINE_LIVE_EVENT_TYPE.RESTART
          ? await getLiveEventInitial(studioId, worldId)
          : undefined

      if (liveEventType && engine.worldInfo) {
        await Promise.all([
          saveLiveEventNext(studioId, data.id, nextLiveEventId),
          saveLiveEvent(studioId, {
            worldId,
            id: nextLiveEventId,
            destination: destinationId,
            origin: originId,
            state:
              initialLiveEventFromRestart?.state ||
              (pathId &&
                (await processEffectsByRoute(
                  studioId,
                  pathId,
                  state || liveEvent?.state || data.state
                ))) ||
              state || // TODO: handles input loopback
              liveEvent?.state ||
              data.state,
            prev: data.id,
            type: liveEventType,
            updated: Date.now(),
            version: engine.worldInfo?.version
          })
        ])

        const updatedBookmark = await saveBookmarkLiveEvent(
          studioId,
          `${AUTO_ENGINE_BOOKMARK_KEY}${worldId}`,
          nextLiveEventId
        )

        await saveLiveEventDate(
          studioId,
          nextLiveEventId,
          updatedBookmark?.updated
        )

        const nextLiveEvent = await getLiveEvent(studioId, nextLiveEventId)

        if (nextLiveEvent) {
          const currentLiveEvent = await getLiveEvent(studioId, data.id)

          if (currentLiveEvent) {
            // elmstorygames/feedback#214
            // this was at bottom of stack... any side effects?
            engineDispatch({
              type: ENGINE_ACTION_TYPE.SET_CURRENT_LIVE_EVENT,
              id: nextLiveEventId
            })

            engineDispatch({
              type: ENGINE_ACTION_TYPE.UPDATE_LIVE_EVENT_IN_STREAM,
              liveEvent: currentLiveEvent
            })

            engineDispatch({
              type: ENGINE_ACTION_TYPE.APPEND_LIVE_EVENTS_TO_STREAM,
              liveEvents: [nextLiveEvent],
              reset: liveEventType === ENGINE_LIVE_EVENT_TYPE.RESTART
            })
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <div className={`live-event ${liveEvent?.result ? 'live-event-past' : ''}`}>
      {liveEvent && (
        <>
          <Event
            eventId={data.destination}
            liveEvent={liveEvent}
            onPathFound={gotoNextLiveEvent}
          />
        </>
      )}
    </div>
  )
}

LiveEvent.displayName = 'LiveEvent'

export default LiveEvent
