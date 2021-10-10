import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { LibraryDatabase } from '../lib/db'

import {
  EngineDevToolsEvent,
  EngineEventData,
  ENGINE_DEVTOOLS_EVENTS,
  ENGINE_DEVTOOLS_EVENT_TYPE
} from '../types/0.5.0'

import { EngineContext } from '../contexts/EngineContext'

export const ENGINE_XRAY_CONTAINER_HEIGHT = 250

const EventPassageXRay: React.FC<{
  event: EngineEventData
}> = React.memo(({ event }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.gameInfo) return null

  const { studioId, id: gameId } = engine.gameInfo

  const variables = useLiveQuery(
    () => new LibraryDatabase(studioId).variables.where({ gameId }).toArray(),
    [],
    []
  )

  const gotoPassage = () => {
    window.dispatchEvent(
      new CustomEvent<EngineDevToolsEvent>(
        ENGINE_DEVTOOLS_EVENTS.ENGINE_TO_EDITOR,
        {
          detail: {
            eventType: ENGINE_DEVTOOLS_EVENT_TYPE.OPEN_PASSAGE,
            passageId: event.destination
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
            <th colSpan={2}>Current Event | XRAY</th>
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
            <td>Passage</td>
            <td>
              <a title="Goto Passage" onClick={gotoPassage}>
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

EventPassageXRay.displayName = 'EventPassageXRay'

export default EventPassageXRay
