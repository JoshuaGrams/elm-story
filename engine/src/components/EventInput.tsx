import { cloneDeep } from 'lodash'

import React, {
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect
} from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSpring } from 'react-spring'

import { findOpenPath, getPathsFromInput } from '../lib/api'
import { LibraryDatabase } from '../lib/db'

import {
  VARIABLE_TYPE,
  EngineLiveEventData,
  EngineEventData,
  EngineVariableData,
  ENGINE_MOTION
} from '../types'
import { PathProcessor, translateLiveEventResultValue } from './Event'

import { EngineContext } from '../contexts/EngineContext'
import { SettingsContext } from '../contexts/SettingsContext'

import AcceleratedDiv from './AcceleratedDiv'
import useResizeObserver from '@react-hook/resize-observer'

const EventInput: React.FC<{
  event: EngineEventData
  liveEvent: EngineLiveEventData
  onSubmitPath: PathProcessor
}> = React.memo(({ event, liveEvent, onSubmitPath }) => {
  const { engine } = useContext(EngineContext),
    { settings } = useContext(SettingsContext)

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const inputRef = useRef<HTMLInputElement>(null)

  const [showInput, setShowInput] = useState(false),
    [inputValue, setInputValue] = useState<string | number | undefined>(''),
    [pathError, setPathError] = useState<boolean>(false)

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

        // elmstorygames/feedback#264
        // if (variable) {
        //   let value: string | number | undefined =
        //     liveEvent.state[variable.id].value

        //   switch (liveEvent.state[variable.id].type) {
        //     case VARIABLE_TYPE.NUMBER:
        //       value = Number(value)
        //       break
        //     default:
        //       value = undefined
        //       break
        //   }

        //   setInputValue(value || variable?.initialValue)
        // }

        return variable
      }
    },
    [input],
    undefined
  )

  const submitInput = useCallback(
    async (boolValue?: 'true' | 'false') => {
      // elmstorygames/feedback#278
      if (input && inputVariable && (inputValue || boolValue)) {
        const stateWithInputValue = cloneDeep(liveEvent.state)

        stateWithInputValue[inputVariable.id].value =
          boolValue ||
          // #400
          `${typeof inputValue === 'string' ? inputValue.trim() : inputValue}`

        const foundOpenPath = await findOpenPath(
          studioId,
          await getPathsFromInput(studioId, input.id),
          stateWithInputValue
        )

        // if event.origin, loopback
        if (foundOpenPath || liveEvent.origin) {
          setPathError(false)

          onSubmitPath({
            originId: liveEvent.origin,
            result: {
              id: input.id,
              value:
                boolValue !== undefined
                  ? boolValue === 'true'
                    ? 'Yes'
                    : 'No'
                  : `${inputValue}`
            },
            path: foundOpenPath,
            state: stateWithInputValue
          })
        }

        if (!foundOpenPath && !liveEvent.origin) {
          setPathError(true)
        }
      }

      !inputValue && inputRef.current && inputRef.current.focus()
    },
    [liveEvent, input, inputVariable, inputValue]
  )

  const inputContainerRef = useRef<HTMLDivElement>(null)

  const [height, setHeight] = useState(0)

  const [styles, springApi] = useSpring(
    () => ({
      immediate: settings.motion === ENGINE_MOTION.REDUCED,
      height,
      opacity: 1,
      overflow: 'hidden',
      config: {
        clamp: true
      }
    }),
    [height]
  )

  useResizeObserver(inputContainerRef, () => {
    inputContainerRef.current &&
      springApi.start({
        immediate: settings.motion === ENGINE_MOTION.REDUCED,
        height: inputContainerRef.current.getBoundingClientRect().height
      })
  })

  useEffect(() => {
    inputValue && setPathError(false)
  }, [inputValue])

  return (
    <AcceleratedDiv style={styles}>
      <div
        className={`${
          !liveEvent.result
            ? 'event-content-input'
            : 'event-content-input-result'
        }`}
        style={{
          paddingTop:
            inputVariable?.type === VARIABLE_TYPE.BOOLEAN && !liveEvent.result
              ? 0
              : '1.4rem'
        }}
        ref={inputContainerRef}
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
                    <div
                      className="event-content-input-wrapper"
                      style={{
                        display: showInput ? 'inline-grid' : 'block',
                        gridTemplateColumns: showInput
                          ? '1fr var(--min-interaction-height)'
                          : 'unset'
                      }}
                    >
                      <>
                        {/* elmstorygames/feedback#272 */}
                        {!showInput && (
                          <button
                            className="event-content-input-cta"
                            onClick={() => setShowInput(true)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="100%"
                              height="100%"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M14 5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12zM2 4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2z" />
                              <path d="M13 10.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm0-2a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-5 0A.25.25 0 0 1 8.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 8 8.75v-.5zm2 0a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-.5zm1 2a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-5-2A.25.25 0 0 1 6.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 6 8.75v-.5zm-2 0A.25.25 0 0 1 4.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 4 8.75v-.5zm-2 0A.25.25 0 0 1 2.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 2 8.75v-.5zm11-2a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-2 0a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-2 0A.25.25 0 0 1 9.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 9 6.75v-.5zm-2 0A.25.25 0 0 1 7.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 7 6.75v-.5zm-2 0A.25.25 0 0 1 5.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 5 6.75v-.5zm-3 0A.25.25 0 0 1 2.25 6h1.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-1.5A.25.25 0 0 1 2 6.75v-.5zm0 4a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm2 0a.25.25 0 0 1 .25-.25h5.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-5.5a.25.25 0 0 1-.25-.25v-.5z" />
                            </svg>
                          </button>
                        )}

                        {showInput && (
                          <>
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
                              onChange={(event) =>
                                setInputValue(event.target.value)
                              }
                              // elmstorygames/feedback#264
                              onFocus={(event) => event.target.focus()}
                              onBlur={() =>
                                !inputRef.current?.value && setShowInput(false)
                              }
                            />

                            <button
                              type="submit"
                              style={{ border: 'none', padding: 0 }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="3.2rem"
                                height="3.2rem"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </>
                    </div>
                  </form>
                )}

                {inputVariable.type === VARIABLE_TYPE.BOOLEAN && (
                  <div className="event-content-choices">
                    <div style={{ padding: '0 1.4rem' }}>
                      <button
                        className="event-content-choice-boolean"
                        key="event-content-input-yes-btn"
                        onClick={() => submitInput('true')}
                      >
                        <span className="event-content-choice-icon">
                          &raquo;
                        </span>
                        Yes
                      </button>
                      <button
                        className="event-content-choice-boolean"
                        key="event-content-input-no-btn"
                        onClick={() => submitInput('false')}
                      >
                        <span className="event-content-choice-icon">
                          &raquo;
                        </span>
                        No
                      </button>
                    </div>
                  </div>
                )}

                {pathError && (
                  <div className="engine-warning-message">Missing path.</div>
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
          <div className="event-content-choice">
            <button disabled={true}>
              {translateLiveEventResultValue(liveEvent.result.value)}
            </button>
          </div>
        )}
      </div>
    </AcceleratedDiv>
  )
})

EventInput.displayName = 'EventInput'

export default EventInput
