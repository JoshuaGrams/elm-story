import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { unpackEngineData } from './lib/api'

import { WorldId, StudioId, ESGEngineCollectionData } from './types'

import EngineProvider from './contexts/EngineContext'
import SettingsProvider from './contexts/SettingsContext'

import Installer from './components/Installer'
import Renderer from './components/Renderer'

import Settings from './components/Settings'
import Presentation from './components/Presentation'

import StartingDestinationGate from './components/StartingDestinationGate'
import DevTools from './components/DevTools'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
})

const Runtime: React.FC<{
  studioId?: StudioId // if provided, is isEditor install (ESG app)
  world: {
    id: WorldId
    data?: string
    packed?: boolean
  }
}> = React.memo(({ studioId, world: { id, data, packed } }) => {
  const isComposer = studioId ? true : false

  const worldMeta = !isComposer || data ? localStorage.getItem(id) : null

  const engineData: ESGEngineCollectionData | undefined = data
    ? packed
      ? unpackEngineData(data)
      : JSON.parse(data)
    : undefined

  const _studioId =
    studioId || // if editor
    engineData?._.studioId || // if engineData before install
    (worldMeta && JSON.parse(worldMeta).studioId) // if gameMeta post-install

  return (
    <QueryClientProvider client={queryClient}>
      <EngineProvider>
        {_studioId && (
          <>
            {isComposer && (
              <>
                <DevTools />
                <StartingDestinationGate studioId={_studioId} worldId={id}>
                  <Installer
                    studioId={_studioId}
                    worldId={id}
                    data={engineData}
                    isComposer={isComposer}
                  >
                    <Renderer />
                  </Installer>
                </StartingDestinationGate>
              </>
            )}

            {!isComposer && (
              <Installer
                studioId={_studioId}
                worldId={id}
                data={engineData}
                isComposer={isComposer}
              >
                <SettingsProvider>
                  <Presentation>
                    <Settings />

                    <Renderer />
                  </Presentation>
                </SettingsProvider>
              </Installer>
            )}
          </>
        )}
      </EngineProvider>
    </QueryClientProvider>
  )
})

Runtime.displayName = 'Runtime'

export default Runtime
