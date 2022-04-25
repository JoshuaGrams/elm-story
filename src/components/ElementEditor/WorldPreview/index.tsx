import logger from '../../../lib/logger'

import React, { useEffect, useState } from 'react'

import { WorldId, StudioId } from '../../../data/types'
import {
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../../../lib/transport/types/0.7.1'

import { useWorld } from '../../../hooks'

import { Menu } from 'antd'

import Storyteller from '../../Storyteller'

export const StoryworldPreviewTools: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = () => {
  const [highlightCharacters, setHighlightCharacters] = useState(false),
    [highlightExpressions, setHighlightExpressions] = useState(false),
    [blockedChoicesVisible, setBlockedChoicesVisible] = useState(false),
    [xrayVisible, setXrayVisible] = useState(false),
    [muted, setMuted] = useState(true)

  const dispatchEngineDevToolsEvent = (
    eventType: ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
  ) => {
    window.dispatchEvent(
      new CustomEvent<EngineDevToolsLiveEvent>(
        ENGINE_DEVTOOLS_LIVE_EVENTS.COMPOSER_TO_ENGINE,
        {
          detail: { eventType }
        }
      )
    )
  }

  const processEvent = (event: Event) => {
    const { detail } = event as CustomEvent<EngineDevToolsLiveEvent>

    switch (detail.eventType) {
      case ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.MUTE:
        if (detail.muteFrom === 'AUDIO_PROFILE') setMuted(true)
        return
      default:
        return
    }
  }

  useEffect(() => {
    window.addEventListener(
      ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
      processEvent
    )

    return () => {
      window.removeEventListener(
        ENGINE_DEVTOOLS_LIVE_EVENTS.ENGINE_TO_COMPOSER,
        processEvent
      )
    }
  }, [])

  return (
    <Menu mode="horizontal">
      <Menu.Item
        title="Reset Storyworld"
        onClick={() =>
          dispatchEngineDevToolsEvent(ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RESET)
        }
      >
        Reset
      </Menu.Item>

      <Menu.Item
        title={muted ? 'Unmute Audio' : 'Mute Audio'}
        onClick={() => {
          setMuted(!muted)

          dispatchEngineDevToolsEvent(
            ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_MUTED
          )
        }}
        className={`${
          !muted ? 'esg-menu-item-enabled' : 'esg-menu-item-disabled'
        }`}
      >
        <div
          style={{
            display: 'grid',
            width: '100%',
            height: 32,
            placeContent: 'center'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="100%"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            {!muted && (
              <>
                <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
                <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
                <path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z" />
              </>
            )}
            {muted && (
              <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zM6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96V5.04zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z" />
            )}
          </svg>
        </div>
      </Menu.Item>

      <Menu.Item
        title={xrayVisible ? 'Hide Xray' : 'Show Xray'}
        onClick={() => {
          setXrayVisible(!xrayVisible)
          dispatchEngineDevToolsEvent(
            ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_XRAY
          )
        }}
        className={`${
          xrayVisible ? 'esg-menu-item-enabled' : 'esg-menu-item-disabled'
        }`}
      >
        XRAY
      </Menu.Item>

      <Menu.Item
        title={
          highlightCharacters
            ? 'Disable Character Highlighting'
            : 'Enable Character Highlighting'
        }
        onClick={() => {
          setHighlightCharacters(!highlightCharacters)
          dispatchEngineDevToolsEvent(
            ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_CHARACTERS
          )
        }}
        className={`${
          highlightCharacters
            ? 'esg-menu-item-enabled'
            : 'esg-menu-item-disabled'
        }`}
      >
        Characters
      </Menu.Item>

      <Menu.Item
        title={
          highlightExpressions
            ? 'Disable Expression Highlighting'
            : 'Enable Expression Highlighting'
        }
        onClick={() => {
          setHighlightExpressions(!highlightExpressions)
          dispatchEngineDevToolsEvent(
            ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_EXPRESSIONS
          )
        }}
        className={`${
          highlightExpressions
            ? 'esg-menu-item-enabled'
            : 'esg-menu-item-disabled'
        }`}
      >
        Expressions
      </Menu.Item>

      <Menu.Item
        title={
          blockedChoicesVisible
            ? 'Hide Blocked Choices'
            : 'Show Blocked Choices'
        }
        onClick={() => {
          setBlockedChoicesVisible(!blockedChoicesVisible)
          dispatchEngineDevToolsEvent(
            ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.TOGGLE_BLOCKED_CHOICES
          )
        }}
        className={`${
          blockedChoicesVisible
            ? 'esg-menu-item-enabled'
            : 'esg-menu-item-disabled'
        }`}
      >
        Blocked Choices
      </Menu.Item>
    </Menu>
  )
}

const WorldPreview: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = ({ studioId, worldId }) => {
  const world = useWorld(studioId, worldId)

  useEffect(() => {
    logger.info(`WorldPreview->useEffect`)
  }, [])

  return (
    <>
      {world && (
        <>
          <Storyteller studioId={studioId} worldId={worldId} />
        </>
      )}
    </>
  )
}

WorldPreview.displayName = 'WorldPreview'

export default WorldPreview
