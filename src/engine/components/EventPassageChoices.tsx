import React, { useCallback, useContext, useRef } from 'react'
import { useQuery } from 'react-query'

import { getChoicesFromPassageWithOpenRoute } from '../lib/api'

import {
  ENGINE_LOOPBACK_RESULT_VALUE,
  ENGINE_GAME_OVER_RESULT_VALUE
} from '../lib'
import {
  ComponentId,
  EngineChoiceData,
  EngineEventData,
  EnginePassageData,
  EngineRouteData
} from '../types/0.5.0'

import { RouteProcessor } from './EventPassage'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import EventLoopbackButton from './EventLoopbackButton'
import { useLiveQuery } from 'dexie-react-hooks'
import { LibraryDatabase } from '../lib/db'

const EventPassageChoice: React.FC<{
  data: EngineChoiceData
  eventResult?: string
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
        result: data.title
      })),
    [openRoute]
  )

  return (
    <>
      {openRoute && (
        <div
          className={`event-choice ${
            eventResult === data.title ? 'event-choice-result' : ''
          }`}
        >
          <button onClick={submitChoice} disabled={eventResult ? true : false}>
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

  const { studioId } = engine.gameInfo

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
            event.state
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
    } catch (error) {
      throw error
    }
  })

  // const { data: choices } = useQuery(`choices-${event.id}`, async () => {
  //   const { filteredChoices, openRoutes } =
  //     await getChoicesFromPassageWithOpenRoute(
  //       studioId,
  //       passage.id,
  //       event.state
  //     )

  //   return filteredChoices
  //     .sort(
  //       (a, b) =>
  //         passage.choices.findIndex((choiceId) => a.id === choiceId) -
  //         passage.choices.findIndex((choiceId) => b.id === choiceId)
  //     )
  //     .map((filteredChoice) => {
  //       return {
  //         data: filteredChoice,
  //         openRoute: openRoutes[filteredChoice.id]
  //       }
  //     })
  // })

  const loopback = useCallback(async () => {
    if (event.prev && event.origin) {
      await onSubmitRoute({
        originId: event.origin,
        result: ENGINE_LOOPBACK_RESULT_VALUE
      })
    }
  }, [event])

  const restartGame = useCallback(async () => {
    onSubmitRoute({
      result: ENGINE_GAME_OVER_RESULT_VALUE
    })
  }, [event])

  return (
    <div className="event-choices" ref={eventChoicesRef}>
      {!passage.gameOver && choices && (
        <>
          {choices.map(
            ({ data, openRoute }) =>
              openRoute && (
                <EventPassageChoice
                  key={data.id}
                  data={data}
                  eventResult={event.result}
                  onSubmitRoute={onSubmitRoute}
                  openRoute={openRoute}
                  originId={event.origin}
                />
              )
          )}

          {choices.length === 0 && (
            <div className="event-choice">
              <EventLoopbackButton
                onClick={loopback}
                eventResult={event.result}
              />
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
            <button onClick={restartGame}>New Game</button>
          </div>

          <div className="event-choice">
            <button
              onClick={() => engineDispatch({ type: ENGINE_ACTION_TYPE.STOP })}
            >
              Title Screen
            </button>
          </div>
        </>
      )}
    </div>
  )
})

EventPassageChoices.displayName = 'EventPassageChoices'

export default EventPassageChoices
