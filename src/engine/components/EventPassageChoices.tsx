import React, { useCallback, useContext, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { LibraryDatabase } from '../lib/db'
import { getChoicesFromPassageWithOpenRoute } from '../lib/api'

import {
  ENGINE_LOOPBACK_RESULT_VALUE,
  ENGINE_GAME_OVER_RESULT_VALUE,
  INITIAL_ENGINE_EVENT_ORIGIN_KEY
} from '../lib'
import {
  ComponentId,
  EngineChoiceData,
  EngineEventData,
  EnginePassageData,
  EngineRouteData,
  EngineEventResult
} from '../types/0.5.0'
import { RouteProcessor } from './EventPassage'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import EventLoopbackButton from './EventLoopbackButton'

const EventPassageChoice: React.FC<{
  data: EngineChoiceData
  eventResult?: EngineEventResult
  onSubmitRoute: RouteProcessor
  openRoute: EngineRouteData
  originId?: ComponentId
}> = React.memo(({ data, eventResult, onSubmitRoute, openRoute, originId }) => {
  const submitChoice = useCallback(
    async () =>
      openRoute &&
      (await onSubmitRoute({
        originId,
        route: openRoute,
        result: {
          id: data.id,
          value: data.title
        }
      })),
    [openRoute]
  )

  return (
    <>
      {(!eventResult || openRoute) && (
        <div
          className={`event-choice ${
            eventResult?.id === data.id ? 'event-choice-result' : ''
          }`}
        >
          <button
            onClick={submitChoice}
            disabled={eventResult || !openRoute ? true : false}
            className={!openRoute ? 'closed-route' : ''}
          >
            {data.title}
          </button>
        </div>
      )}
    </>
  )
})

EventPassageChoice.displayName = 'EventPassageChoice'

const EventPassageChoices: React.FC<{
  passage: EnginePassageData
  event: EngineEventData
  onSubmitRoute: RouteProcessor
}> = React.memo(({ passage, event, onSubmitRoute }) => {
  const eventChoicesRef = useRef<HTMLDivElement>(null)

  const { engine, engineDispatch } = useContext(EngineContext)

  if (!engine.gameInfo) return null

  const { studioId, id: gameId } = engine.gameInfo

  const choices = useLiveQuery(async () => {
    const foundChoices = await new LibraryDatabase(studioId).choices
      .where({ passageId: passage.id })
      .toArray()

    try {
      if (foundChoices) {
        const { filteredChoices, openRoutes } = await Promise.resolve(
          getChoicesFromPassageWithOpenRoute(
            studioId,
            foundChoices,
            event.state,
            engine.devTools.blockedChoicesVisible ? true : false
          )
        )

        return filteredChoices
          .sort(
            (a, b) =>
              passage.choices.findIndex((choiceId) => a.id === choiceId) -
              passage.choices.findIndex((choiceId) => b.id === choiceId)
          )
          .map((filteredChoice) => {
            return {
              data: filteredChoice,
              openRoute: openRoutes[filteredChoice.id]
            }
          })
      }

      return []
    } catch (error) {
      throw error
    }
  }, [passage, event, engine.devTools.blockedChoicesVisible])

  const loopback = useCallback(async () => {
    if (event.prev && event.origin) {
      await onSubmitRoute({
        originId: event.origin,
        result: { value: ENGINE_LOOPBACK_RESULT_VALUE }
      })
    } else {
      engineDispatch({
        type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
        message: 'Unable to return. Missing route.'
      })
    }
  }, [event])

  const restartGame = useCallback(async () => {
    onSubmitRoute({
      result: { value: ENGINE_GAME_OVER_RESULT_VALUE }
    })
  }, [event])

  return (
    <div className="event-choices" ref={eventChoicesRef}>
      {!passage.gameOver && choices && (
        <>
          {choices.map(({ data, openRoute }) => (
            <EventPassageChoice
              key={data.id}
              data={data}
              eventResult={event.result}
              onSubmitRoute={onSubmitRoute}
              openRoute={openRoute}
              originId={event.origin}
            />
          ))}

          {choices.length === 0 && (
            <div className="event-choice">
              <>
                {engine.currentEvent !==
                  `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}` && (
                  <>
                    {(!event.result ||
                      event.result.value === ENGINE_LOOPBACK_RESULT_VALUE) && (
                      <EventLoopbackButton
                        onClick={loopback}
                        eventResult={event.result}
                      />
                    )}

                    {event.result &&
                      event.result.value !== ENGINE_LOOPBACK_RESULT_VALUE && (
                        <button disabled={true}>Route Required</button>
                      )}
                  </>
                )}

                {engine.currentEvent ===
                  `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}` && (
                  <button disabled={true}>Route Required</button>
                )}
              </>
            </div>
          )}

          {!choices &&
            passage.choices.map((choiceId) => (
              <div className="event-choice" key={choiceId}>
                <button style={{ opacity: 0 }}>-</button>
              </div>
            ))}
        </>
      )}

      {passage.gameOver && (
        <>
          <div className="event-choice">
            <button
              onClick={restartGame}
              disabled={event.result ? true : false}
            >
              New Game
            </button>
          </div>

          {!engine.isEditor && (
            <div className="event-choice">
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

EventPassageChoices.displayName = 'EventPassageChoices'

export default EventPassageChoices
