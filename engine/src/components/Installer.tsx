import { v4 as uuid } from 'uuid'
import { pick } from 'lodash'

import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'

import {
  getGameInfo,
  resetGame,
  saveEngineCollectionData,
  saveEngineDefaultGameCollectionData
} from '../lib/api'

import { GameId, StudioId, ESGEngineCollectionData } from '../types/0.5.1'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'
import { INITIAL_ENGINE_EVENT_ORIGIN_KEY } from '../lib'

import GameUpdate from './GameUpdate'

const Installer: React.FC<{
  studioId: StudioId
  gameId: GameId
  data?: ESGEngineCollectionData
  isEditor: boolean
}> = React.memo(({ children, studioId, gameId, data, isEditor }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  useQuery(
    [`installed-${engine.installId}`, engine.installed],
    async () => {
      try {
        if (!engine.installed) {
          if (!isEditor && data) {
            const updateGame = await saveEngineCollectionData(data)

            if (updateGame) {
              // TODO: 373
              // empty old game data, but not bookmarks, events and settings
              // install game data
              // maybe save game version to each event?
              // take the most recent event, confirm destination exists
              // if destination no longer exists, go back until event does
              // copy first event with existing destination and patch game state
              // create new event and update auto bookmark
              // after this happens, it shouldn't be possible to go back to these old events
              // if we can't find any events with existing destinations, have to create a new initial

              engineDispatch({ type: ENGINE_ACTION_TYPE.UPDATE_GAME })
            }
          }

          if (isEditor) {
            engineDispatch({ type: ENGINE_ACTION_TYPE.SET_IS_EDITOR })
            engineDispatch({ type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION })

            const foundGame = await getGameInfo(studioId, gameId)

            if (foundGame) {
              await resetGame(studioId, gameId, true, true)
              await saveEngineDefaultGameCollectionData(
                studioId,
                gameId,
                foundGame.version
              )

              engine.playing &&
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_CURRENT_EVENT,
                  id: `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`
                })
            } else {
              throw 'Unable to find game during install.'
            }
          }

          engineDispatch({
            type: ENGINE_ACTION_TYPE.SET_INSTALLED,
            installed: true
          })

          engineDispatch({
            type: ENGINE_ACTION_TYPE.SET_INSTALL_ID,
            id: uuid()
          })
        }

        return true
      } catch (error) {
        throw error
      }
    },
    { enabled: !engine.installed }
  )

  useEffect(() => {
    async function setGameData() {
      if (engine.installed) {
        const gameInfo = await getGameInfo(studioId, gameId)

        gameInfo &&
          engineDispatch({
            type: ENGINE_ACTION_TYPE.SET_GAME_INFO,
            gameInfo: studioId
              ? {
                  studioId, // games in editor database does not have studioId
                  ...pick(gameInfo, [
                    'copyright',
                    'description',
                    'designer',
                    'id',
                    'studioTitle',
                    'title',
                    'updated',
                    'version',
                    'website'
                  ])
                }
              : pick(gameInfo, [
                  'copyright',
                  'description',
                  'designer',
                  'id',
                  'studioId',
                  'studioTitle',
                  'title',
                  'updated',
                  'version',
                  'website'
                ])
          })
      }
    }

    setGameData()
  }, [engine.installed])

  return (
    <>
      {engine.updating && <GameUpdate />}

      {engine.installed && children}
    </>
  )
})

Installer.displayName = 'Installer'

export default Installer
