import React, { useContext } from 'react'
import { useQuery } from 'react-query'

import { getBookmarkAuto } from '../lib/api'

import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'
import { EngineContext } from '../contexts/EngineContext'

const TitleCard: React.FC<{
  onStartGame: () => void
  onContinueGame: () => void
}> = ({ onStartGame, onContinueGame }) => {
  const { settingsDispatch } = useContext(SettingsContext),
    { engine } = useContext(EngineContext)

  if (!engine.gameInfo) return null

  const { studioId, id: gameId } = engine.gameInfo

  const autoBookmark = useQuery(
    'autoBookmark',
    async () => await getBookmarkAuto(studioId, gameId)
  )

  return (
    <>
      {engine.gameInfo && autoBookmark.data && (
        <div id="title-card">
          <div id="title-card-studio-title">
            {engine.gameInfo.studioTitle} presents...
          </div>

          <div id="title-card-game-title">{engine.gameInfo.title}</div>

          <div id="title-card-game-version">v{engine.gameInfo.version}</div>

          <div id="title-card-game-designer">
            designed by {engine.gameInfo.designer}
          </div>

          <div id="title-card-btns">
            <button
              id="title-card-start-btn"
              onClick={!autoBookmark.data.event ? onStartGame : onContinueGame}
            >
              {!autoBookmark.data.event ? 'START' : 'CONTINUE'}
            </button>

            <button
              id="title-card-settings-btn"
              onClick={() =>
                settingsDispatch({ type: SETTINGS_ACTION_TYPE.OPEN })
              }
            >
              SETTINGS
            </button>
          </div>

          <div id="title-card-footer">
            powered by <a href="http://elmstory.com">Elm Story</a>
          </div>
        </div>
      )}
    </>
  )
}

TitleCard.displayName = 'TitleCard'

export default TitleCard
