import { cloneDeep } from 'lodash'

import React, {
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect
} from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { findOpenPath, getPathsFromInput } from '../lib/api'
import { LibraryDatabase } from '../lib/db'

import {
  VARIABLE_TYPE,
  EngineLiveEventData,
  EngineEventData,
  EngineVariableData
} from '../types'
import { PathProcessor, translateLiveEventResultValue } from './Event'

import { EngineContext } from '../contexts/EngineContext'

const EventInput: React.FC<{
  event: EngineEventData
  liveEvent: EngineLiveEventData
  onSubmitPath: PathProcessor
}> = React.memo(({ event, liveEvent, onSubmitPath }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const inputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputValue] = useState<string | number | undefined>(''),
    [routeError, setRouteError] = useState<boolean>(false)

  const input = useLiveQuery(
    async () => {
      const input = new LibraryDatabase(studioId).inputs
        .where({ eventId: event.id })
        .first()

      return input || null
    },
    [event.id],
    undefined
  )

  const inputVariable = useLiveQuery(
    async () => {
      if (input === null) return null

      let variable: EngineVariableData | null

      if (input?.variableId) {
        variable =
          (await new LibraryDatabase(studioId).variables.get(
            input.variableId
          )) || null

        if (variable) {
          let value: string | number | undefined =
            liveEvent.state[variable.id].value

          switch (liveEvent.state[variable.id].type) {
            case VARIABLE_TYPE.NUMBER:
              value = Number(value)
              break
            default:
              value = undefined
              break
          }

          setInputValue(value || variable?.initialValue)
        }

        return variable
      }
    },
    [input],
    undefined
  )

  const submitInput = useCallback(
    async (boolValue?: 'true' | 'false') => {
      if (input && inputVariable && inputValue) {
        const stateWithInputValue = cloneDeep(liveEvent.state)

        stateWithInputValue[inputVariable.id].value =
          boolValue ||
          // #400
          `${typeof inputValue === 'string' ? inputValue.trim() : inputValue}`

        const foundOpenRoute = await findOpenPath(
          studioId,
          await getPathsFromInput(studioId, input.id),
          stateWithInputValue
        )

        // if event.origin, loopback
        if (foundOpenRoute || liveEvent.origin) {
          setRouteError(false)

          onSubmitPath({
            originId: liveEvent.origin,
            result: {
              id: input.id,
              value: boolValue
                ? boolValue === 'true'
                  ? 'Yes'
                  : 'No'
                : `${inputValue}`
            },
            path: foundOpenRoute,
            state: stateWithInputValue
          })
        }

        if (!foundOpenRoute && !liveEvent.origin) {
          setRouteError(true)
        }
      }

      !inputValue && inputRef.current && inputRef.current.focus()
    },
    [liveEvent, input, inputVariable, inputValue]
  )

  useEffect(() => {
    inputValue && setRouteError(false)
  }, [inputValue])

  return (
    <div
      style={{ height: 44 }}
      className={`${
        !liveEvent.result ? 'event-content-input' : 'event-content-input-result'
      }`}
    >
      {!liveEvent.result && input && (
        <>
          {inputVariable && (
            <>
              {inputVariable.type !== VARIABLE_TYPE.BOOLEAN && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()

                    submitInput()
                  }}
                >
                  <div className="event-content-input-wrapper">
                    <input
                      ref={inputRef}
                      id={input.id}
                      autoComplete="off"
                      // #400
                      spellCheck="false"
                      autoFocus
                      type={
                        inputVariable.type === VARIABLE_TYPE.STRING
                          ? 'text'
                          : 'number'
                      }
                      placeholder="Response..."
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onFocus={(event) => event.target.select()}
                    />

                    <button type="submit" style={{ border: 'none' }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17.5"
                        height="17.5"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              )}

              {inputVariable.type === VARIABLE_TYPE.BOOLEAN && (
                <div className="event-content-choices">
                  <button
                    className="event-content-choice"
                    key="event-content-input-yes-btn"
                    onClick={() => submitInput('true')}
                  >
                    Yes
                  </button>
                  <button
                    className="event-content-choice"
                    key="event-content-input-no-btn"
                    onClick={() => submitInput('false')}
                  >
                    No
                  </button>
                </div>
              )}

              {routeError && (
                <div className="engine-warning-message">Missing route.</div>
              )}
            </>
          )}

          {inputVariable === null && (
            <div className="engine-warning-message">
              Input variable required.
            </div>
          )}
        </>
      )}

      {liveEvent.result && (
        <div className="event-content-choice ">
          <button disabled={true}>
            {translateLiveEventResultValue(liveEvent.result.value)}
          </button>
        </div>
      )}
    </div>
  )
})

EventInput.displayName = 'EventInput'

export default EventInput
