import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { unpackEngineData } from './lib/api'

import { GameId, StudioId, ESGEngineCollectionData } from './types/0.5.0'

import EngineProvider from './contexts/EngineContext'
import SettingsProvider from './contexts/SettingsContext'

import Installer from './components/Installer'
import Renderer from './components/Renderer'

import Settings from './components/Settings'
import Theme from './components/Theme'

import StartingDestinationGate from './components/StartingDestinationGate'

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

  const gameMeta = !isEditor ? localStorage.getItem(id) : null

  const engineData: ESGEngineCollectionData | undefined =
    !gameMeta && data
      ? packed
        ? unpackEngineData(data)
        : JSON.parse(data)
      : undefined

  const _studioId = studioId || engineData?._.studioId

  return (
    <QueryClientProvider client={queryClient}>
      <EngineProvider>
        {_studioId && (
          <StartingDestinationGate studioId={_studioId} gameId={id}>
            <Installer
              studioId={_studioId}
              gameId={id}
              data={engineData}
              isEditor={isEditor}
            >
              {!isEditor && (
                <SettingsProvider>
                  <Theme>
                    <Settings />

                    <Renderer />
                  </Theme>
                </SettingsProvider>
              )}

              {isEditor && <Renderer />}
            </Installer>
          </StartingDestinationGate>
        )}
      </EngineProvider>
    </QueryClientProvider>
  )
})

Runtime.displayName = 'Runtime'

export default Runtime
