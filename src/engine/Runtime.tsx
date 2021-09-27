import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { GameId, StudioId } from './types/0.5.0'

import EngineProvider from './contexts/EngineContext'
import SettingsProvider from './contexts/SettingsContext'

import Installer from './components/Installer'
import Renderer from './components/Renderer'

import Settings from './components/Settings'
import Theme from './components/Theme'

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
}> = React.memo(({ studioId, game: { id, data, packed } }) => (
  <QueryClientProvider client={queryClient}>
    <EngineProvider>
      <Installer
        studioId={studioId}
        gameId={id}
        data={data}
        packed={packed}
        isEditor={studioId ? true : false}
      >
        <SettingsProvider>
          {!studioId && (
            <Theme>
              <Settings />

              <Renderer />
            </Theme>
          )}

          {studioId && <Renderer />}
        </SettingsProvider>
      </Installer>
    </EngineProvider>
  </QueryClientProvider>
))

Runtime.displayName = 'Runtime'

export default Runtime
