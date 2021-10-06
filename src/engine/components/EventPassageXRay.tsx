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

const EventPassageXRay: React.FC<{ event: EngineEventData }> = ({ event }) => {
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
      <table>
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
            <td>Loopback</td>
            <td>{event.origin ? 'YES' : 'NO'}</td>
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

      <table>
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
          {Object.keys(event.state).map((variableId) => {
            const { title, type, value } = event.state[variableId],
              foundVariable = variables.find(
                (variable) => variable.id === variableId
              )

            return (
              <tr key={`event-state-${variableId}`}>
                <td>{title}</td>
                <td>{variableId}</td>
                <td>{type}</td>
                <td>{foundVariable?.initialValue || 'undefined'}</td>
                <td>{value || 'undefined'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

EventPassageXRay.displayName = 'EventPassageXRay'

export default EventPassageXRay
