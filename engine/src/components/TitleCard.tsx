import React, { useContext } from 'react'
import { useQuery } from 'react-query'

import { getBookmarkAuto } from '../lib/api'

import {
  SettingsContext,
  SETTINGS_ACTION_TYPE
} from '../contexts/SettingsContext'
import { EngineContext } from '../contexts/EngineContext'

const TitleCard: React.FC<{
  onStartWorld: () => void
  onContinueWorld: () => void
}> = ({ onStartWorld, onContinueWorld }) => {
  const { settingsDispatch } = useContext(SettingsContext),
    { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId, id: worldId } = engine.worldInfo

  const autoBookmark = useQuery(
    'autoBookmark',
    async () => await getBookmarkAuto(studioId, worldId)
  )

  return (
    <>
      {engine.worldInfo && autoBookmark.data && (
        <div id="title-card">
          <div id="title-card-studio-title">
            {engine.worldInfo.studioTitle} presents...
          </div>

          <div id="title-card-world-title">{engine.worldInfo.title}</div>

          <div id="title-card-world-version">v{engine.worldInfo.version}</div>

          {/* <div id="title-card-world-designer">
            designed by {engine.worldInfo.designer}
          </div> */}

          <div id="title-card-btns">
            <button
              id="title-card-start-btn"
              onClick={
                !autoBookmark.data.liveEventId ? onStartWorld : onContinueWorld
              }
            >
              <span className="event-content-choice-icon">&raquo;</span>
              {!autoBookmark.data.liveEventId ? 'Start' : 'Continue'}
            </button>

            <button
              id="title-card-settings-btn"
              onClick={() =>
                settingsDispatch({ type: SETTINGS_ACTION_TYPE.OPEN })
              }
            >
              <span className="event-content-choice-icon">&raquo;</span>
              Settings
            </button>
          </div>

          <div id="title-card-footer">
            made with{' '}
            <a href="http://elmstory.com" target="_blank">
              Elm Story
            </a>
          </div>
        </div>
      )}
    </>
  )
}

TitleCard.displayName = 'TitleCard'

export default TitleCard
