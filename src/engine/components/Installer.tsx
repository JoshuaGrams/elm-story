import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { pick } from 'lodash'

import {
  getGameInfo,
  resetGame,
  saveEngineCollectionData,
  saveEngineDefaultGameCollectionData
} from '../lib/api'

import { GameId, StudioId, ESGEngineCollectionData } from '../types/0.5.0'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const Installer: React.FC<{
  studioId: StudioId
  gameId: GameId
  data?: ESGEngineCollectionData
  isEditor: boolean
}> = React.memo(({ children, studioId, gameId, data, isEditor }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  const { data: installed } = useQuery(
    ['installed', engine],
    async () => {
      try {
        if (!isEditor && data) {
          await saveEngineCollectionData(data)
        }

        if (isEditor) {
          await resetGame(studioId, gameId, true)
          await saveEngineDefaultGameCollectionData(studioId, gameId)
        }

        // TODO: troubleshoot stack; line necessary here, otherwise recent events won't load
        isEditor && engineDispatch({ type: ENGINE_ACTION_TYPE.SET_IS_EDITOR })

        return true
      } catch (error) {
        throw error
      }
    },
    { enabled: !engine.installed }
  )

  useEffect(() => {
    if (installed) {
      engineDispatch({
        type: ENGINE_ACTION_TYPE.SET_INSTALLED,
        installed: true
      })
    }
  }, [installed])

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
                    'designer',
                    'id',
                    'studioTitle',
                    'title',
                    'updated',
                    'version'
                  ])
                }
              : pick(gameInfo, [
                  'designer',
                  'id',
                  'studioId',
                  'studioTitle',
                  'title',
                  'updated',
                  'version'
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
