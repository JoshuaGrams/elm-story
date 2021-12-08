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
}> = React.memo(({ event, liveEvent, onSubmitPath: onSubmitRoute }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const inputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputValue] = useState<string | number | undefined>(''),
    [routeError, setRouteError] = useState<boolean>(false)

  const input = useLiveQuery(() =>
    new LibraryDatabase(studioId).inputs.where({ eventId: event.id }).first()
  )

  const inputVariable = useLiveQuery(async () => {
    let variable: EngineVariableData | undefined

    if (input?.variableId) {
      variable = await new LibraryDatabase(studioId).variables.get(
        input.variableId
      )

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
    }

    return variable
  }, [input])

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

          onSubmitRoute({
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

                  <button type="submit">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12z" />
                      <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                  </button>
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

          {!inputVariable && (
            <div className="engine-warning-message">
              Input variable required.
            </div>
          )}
        </>
      )}

      {liveEvent.result && (
        <button disabled={true}>
          {translateLiveEventResultValue(liveEvent.result.value)}
        </button>
      )}
    </div>
  )
})

EventInput.displayName = 'EventInput'

export default EventInput
