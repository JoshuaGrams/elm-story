import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { pick } from 'lodash'

import {
  getGameInfo,
  saveEngineCollectionData,
  saveEngineDefaultGameCollectionData,
  unpackEngineData
} from '../lib/api'

import { GameId, StudioId } from '../types/0.5.0'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'

const Installer: React.FC<{
  studioId?: StudioId
  gameId: GameId
  data?: string
  packed?: boolean
  isEditor: boolean
}> = React.memo(({ children, studioId, gameId, data, packed, isEditor }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  const installed = useQuery(
    ['installed', engine.installed],
    async () => {
      try {
        if (!isEditor && data) {
          await saveEngineCollectionData(
            packed ? unpackEngineData(data) : JSON.parse(data)
          )
        }

        if (isEditor && studioId) {
          await saveEngineDefaultGameCollectionData(studioId, gameId)
        }

        return true
      } catch (error) {
        throw error
      }
    },
    { enabled: !engine.installed }
  )

  useEffect(() => {
    if (installed.data) {
      studioId && engineDispatch({ type: ENGINE_ACTION_TYPE.SET_IS_EDITOR })

      engineDispatch({
        type: ENGINE_ACTION_TYPE.SET_INSTALLED,
        installed: true
      })
    }
  }, [installed.data])

  useEffect(() => {
    async function setGameData() {
      if (engine.installed) {
        const gameInfo = await getGameInfo(gameId)

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
