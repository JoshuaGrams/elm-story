import { v4 as uuid } from 'uuid'
import { pick } from 'lodash'

import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'

import {
  getGameInfo,
  removeWorldData,
  resetWorld,
  saveEngineCollectionData,
  saveEngineDefaultWorldCollectionData
} from '../lib/api'

import { WorldId, StudioId, ESGEngineCollectionData } from '../types'

import { EngineContext, ENGINE_ACTION_TYPE } from '../contexts/EngineContext'
import { INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY } from '../lib'

const Installer: React.FC<{
  studioId: StudioId
  worldId: WorldId
  data?: ESGEngineCollectionData
  isEditor: boolean
}> = React.memo(({ children, studioId, worldId, data, isEditor }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  useQuery(
    [`installed-${engine.installId}`, engine.installed],
    async () => {
      try {
        if (!engine.installed) {
          if (!isEditor && data) {
            const updateGame = await saveEngineCollectionData(data, false)

            if (updateGame) {
              engineDispatch({
                type: ENGINE_ACTION_TYPE.SET_UPDATE_GAME,
                updating: true
              })

              await removeWorldData(studioId, worldId)
              await saveEngineCollectionData(data, true)

              engineDispatch({
                type: ENGINE_ACTION_TYPE.SET_UPDATE_GAME,
                updating: false
              })
            }
          }

          if (isEditor) {
            engineDispatch({ type: ENGINE_ACTION_TYPE.SET_IS_EDITOR })
            engineDispatch({ type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION })

            // #421
            const foundGame = await getGameInfo(studioId, worldId)

            if (foundGame) {
              await resetWorld(studioId, worldId, true, true)
              await saveEngineDefaultWorldCollectionData(
                studioId,
                worldId,
                foundGame.version
              )

              if (engine.playing) {
                // #422: set this before install completes to prevent
                // event stream from using old version
                // TODO: this is set again after install
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_GAME_INFO,
                  gameInfo: foundGame
                })

                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_CURRENT_LIVE_EVENT,
                  id: `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}`
                })
              }
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
        const gameInfo = await getGameInfo(studioId, worldId)

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
