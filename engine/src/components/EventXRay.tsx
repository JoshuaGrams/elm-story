import React, { useContext, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { LibraryDatabase } from '../lib/db'

import {
  ElementId,
  EngineDevToolsLiveEvent,
  EngineLiveEventData,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../types'

import { EngineContext } from '../contexts/EngineContext'

export const ENGINE_XRAY_CONTAINER_HEIGHT = 250

const EventXRay: React.FC<{
  event: EngineLiveEventData
}> = React.memo(({ event }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId, id: worldId } = engine.worldInfo

  const variables = useLiveQuery(
    () => new LibraryDatabase(studioId).variables.where({ worldId }).toArray(),
    [],
    []
  )

  // REMEMBER: you want event.destination :P
  const [eventTitle, setEventTitle] = useState<string | undefined>(undefined),
    [sceneId, setSceneId] = useState<ElementId | undefined>(undefined),
    [sceneTitle, setSceneTitle] = useState<string | undefined>(undefined)

  const processEvent = (_event: Event) => {
    const { detail } = _event as CustomEvent<EngineDevToolsLiveEvent>

    if (
      detail.eventType === ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RETURN_EVENT_DATA
    ) {
      if (!sceneId || sceneId === detail?.event?.sceneId) {
        setSceneTitle(detail?.event?.sceneTitle || sceneTitle || undefined)
        setSceneId(detail?.event?.sceneId || sceneId || undefined)
      }

      if (!eventTitle || detail.eventId === event.destination) {
        setEventTitle(detail?.event?.title || eventTitle || undefined)
      }
    }
  }

  const selectScene = () => {
    if (!sceneId || !sceneTitle) return

    window.dispatchEvent(
      new CustomEvent<EngineDevToolsLiveEvent>(
        ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
        {
          detail: {
            eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.OPEN_SCENE,
            scene: {
              id: sceneId,
              title: sceneTitle
            }
          }
        }
      )
    )
  }

  const selectEvent = () => {
    window.dispatchEvent(
      new CustomEvent<EngineDevToolsLiveEvent>(
        ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
        {
          detail: {
            eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.OPEN_EVENT,
            eventId: event.destination
          }
        }
      )
    )
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<EngineDevToolsLiveEvent>(
        ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
        {
          detail: {
            eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.GET_EVENT_DATA,
            eventId: event.destination
          }
        }
      )
    )
  }, [event])

  useEffect(() => {
    if (engine.isComposer) {
      window.addEventListener(
        ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
        processEvent
      )
    }

    return () => {
      if (engine.isComposer) {
        window.removeEventListener(
          ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
          processEvent
        )
      }
    }
  }, [eventTitle, sceneId, sceneTitle, event.destination])

  return (
    <div id="engine-xray">
      <table className="event-data">
        <thead>
          <tr>
            <th colSpan={2}>Current Live Event | XRAY</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="event-data-starting-col">ID</td>
            <td title={event.id}>{event.id}</td>
          </tr>
          <tr>
            <td className="event-data-starting-col">Type</td>
            <td title={event.type}>{event.type}</td>
          </tr>
          <tr>
            <td className="event-data-starting-col">Event</td>
            <td>
              <a title={`Select Scene (${sceneId})`} onClick={selectScene}>
                {sceneTitle}
              </a>{' '}
              &rarr;{' '}
              <a
                title={`Select Event (${event.destination})`}
                onClick={selectEvent}
              >
                {eventTitle}
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      {variables.length > 0 && (
        <table id="engine-xray-variables">
          <thead>
            <tr>
              <th className="event-data-starting-col">Variable</th>
              <th className="event-data-var-id-col">ID</th>
              <th>Type</th>
              <th>Initial Value</th>
              <th>Current Value</th>
            </tr>
          </thead>

          <tbody>
            {event &&
              variables.length > 0 &&
              variables.map((variable) => {
                const { id, title, type, initialValue } = variable

                return (
                  <>
                    <tr key={`event-state-variable-${id}`}>
                      <td className="event-data-starting-col" title={title}>
                        {title}
                      </td>
                      <td className="event-data-var-id-col" title={id}>
                        {id}
                      </td>
                      <td title={type}>{type}</td>
                      <td title={initialValue || 'undefined'}>
                        {initialValue || 'undefined'}
                      </td>
                      <td title={initialValue || 'undefined'}>
                        {event.state[id]?.value || 'undefined'}
                      </td>
                    </tr>
                  </>
                )
              })}
          </tbody>
        </table>
      )}
    </div>
  )
})

EventXRay.displayName = 'EventXRay'

export default EventXRay
