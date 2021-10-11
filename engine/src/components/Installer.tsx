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

import { GameId, StudioId, ESGEngineCollectionData } from '../types/0.5.0'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'
import { INITIAL_ENGINE_EVENT_ORIGIN_KEY } from '../lib'

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
            await saveEngineCollectionData(data)
          }

          if (isEditor) {
            engineDispatch({ type: ENGINE_ACTION_TYPE.SET_IS_EDITOR })
            engineDispatch({ type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION })

            await resetGame(studioId, gameId, true)
            await saveEngineDefaultGameCollectionData(studioId, gameId)

            engine.playing &&
              engineDispatch({
                type: ENGINE_ACTION_TYPE.SET_CURRENT_EVENT,
                id: `${INITIAL_ENGINE_EVENT_ORIGIN_KEY}${gameId}`
              })
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

  return <>{engine.installed && children}</>
})

Installer.displayName = 'Installer'

export default Installer
