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
  getRecentLiveEvents as _getRecentLiveEvents,
  saveLiveEventDestination,
  saveLiveEventState
} from '../lib/api'
import { LibraryDatabase } from '../lib/db'

import {
  EngineLiveEventStateCollection,
  EngineVariableCollection,
  ENGINE_MOTION
} from '../types'
import {
  INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY,
  scrollElementToTop
} from '../lib'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'
import { SettingsContext } from '../contexts/SettingsContext'

import { ENGINE_XRAY_CONTAINER_HEIGHT } from './EventXRay'
import LiveEvent from './LiveEvent'
import AcceleratedDiv from './AcceleratedDiv'

const LiveEventStream: React.FC = React.memo(() => {
  const liveEventsRef = useRef<HTMLDivElement>(null),
    currentLifeEventRef = useRef<HTMLDivElement>(null)

  const { engine, engineDispatch } = useContext(EngineContext),
    { settings } = useContext(SettingsContext)

  if (!engine.worldInfo) return null

  const { studioId, id: worldId } = engine.worldInfo

  const [checkedJumpsOnQuery, setCheckedJumpsOnQuery] = useState(false),
    // used for first render work
    [animated, setAnimated] = useState(false)

  const getRecentLiveEvents = useCallback(async () => {
    if (engine.installed && engine.currentLiveEvent && engine.worldInfo) {
      const recentLiveEvents = await _getRecentLiveEvents(
        studioId,
        worldId,
        engine.currentLiveEvent,
        engine.worldInfo.version,
        3
      )

      engineDispatch({
        type: ENGINE_ACTION_TYPE.APPEND_LIVE_EVENTS_TO_STREAM,
        liveEvents: recentLiveEvents,
        reset: true
      })
    }
  }, [engine.installed, engine.currentLiveEvent, engine.worldInfo])

  // #344: query cached on installation
  useQuery(
    [
      `recentLiveEvents-${engine.installId}`,
      studioId,
      worldId,
      engine.installed
    ],
    async () => {
      try {
        await getRecentLiveEvents()
      } catch (error) {
        throw error
      }

      return true
    },
    {
      enabled: engine.currentLiveEvent ? true : false,
      refetchOnMount: 'always'
    }
  )

  const liveEventsArr = useLiveQuery(
    () =>
      new LibraryDatabase(studioId).live_events.where({ worldId }).toArray(),
    []
  )

  const variablesArr = useLiveQuery(
    () => new LibraryDatabase(studioId).variables.where({ worldId }).toArray(),
    []
  )

  // Updates event state on variable change
  useQuery([`variables-${engine.installId}`, variablesArr], async () => {
    if (engine.isComposer && liveEventsArr && variablesArr) {
      // TODO: duplicate from API
      const variables: EngineVariableCollection = {},
        initialLiveEventState: EngineLiveEventStateCollection = {}

      variablesArr.map(
        (variable) => (variables[variable.id] = cloneDeep(variable))
      )

      Object.keys(variables).map((key) => {
        const { title, type, initialValue } = pick(variables[key], [
          'title',
          'type',
          'initialValue'
        ])

        initialLiveEventState[key] = {
          title,
          type,
          value: initialValue,
          worldId
        }
      })

      await Promise.all([
        liveEventsArr.map(async (liveEvent) => {
          let updatedLiveEventState: EngineLiveEventStateCollection = cloneDeep(
            liveEvent.state
          )

          Object.keys(liveEvent.state).map((variableId) => {
            const foundVariable = variablesArr.find(
              (variable) => variable.id === variableId
            )

            if (!foundVariable) {
              delete updatedLiveEventState[variableId]
            }

            if (foundVariable) {
              updatedLiveEventState[variableId] = {
                ...updatedLiveEventState[variableId],
                title: foundVariable.title,
                type: foundVariable.type,
                value:
                  updatedLiveEventState[variableId].type !== foundVariable.type
                    ? foundVariable.initialValue
                    : updatedLiveEventState[variableId].value
              }
            }
          })

          await Promise.all([
            variablesArr.map(async (variable) => {
              const foundVariable = liveEvent.state[variable.id]

              if (!foundVariable) {
                const { title, type, initialValue } = pick(variable, [
                  'title',
                  'type',
                  'initialValue'
                ])

                updatedLiveEventState[variable.id] = {
                  title,
                  type,
                  value: initialValue,
                  worldId
                }
              }
            })
          ])

          // #362
          engineDispatch({
            type: ENGINE_ACTION_TYPE.UPDATE_LIVE_EVENT_IN_STREAM,
            liveEvent: {
              ...liveEvent,
              state: updatedLiveEventState
            }
          })

          await saveLiveEventState(
            studioId,
            liveEvent.id,
            updatedLiveEventState
          )
        })
      ])
    }
  })

  const world = useLiveQuery(() =>
    new LibraryDatabase(studioId).worlds.get(worldId)
  )

  // TODO: get specific jump based on type or title
  const worldJumps = useLiveQuery(
    () => new LibraryDatabase(studioId).jumps.where({ worldId }).toArray(),
    []
  )

  useQuery([`world-jump-${engine.installId}`, worldJumps], async () => {
    if (engine.isComposer && worldJumps) {
      if (worldJumps.length > 0) {
        const foundOnWorldStartJump = worldJumps.find(
          (jump) => jump.id === world?.jump
        )

        if (foundOnWorldStartJump) {
          const initialLiveEvent = await new LibraryDatabase(
            studioId
          ).live_events.get(`${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}`)

          if (initialLiveEvent) {
            // jump has a scene, but scene doesn't match initial event destination
            if (
              foundOnWorldStartJump.path[1] &&
              initialLiveEvent.destination !== foundOnWorldStartJump.path[1]
            ) {
              foundOnWorldStartJump.path[1] &&
                (await saveLiveEventDestination(
                  studioId,
                  initialLiveEvent.id,
                  foundOnWorldStartJump.path[1]
                ))

              engineDispatch({
                type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
                message: 'On world start jump has changed.'
              })
            }

            // jump doesn't have passage part
            // check scene for first passage matching initial event destination
            if (
              !foundOnWorldStartJump.path[1] &&
              foundOnWorldStartJump.path[0]
            ) {
              const foundScene = await new LibraryDatabase(studioId).scenes.get(
                foundOnWorldStartJump.path[0]
              )

              if (
                foundScene &&
                initialLiveEvent.destination !== foundScene.children[0][1]
              ) {
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
                  message: 'On world start jump has changed.'
                })
              }
            }
          }
        }
      }

      if (worldJumps.length === 0 && checkedJumpsOnQuery) {
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SHOW_RESET_NOTIFICATION,
          message: 'On world start jump has changed.'
        })
      }

      setCheckedJumpsOnQuery(true)
    }
  })

  const liveEventStreamTransitions = useTransition(engine.liveEventsInStream, {
    // immediate: settings.motion === ENGINE_MOTION.REDUCED,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    config: { clamp: true },
    trail: 250,
    delay: 500,
    keys: engine.liveEventsInStream.map((event) => event.id),
    onRest: () => setAnimated(true)
  })

  useResizeObserver(
    liveEventsRef,
    () =>
      currentLifeEventRef.current &&
      currentLifeEventRef.current.scrollIntoView({
        block: 'start'
      })
  )

  return (
    <>
      <div
        id="live-event-stream"
        style={{
          overflowY: settings.open ? 'hidden' : 'auto',
          top: engine.isComposer ? '0' : '',
          marginBottom:
            engine.isComposer && engine.devTools.xrayVisible
              ? ENGINE_XRAY_CONTAINER_HEIGHT
              : 0
        }}
      >
        <div id="live-events" ref={liveEventsRef}>
          {liveEventStreamTransitions((styles, liveEvent) => {
            return (
              <AcceleratedDiv
                style={{ ...styles, transform: 'translate3d(0,0,0)' }}
                ref={
                  engine.currentLiveEvent === liveEvent.id
                    ? currentLifeEventRef
                    : null
                }
              >
                <LiveEvent
                  key={liveEvent.id}
                  data={liveEvent}
                  animated={animated}
                />
              </AcceleratedDiv>
            )
          })}
        </div>
      </div>
    </>
  )
})

LiveEventStream.displayName = 'LiveEventStream'

export default LiveEventStream
