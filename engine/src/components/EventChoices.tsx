import React, { useCallback, useContext, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery } from 'react-query'

import { LibraryDatabase } from '../lib/db'
import { findOpenPath, getChoicesFromEventWithOpenPath } from '../lib/api'

import {
  ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE,
  ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE,
  ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE,
  INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY
} from '../lib'
import {
  ElementId,
  EngineChoiceData,
  EngineLiveEventData,
  EngineEventData,
  EnginePathData,
  EngineLiveEventResult
} from '../types'
import { PathProcessor, translateLiveEventResultValue } from './Event'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import LiveEventLoopbackButton from './LiveEventLoopbackButton'

const EventPassthroughChoice: React.FC<{
  paths: EnginePathData[]
  liveEvent: EngineLiveEventData
  onSubmitPath: PathProcessor
  originId?: ElementId
}> = React.memo(
  ({ paths: routes, liveEvent: event, onSubmitPath, originId }) => {
    const { engine } = useContext(EngineContext)

    if (!engine.worldInfo) return null

    const { studioId, id: worldId } = engine.worldInfo

    const conditions = useLiveQuery(
      () =>
        new LibraryDatabase(studioId).conditions.where({ worldId }).toArray(),
      []
    )

    const variables = useLiveQuery(
      () =>
        new LibraryDatabase(studioId).variables.where({ worldId }).toArray(),
      []
    )

    const { data: openPath, isLoading: openRouteIsLoading } = useQuery(
      [`passthrough-${event.id}`, routes, conditions, variables],
      async () => {
        return await findOpenPath(studioId, routes, event.state)
      }
    )

    const submitChoice = useCallback(
      async () =>
        openPath &&
        !openRouteIsLoading &&
        (await onSubmitPath({
          originId,
          path: openPath,
          result: {
            value: ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE
          }
        })),
      [openPath]
    )

    return (
      <div
        className={`event-content-choice ${
          event.result?.value === ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE
            ? 'event-content-choice-result'
            : ''
        }`}
      >
        <>
          <button
            onClick={submitChoice}
            disabled={
              event.result || (!openPath && !openRouteIsLoading) ? true : false
            }
            className={
              !event.result && !openPath && !openRouteIsLoading
                ? 'closed-route'
                : ''
            }
          >
            {event.result?.value === ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE
              ? 'Continue'
              : engine.currentLiveEvent === event.id &&
                !openPath &&
                !openRouteIsLoading
              ? 'Route Required'
              : 'Continue'}
          </button>
        </>
      </div>
    )
  }
)

EventPassthroughChoice.displayName = 'EventPassthroughChoice'

const EventChoice: React.FC<{
  data: EngineChoiceData
  liveEventResult?: EngineLiveEventResult
  onSubmitPath: PathProcessor
  openPath: EnginePathData
  originId?: ElementId
}> = React.memo(
  ({
    data,
    liveEventResult: eventResult,
    onSubmitPath,
    openPath,
    originId
  }) => {
    const submitChoice = useCallback(
      async () =>
        openPath &&
        (await onSubmitPath({
          originId,
          path: openPath,
          result: {
            id: data.id,
            value: data.title
          }
        })),
      [openPath]
    )

    return (
      <>
        {(!eventResult || openPath) && (
          <div
            className={`event-content-choice ${
              eventResult?.id === data.id ? 'event-content-choice-result' : ''
            }`}
          >
            <button
              onClick={eventResult?.id !== data.id ? submitChoice : undefined}
              disabled={eventResult || !openPath ? true : false}
              className={!openPath ? 'closed-route' : ''}
            >
              <span
                style={{
                  filter:
                    eventResult && eventResult.id !== data.id
                      ? 'blur(2px)'
                      : 'unset'
                }}
              >
                {data.title}
              </span>
            </button>
          </div>
        )}
      </>
    )
  }
)

EventChoice.displayName = 'EventChoice'

