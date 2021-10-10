import { cloneDeep } from 'lodash'

import React, {
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect
} from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { findOpenRoute, getRoutesFromInput } from '../lib/api'
import { LibraryDatabase } from '../lib/db'

import {
  VARIABLE_TYPE,
  EngineEventData,
  EnginePassageData,
  EngineVariableData
} from '../types/0.5.0'
import { RouteProcessor, translateEventResultValue } from './EventPassage'

import { EngineContext } from '../contexts/EngineContext'

const EventPassageInput: React.FC<{
  passage: EnginePassageData
  event: EngineEventData
  onSubmitRoute: RouteProcessor
}> = React.memo(({ passage, event, onSubmitRoute }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.gameInfo) return null

  const { studioId } = engine.gameInfo

  const inputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputValue] = useState<string | number | undefined>(''),
    [routeError, setRouteError] = useState<boolean>(false)

  const input = useLiveQuery(() =>
    new LibraryDatabase(studioId).inputs
      .where({ passageId: passage.id })
      .first()
  )

  const inputVariable = useLiveQuery(async () => {
    let variable: EngineVariableData | undefined

    if (input?.variableId) {
      variable = await new LibraryDatabase(studioId).variables.get(
        input.variableId
      )

      if (variable) {
        let value: string | number | undefined = event.state[variable.id].value

        switch (event.state[variable.id].type) {
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
        const stateWithInputValue = cloneDeep(event.state)

        stateWithInputValue[inputVariable.id].value =
          boolValue || `${inputValue}`

        const foundOpenRoute = await findOpenRoute(
          studioId,
          await getRoutesFromInput(studioId, input.id),
          stateWithInputValue
        )

        // if event.origin, loopback
        if (foundOpenRoute || event.origin) {
          setRouteError(false)

          onSubmitRoute({
            originId: event.origin,
            result: {
              id: input.id,
              value: boolValue
                ? boolValue === 'true'
                  ? 'Yes'
                  : 'No'
                : `${inputValue}`
            },
            route: foundOpenRoute,
            state: stateWithInputValue
          })
        }

        if (!foundOpenRoute && !event.origin) {
          setRouteError(true)
        }
      }

      !inputValue && inputRef.current && inputRef.current.focus()
    },
    [event, input, inputVariable, inputValue]
  )

  useEffect(() => {
    inputValue && setRouteError(false)
  }, [inputValue])

  return (
    <div className={`${!event.result ? 'event-input' : 'event-input-result'}`}>
      {!event.result && input && (
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
                <div className="event-choices">
                  <button
                    className="event-choice"
                    key="event-passage-input-yes-btn"
                    onClick={() => submitInput('true')}
                  >
                    Yes
                  </button>
                  <button
                    className="event-choice"
                    key="event-passage-input-no-btn"
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

      {event.result && (
        <button disabled={true}>
          {translateEventResultValue(event.result.value)}
        </button>
      )}
    </div>
  )
})

EventPassageInput.displayName = 'EventPassageInput'

export default EventPassageInput
