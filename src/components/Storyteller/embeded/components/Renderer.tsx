import React, { useCallback, useContext, useEffect } from 'react'
import { useQuery } from 'react-query'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

import { getBookmarkAuto, saveBookmarkEvent, saveEventDate } from '../lib/api'

import {
  AUTO_ENGINE_BOOKMARK_KEY,
  INITIAL_ENGINE_EVENT_ORIGIN_KEY
} from '../lib'

import TitleCard from './TitleCard'
import EventStreamTitleBar from './EventStreamTitleBar'
import EventStream from './EventStream'

import EventPassageXRay, {
  ENGINE_XRAY_CONTAINER_HEIGHT
} from './EventPassageXRay'
import ResetNotification from './ResetNotifcation'

const Renderer: React.FC = () => {
  const { engine, engineDispatch } = useContext(EngineContext)

  const { data: autoBookmark } = useQuery(
    'autoBookmark',
    async () =>
      engine.gameInfo &&
      (await getBookmarkAuto(engine.gameInfo.studioId, engine.gameInfo.id))
  )

  const startGame = useCallback(async () => {
    if (engine.gameInfo) {
      const updatedBookmark = await saveBookmarkEvent(
        engine.gameInfo.studioId,
        `${AUTO_ENGINE_BOOKMARK_KEY}${engine.gameInfo.id}`,
        `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${engine.gameInfo.id}`
      )

      updatedBookmark &&
        (await saveEventDate(
          engine.gameInfo.studioId,
          `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${engine.gameInfo.id}`,
          updatedBookmark.updated
        ))

      engineDispatch({
        type: ENGINE_ACTION_TYPE.PLAY,
        fromEvent: `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${engine.gameInfo.id}`
      })
    }
  }, [engine.gameInfo])

  const continueGame = useCallback(() => {
    autoBookmark &&
      engineDispatch({
        type: ENGINE_ACTION_TYPE.PLAY,
        fromEvent: autoBookmark.event
      })
  }, [autoBookmark])

  useEffect(() => {
    if (engine.gameInfo && engine.isEditor) {
      autoBookmark?.event ? continueGame() : startGame()
    }
  }, [engine.gameInfo, engine.isEditor])

  return (
    <div id="renderer">
      {engine.gameInfo && (
        <>
          {!engine.playing && !engine.isEditor && (
            <TitleCard onStartGame={startGame} onContinueGame={continueGame} />
          )}

          {engine.playing && (
            <>
              {!engine.isEditor && <EventStreamTitleBar />}
              <EventStream />

              {engine.isEditor && (
                <>
                  {engine.gameInfo && engine.devTools.xrayVisible && (
                    <div
                      style={{
                        height: ENGINE_XRAY_CONTAINER_HEIGHT,
                        width: '100%',
                        bottom: 0,
                        position: 'absolute',
                        background: 'black',
                        overflowY: 'auto'
                      }}
                    >
                      {engine.eventsInStream.length > 0 && (
                        <EventPassageXRay event={engine.eventsInStream[0]} />
                      )}
                    </div>
                  )}

                  <ResetNotification />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

Renderer.displayName = 'Renderer'

export default Renderer
