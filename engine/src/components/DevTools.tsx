import React, { useEffect, useContext } from 'react'

import {
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const DevTools: React.FC = () => {
  const { engineDispatch } = useContext(EngineContext)

  const processEvent = (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsLiveEvent>

    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RESET:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SET_INSTALLED,
          installed: false
        })

        setTimeout(
          () =>
            engineDispatch({
              type: ENGINE_ACTION_TYPE.DEVTOOLS_RESET,
              reset: true
            }),
          1
        )
        return
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_CHARACTERS:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_CHARACTERS
        })
        return
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_EXPRESSIONS:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_EXPRESSIONS
        })
        return
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_BLOCKED_CHOICES:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_BLOCKED_CHOICES
        })
        return
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_XRAY:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_XRAY
        })
        return
      default:
        return
    }
  }

  useEffect(() => {
    window.addEventListener(
      ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
      processEvent
    )

    return () => {
      window.removeEventListener(
        ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
        processEvent
      )
    }
  }, [])

  return null
}

DevTools.displayName = 'DevTools'

export default DevTools