const EventChoices: React.FC<{
  event: EngineEventData
  liveEvent: EngineLiveEventData
  onSubmitPath: PathProcessor
}> = React.memo(({ event, liveEvent, onSubmitPath }) => {
  const eventChoicesRef = useRef<HTMLDivElement>(null)

  const { engine, engineDispatch } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId, id: worldId } = engine.worldInfo

  const choices = useLiveQuery(async () => {
    const foundChoices = await new LibraryDatabase(studioId).choices
      .where({ eventId: event.id })
      .toArray()

    try {
      if (foundChoices) {
        const { filteredChoices, openPaths } = await Promise.resolve(
          getChoicesFromEventWithOpenPath(
            studioId,
            foundChoices,
            liveEvent.state,
            engine.devTools.blockedChoicesVisible ? true : false
          )
        )

        return filteredChoices
          .sort(
            (a, b) =>
              event.choices.findIndex((choiceId) => a.id === choiceId) -
              event.choices.findIndex((choiceId) => b.id === choiceId)
          )
          .map((filteredChoice) => {
            return {
              data: filteredChoice,
              openPath: openPaths[filteredChoice.id]
            }
          })
      }

      return []
    } catch (error) {
      throw error
    }
  }, [event, liveEvent, engine.devTools.blockedChoicesVisible])

  const pathPassthroughs = useLiveQuery(async () => {
    const foundPaths = await new LibraryDatabase(studioId).paths
      .where({ originId: event.id })
      .toArray()

    return foundPaths.filter((foundRoute) => foundRoute.choiceId === undefined)
  }, [event, liveEvent, engine.devTools.blockedChoicesVisible])

  const loopback = useCallback(async () => {
    if (liveEvent.prev && liveEvent.origin) {
      await onSubmitPath({
        originId: liveEvent.origin,
        result: { value: ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE }
      })
    } else {
      engineDispatch({
        type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
        message: 'Unable to return. Missing route.'
      })
    }
  }, [liveEvent])

  const restartWorld = useCallback(async () => {
    onSubmitPath({
      result: { value: ENGINE_LIVE_EVENT_STORY_OVER_RESULT_VALUE }
    })
  }, [liveEvent])

  return (
    <div className="event-content-choices" ref={eventChoicesRef}>
      {!event.ending && choices && pathPassthroughs && (
        <>
          {pathPassthroughs.length > 0 && (
            <>
              <EventPassthroughChoice
                paths={pathPassthroughs}
                liveEvent={liveEvent}
                onSubmitPath={onSubmitPath}
                originId={liveEvent.origin}
              />
            </>
          )}

          {pathPassthroughs.length === 0 && (
            <>
              {choices.map(({ data, openPath }) => (
                <EventChoice
                  key={data.id}
                  data={data}
                  liveEventResult={liveEvent.result}
                  onSubmitPath={onSubmitPath}
                  openPath={openPath}
                  originId={liveEvent.origin}
                />
              ))}
            </>
          )}

          {choices.length === 0 && pathPassthroughs.length === 0 && (
            <div className="event-content-choice">
              <>
                {engine.currentLiveEvent !==
                  `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}` && (
                  <>
                    {(!liveEvent.result ||
                      liveEvent.result.value ===
                        ENGINE_LIVE_EVENT_LOOPBACK_RESULT_VALUE) && (
                      <LiveEventLoopbackButton
                        onClick={loopback}
                        liveEventResult={liveEvent.result}
                      />
                    )}

                    {liveEvent.result?.value ===
                      ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE && (
                      <EventPassthroughChoice
                        paths={pathPassthroughs}
                        liveEvent={liveEvent}
                        onSubmitPath={onSubmitPath}
                        originId={liveEvent.origin}
                      />
                    )}
                  </>
                )}

                {engine.currentLiveEvent ===
                  `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}` && (
                  <button disabled={true} className="closed-route">
                    Route Required
                  </button>
                )}
              </>
            </div>
          )}

          {!choices &&
            event.choices.map((choiceId) => (
              <div className="event-content-choice" key={choiceId}>
                <button style={{ opacity: 0 }}>-</button>
              </div>
            ))}
        </>
      )}

      {event.ending && (
        <>
          <div className="event-content-choice">
            <button
              onClick={restartWorld}
              disabled={liveEvent.result ? true : false}
            >
              {translateLiveEventResultValue(
                liveEvent.result?.value || 'Restart'
              )}
            </button>
          </div>

          {!engine.isComposer && (
            <div className="event-content-choice">
              <button
                onClick={() =>
                  engineDispatch({ type: ENGINE_ACTION_TYPE.STOP })
                }
              >
                Title Screen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
})

EventChoices.displayName = 'EventChoices'

export default EventChoices
