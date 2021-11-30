import logger from '../../../lib/logger'

import React, { useEffect, useState } from 'react'

import { WorldId, StudioId } from '../../../data/types'
import {
  EngineDevToolsEvent,
  ENGINE_DEVTOOLS_EVENTS,
  ENGINE_DEVTOOLS_EVENT_TYPE
} from '../../../lib/transport/types/0.5.1'

import { useGame } from '../../../hooks'

import { Menu } from 'antd'

import GameEngine from '../../GameEngine'

export const StoryworldPreviewTools: React.FC<{
  studioId: StudioId
  gameId: WorldId
}> = () => {
  const [highlightExpressions, setHighlightExpressions] = useState(false),
    [blockedChoicesVisible, setBlockedChoicesVisible] = useState(false),
    [xrayVisible, setXrayVisible] = useState(false)

  const dispatchEngineDevToolsEvent = (
    eventType: ENGINE_DEVTOOLS_EVENT_TYPE
  ) => {
    window.dispatchEvent(
      new CustomEvent<EngineDevToolsEvent>(
        ENGINE_DEVTOOLS_EVENTS.EDITOR_TO_ENGINE,
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
          dispatchEngineDevToolsEvent(ENGINE_DEVTOOLS_EVENT_TYPE.RESET)
        }
      >
        Reset
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setXrayVisible(!xrayVisible)
          dispatchEngineDevToolsEvent(ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_XRAY)
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
            ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_EXPRESSIONS
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
            ENGINE_DEVTOOLS_EVENT_TYPE.TOGGLE_BLOCKED_CHOICES
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

const StoryworldPreview: React.FC<{
  studioId: StudioId
  gameId: WorldId
}> = ({ studioId, gameId }) => {
  const game = useGame(studioId, gameId)

  useEffect(() => {
    logger.info(`GameView->useEffect`)
  }, [])

  return (
    <>
      {game && (
        <>
          <GameEngine studioId={studioId} gameId={gameId} />
        </>
      )}
    </>
  )
}

StoryworldPreview.displayName = 'StoryworldPreview'

export default StoryworldPreview
