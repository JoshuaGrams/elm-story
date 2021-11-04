import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { unpackEngineData } from './lib/api'

import { GameId, StudioId, ESGEngineCollectionData } from './types/0.5.1'

import EngineProvider from './contexts/EngineContext'
import SettingsProvider from './contexts/SettingsContext'

import Installer from './components/Installer'
import Renderer from './components/Renderer'

import Settings from './components/Settings'
import Theme from './components/Theme'

import StartingDestinationGate from './components/StartingDestinationGate'
import DevTools from './components/DevTools'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
})

const Runtime: React.FC<{
  studioId?: StudioId // if provided, is isEditor install (ESG app)
  game: {
    id: GameId
    data?: string
    packed?: boolean
  }
}> = React.memo(({ studioId, game: { id, data, packed } }) => {
  const isEditor = studioId ? true : false

  const gameMeta = !isEditor || data ? localStorage.getItem(id) : null

  const engineData: ESGEngineCollectionData | undefined = data
    ? packed
      ? unpackEngineData(data)
      : JSON.parse(data)
    : undefined

  const _studioId =
    studioId || // if editor
    engineData?._.studioId || // if engineData before install
    (gameMeta && JSON.parse(gameMeta).studioId) // if gameMeta post-install

  return (
    <QueryClientProvider client={queryClient}>
      <EngineProvider>
        {_studioId && (
          <>
            {isEditor && (
              <StartingDestinationGate studioId={_studioId} gameId={id}>
                <Installer
                  studioId={_studioId}
                  gameId={id}
                  data={engineData}
                  isEditor={isEditor}
                >
                  <DevTools />
                  <Renderer />
                </Installer>
              </StartingDestinationGate>
            )}

            {!isEditor && (
              <Installer
                studioId={_studioId}
                gameId={id}
                data={engineData}
                isEditor={isEditor}
              >
                <SettingsProvider>
                  <Theme>
                    <Settings />

                    <Renderer />
                  </Theme>
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
