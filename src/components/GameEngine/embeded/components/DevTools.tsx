import React, { useEffect, useContext } from 'react'

import {
  EngineDevToolsEvent,
  ENGINE_DEVTOOLS_EVENTS,
  ENGINE_DEVTOOLS_EVENT_TYPE
} from '../types/0.5.0'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const DevTools: React.FC = () => {
  const { engineDispatch } = useContext(EngineContext)

  const processEvent = (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsEvent>

    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_EVENT_TYPE.RESET:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SET_INSTALLED,
          installed: false
        })
        break
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_EXPRESSIONS:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_EXPRESSIONS
        })
        break
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_BLOCKED_CHOICES:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_BLOCKED_CHOICES
        })
        break
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_XRAY:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.TOGGLE_DEVTOOLS_XRAY
        })
        break
      default:
        throw 'Unknown engine event type.'
    }
  }

  useEffect(() => {
    window.addEventListener(
      ENGINE_DEVTOOLS_EVENTS.EDITOR_TO_ENGINE,
      processEvent
    )

    return () => {
      window.removeEventListener(
        ENGINE_DEVTOOLS_EVENTS.EDITOR_TO_ENGINE,
        processEvent
      )
    }
  }, [])

  return null
}

DevTools.displayName = 'DevTools'

export default DevTools
