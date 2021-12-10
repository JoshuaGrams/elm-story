import { v4 as uuid } from 'uuid'
import { pick } from 'lodash'

import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-query'

import { LibraryDatabase } from '../lib/db'

import {
  getWorldInfo,
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
  isComposer: boolean
}> = React.memo(({ children, studioId, worldId, data, isComposer }) => {
  const { engine, engineDispatch } = useContext(EngineContext)

  useQuery(
    [`installed-${engine.installId}`, engine.installed],
    async () => {
      try {
        if (!engine.installed) {
          if (!isComposer && data) {
            const database = new LibraryDatabase(studioId)

            // feedback#95
            database.on('ready', async () => {
              const updateStory = await saveEngineCollectionData(data, false)

              if (updateStory) {
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_UPDATE_WORLD,
                  updating: true
                })

                await removeWorldData(studioId, worldId)
                await saveEngineCollectionData(data, true)

                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_UPDATE_WORLD,
                  updating: false
                })
              }
            })

            await database.open()
          }

          if (isComposer) {
            engineDispatch({ type: ENGINE_ACTION_TYPE.SET_IS_COMPOSER })
            engineDispatch({ type: ENGINE_ACTION_TYPE.HIDE_RESET_NOTIFICATION })

            // #421
            const foundWorld = await getWorldInfo(studioId, worldId)

            if (foundWorld) {
              await resetWorld(studioId, worldId, true, true)
              await saveEngineDefaultWorldCollectionData(
                studioId,
                worldId,
                foundWorld.version
              )

              if (engine.playing) {
                // #422: set this before install completes to prevent
                // event stream from using old version
                // TODO: this is set again after install
                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_WORLD_INFO,
                  gameInfo: foundWorld
                })

                engineDispatch({
                  type: ENGINE_ACTION_TYPE.SET_CURRENT_LIVE_EVENT,
                  id: `${INITIAL_LIVE_ENGINE_EVENT_ORIGIN_KEY}${worldId}`
                })
              }
            } else {
              throw 'Unable to find world during install.'
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
    async function setWorldData() {
      if (engine.installed) {
        const worldInfo = await getWorldInfo(studioId, worldId)

        worldInfo &&
          engineDispatch({
            type: ENGINE_ACTION_TYPE.SET_WORLD_INFO,
            gameInfo: studioId
              ? {
                  studioId, // games in editor database does not have studioId
                  ...pick(worldInfo, [
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
              : pick(worldInfo, [
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

    setWorldData()
  }, [engine.installed])

  return <>{engine.installed && children}</>
})

Installer.displayName = 'Installer'

export default Installer
