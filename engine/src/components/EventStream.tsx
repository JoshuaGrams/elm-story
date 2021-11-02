import { cloneDeep, pick } from 'lodash'

import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState
} from 'react'
import { useTransition, animated } from 'react-spring'
import { useQuery } from 'react-query'
import { useLiveQuery } from 'dexie-react-hooks'
import useResizeObserver from '@react-hook/resize-observer'

import {
  getRecentEvents as _getRecentEvents,
  saveEventDestination,
  saveEventState
} from '../lib/api'
import { LibraryDatabase } from '../lib/db'

import {
  EngineEventStateCollection,
  EngineVariableCollection
} from '../types/0.5.1'
import { INITIAL_ENGINE_EVENT_ORIGIN_KEY, scrollElementToBottom } from '../lib'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'
import { SettingsContext } from '../contexts/SettingsContext'

import { ENGINE_XRAY_CONTAINER_HEIGHT } from './EventPassageXRay'
import Event from './Event'

const EventStream: React.FC = React.memo(() => {
  const eventsRef = useRef<HTMLDivElement>(null)

  const { engine, engineDispatch } = useContext(EngineContext),
    { settings } = useContext(SettingsContext)

  if (!engine.gameInfo) return null

  const { studioId, id: gameId } = engine.gameInfo

  const [checkedJumpsOnQuery, setCheckedJumpsOnQuery] = useState(false)

  const getRecentEvents = useCallback(async () => {
    if (engine.installed && engine.currentEvent) {
      const recentEvents = await _getRecentEvents(
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
  }, [engine.installed, engine.currentEvent])

  // #344: query cached on installation
  useQuery(
    [`recentEvents-${engine.installId}`, studioId, gameId, engine.installed],
    async () => {
      try {
        await getRecentEvents()
      } catch (error) {
        throw error
      }

      return true
    },
    { enabled: engine.currentEvent ? true : false, refetchOnMount: 'always' }
  )

  const eventsArr = useLiveQuery(
    () => new LibraryDatabase(studioId).events.where({ gameId }).toArray(),
    []
  )

  const variablesArr = useLiveQuery(
    () => new LibraryDatabase(studioId).variables.where({ gameId }).toArray(),
    []
  )

  // Updates event state on variable change
  useQuery([`variables-${engine.installId}`, variablesArr], async () => {
    if (engine.isEditor && eventsArr && variablesArr) {
      // TODO: duplicate from API
      const variables: EngineVariableCollection = {},
        initialEventState: EngineEventStateCollection = {}

      variablesArr.map(
        (variable) => (variables[variable.id] = cloneDeep(variable))
      )

      Object.keys(variables).map((key) => {
        const { title, type, initialValue } = pick(variables[key], [
          'title',
          'type',
          'initialValue'
        ])

        initialEventState[key] = { gameId, title, type, value: initialValue }
      })

      await Promise.all([
        eventsArr.map(async (event) => {
          let updatedEventState: EngineEventStateCollection = cloneDeep(
            event.state
          )

          Object.keys(event.state).map((variableId) => {
            const foundVariable = variablesArr.find(
              (variable) => variable.id === variableId
            )

            if (!foundVariable) {
              delete updatedEventState[variableId]
            }

            if (foundVariable) {
              updatedEventState[variableId] = {
                ...updatedEventState[variableId],
                title: foundVariable.title,
                type: foundVariable.type,
                value:
                  updatedEventState[variableId].type !== foundVariable.type
                    ? foundVariable.initialValue
                    : updatedEventState[variableId].value
              }
            }
          })

          await Promise.all([
            variablesArr.map(async (variable) => {
              const foundVariable = event.state[variable.id]

              if (!foundVariable) {
                const { title, type, initialValue } = pick(variable, [
                  'title',
                  'type',
                  'initialValue'
                ])

                updatedEventState[variable.id] = {
                  gameId,
                  title,
                  type,
                  value: initialValue
                }
              }
            })
          ])

          // #362
          engineDispatch({
            type: ENGINE_ACTION_TYPE.UPDATE_EVENT_IN_STREAM,
            event: {
              ...event,
              state: updatedEventState
            }
          })

          await saveEventState(studioId, event.id, updatedEventState)
        })
      ])
    }
  })

  const game = useLiveQuery(() =>
    new LibraryDatabase(studioId).games.get(gameId)
  )

  // TODO: get specific jump based on type or title
  const gameJumps = useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ gameId }).toArray(),
    []
  )

  useQuery([`game-jump-${engine.installId}`, gameJumps], async () => {
    if (engine.isEditor && gameJumps) {
      if (gameJumps.length > 0) {
        const foundOnGameStartJump = gameJumps.find(
          (jump) => jump.id === game?.jump
        )

        if (foundOnGameStartJump) {
          const initialEvent = await new LibraryDatabase(studioId).events.get(
            `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`
          )

          if (initialEvent) {
            // jump has a scene, but scene doesn't match initial event destination
            if (
              foundOnGameStartJump.route[1] &&
              initialEvent.destination !== foundOnGameStartJump.route[1]
            ) {
              foundOnGameStartJump.route[1] &&
                (await saveEventDestination(
                  studioId,
                  initialEvent.id,
                  foundOnGameStartJump.route[1]
                ))

              engineDispatch({
                type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
                message: 'On game start jump has changed.'
              })
            }

            // jump doesn't have passage part
            // check scene for first passage matching initial event destination
            if (
              !foundOnGameStartJump.route[1] &&
              foundOnGameStartJump.route[0]
            ) {
              const foundScene = await new LibraryDatabase(studioId).scenes.get(
                foundOnGameStartJump.route[0]
              )

              if (
                foundScene &&
                initialEvent.destination !== foundScene.children[0][1]
              ) {
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
                  message: 'On game start jump has changed.'
                })
              }
            }
          }
        }
      }

      if (gameJumps.length === 0 && checkedJumpsOnQuery) {
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
          message: 'On game start jump has changed.'
        })
      }

      setCheckedJumpsOnQuery(true)
    }
  })

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

  useEffect(() => {
    eventsRef.current && scrollElementToBottom(eventsRef.current)
  }, [engine.devTools.xrayVisible])

  return (
    <>
      <div
        id="event-stream"
        style={{
          overflowY: settings.open ? 'hidden' : 'auto',
          top: engine.isEditor ? '0' : '',
          marginBottom:
            engine.isEditor && engine.devTools.xrayVisible
              ? ENGINE_XRAY_CONTAINER_HEIGHT
              : 0
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
