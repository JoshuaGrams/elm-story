import React, { useEffect, useCallback, useContext } from 'react'

import { EngineDevToolsEvent, ENGINE_DEVTOOLS_EVENT_TYPE } from '../types/0.5.0'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const DevTools: React.FC = () => {
  const { engineDispatch } = useContext(EngineContext)

  const processEvent = useCallback((event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsEvent>

    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_EVENT_TYPE.RESET:
        engineDispatch({
          type: ENGINE_ACTION_TYPE.SET_INSTALLED,
          installed: false
        })
        break
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_EXPRESSIONS:
        break
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_BLOCKED_CHOICES:
        break
      case ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_XRAY:
        break
      default:
        throw 'Unknown engine event type.'
    }
  }, [])

  useEffect(() => {
    window.addEventListener('engine:devtools:event', processEvent)

    return () => {
      window.removeEventListener('engine:devtools:event', processEvent)
    }
  }, [])

  return null
}

DevTools.displayName = 'DevTools'

export default DevTools
