import React, { useCallback, useContext, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { useSpring } from '@react-spring/core'
import { animated } from '@react-spring/web'
import { useLiveQuery } from 'dexie-react-hooks'

import { findDestinationPassage, getEventInitial, getPassage } from '../lib/api'
import { LibraryDatabase } from '../lib/db'

import {
  ElementId,
  COMPONENT_TYPE,
  PASSAGE_TYPE,
  EngineEventData,
  EngineEventStateCollection,
  EnginePassageData,
  EngineRouteData,
  EngineEventResult
} from '../types'
import {
  ENGINE_EVENT_GAME_OVER_RESULT_VALUE,
  ENGINE_EVENT_LOOPBACK_RESULT_VALUE,
  ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE
} from '../lib'
import { NextEventProcessor } from './Event'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import EventPassageContent from './EventPassageContent'
import EventPassageChoices from './EventPassageChoices'
import EventPassageInput from './EventPassageInput'
import { EventLoopbackButtonContent } from './EventLoopbackButton'

export type RouteProcessor = ({
  originId: origin,
  result,
  route,
  state
}: {
  originId?: ElementId
  result: EngineEventResult
  route?: EngineRouteData
  state?: EngineEventStateCollection
}) => Promise<void>

// TODO: move to event
export function translateEventResultValue(value: string) {
  switch (value) {
    case ENGINE_EVENT_PASSTHROUGH_RESULT_VALUE:
      return <>Continue</>
    case ENGINE_EVENT_LOOPBACK_RESULT_VALUE:
      return <>{EventLoopbackButtonContent}</>
    case ENGINE_EVENT_GAME_OVER_RESULT_VALUE:
      return <>New Game</>
    default:
      return <>{value}</>
  }
}

export const EventPassage: React.FC<{
  passageId: ElementId
  event: EngineEventData
  onRouteFound: NextEventProcessor
}> = React.memo(({ passageId, event, onRouteFound }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  if (!engine.gameInfo) return null

  const passageRef = useRef<HTMLDivElement>(null)

  const { studioId, id: gameId } = engine.gameInfo

  const passage = useLiveQuery(
    () => new LibraryDatabase(studioId).passages.get(passageId),
    [passageId]
  )

  const processRoute: RouteProcessor = useCallback(
    async ({ originId, result, route, state }) => {
      try {
        let foundPassage: EnginePassageData | undefined

        if (route) {
          foundPassage = await getPassage(
            studioId,
            await findDestinationPassage(
              studioId,
              route.destinationId,
              route.destinationType
            )
          )
        }

        if (!route) {
          if (
            result.value !== ENGINE_EVENT_GAME_OVER_RESULT_VALUE &&
            originId
          ) {
            foundPassage = await getPassage(studioId, originId)
          }

          if (result.value === ENGINE_EVENT_GAME_OVER_RESULT_VALUE) {
            const initialEvent = await getEventInitial(studioId, gameId)

            if (initialEvent) {
              foundPassage = await getPassage(
                studioId,
                initialEvent.destination
              )
            }
          }
        }

        if (foundPassage) {
          onRouteFound({
            destinationId: foundPassage.id,
            eventResult: result,
            originId:
              route?.destinationType === COMPONENT_TYPE.PASSAGE
                ? originId || event.destination
                : undefined,
            passageType: foundPassage.type,
            routeId: route?.id,
            state
          })
        } else {
          throw 'Unable to process route. Could not find passage.'
        }
      } catch (error) {
        throw error
      }
    },
    [passage, event]
  )

  const [styles, api] = useSpring(() => ({
    height: 0,
    overflow: 'hidden'
  }))

  useResizeObserver(passageRef, () => {
    passageRef.current &&
      api.start({
        height: passageRef.current.getBoundingClientRect().height + 1 // handles border bottom change
      })
  })

  return (
    <animated.div style={styles}>
      <div
        className="event-passage"
        style={{
          borderBottom:
            event.id === engine.currentEvent
              ? 'none'
              : 'var(--event-passage-bottom-border)'
        }}
        ref={passageRef}
      >
        {passage && (
          <>
            <EventPassageContent
              content={passage.content}
              state={event.state}
            />

            {passage.type === PASSAGE_TYPE.CHOICE && (
              <EventPassageChoices
                passage={passage}
                event={event}
                onSubmitRoute={processRoute}
              />
            )}

            {passage.type === PASSAGE_TYPE.INPUT && (
              <EventPassageInput
                passage={passage}
                event={event}
                onSubmitRoute={processRoute}
              />
            )}
          </>
        )}

        {!passage && (
          <div className="engine-warning-message">
            Passage missing or has been removed.{' '}
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
    </animated.div>
  )
})

EventPassage.displayName = 'EventPassage'

export default EventPassage
