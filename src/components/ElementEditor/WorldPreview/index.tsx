import logger from '../../../lib/logger'

import React, { useEffect, useState } from 'react'

import { WorldId, StudioId } from '../../../data/types'
import {
  EngineDevToolsLiveEvent,
  ENGINE_DEVTOOLS_LIVE_EVENTS,
  ENGINE_DEVTOOLS_LIVE_EVENT_TYPE
} from '../../../lib/transport/types/0.6.0'

import { useWorld } from '../../../hooks'

import { Menu } from 'antd'

import Storyteller from '../../Storyteller'

export const StoryworldPreviewTools: React.FC<{
  studioId: StudioId
  worldId: WorldId
}> = () => {
  const [highlightExpressions, setHighlightExpressions] = useState(false),
    [blockedChoicesVisible, setBlockedChoicesVisible] = useState(false),
    [xrayVisible, setXrayVisible] = useState(false)

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

  return (
    <Menu mode="horizontal">
      <Menu.Item
        onClick={() =>
          dispatchEngineDevToolsEvent(ENGINE_DEVTOOLS_LIVE_EVENT_TYPE.RESET)
        }
      >
        Reset
      </Menu.Item>
      <Menu.Item
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
