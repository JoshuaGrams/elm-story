import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { LibraryDatabase } from '../lib/db'

import {
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

  const gotoEvent = () => {
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
            <td>ID</td>
            <td>{event.id}</td>
          </tr>
          <tr>
            <td>Type</td>
            <td>{event.type}</td>
          </tr>
          <tr>
            <td>Event</td>
            <td>
              <a title="Goto Event" onClick={gotoEvent}>
                {event.destination}
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      {variables.length > 0 && (
        <table id="engine-xray-variables">
          <thead>
            <tr>
              <th>Variable Title</th>
              <th>ID</th>
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
                      <td>{title}</td>
                      <td>{id}</td>
                      <td>{type}</td>
                      <td>{initialValue || 'undefined'}</td>
                      <td>{event.state[id]?.value || 'undefined'}</td>
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
