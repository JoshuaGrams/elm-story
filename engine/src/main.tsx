import { render } from 'react-dom'

import Runtime from './Runtime'

import { registerSW } from 'virtual:pwa-register'

function main() {
  let ___gameId: string = '___gameId___',
    ___packedESGEngineData: string = '___engineData___'

  console.info(
    `powered by Elm Story ${String.fromCodePoint(
      0x1f4da
    )} 0.5.0 | https://elmstory.com`
  )

  registerSW({
    onOfflineReady: () => console.info('Offline ready...')
  })

  const rendererContainer = document.getElementById('runtime') || document.body

  if (!import.meta.env.DEV) {
    render(
      <Runtime
        game={{ id: ___gameId, data: ___packedESGEngineData, packed: true }}
      />,
      rendererContainer
    )
  }

  if (import.meta.env.DEV) {
    import('../data/loopback.json').then((data) =>
      render(
        <Runtime
          game={{ id: data._.id, data: JSON.stringify(data), packed: false }}
        />,
        rendererContainer
      )
    )
  }
}

export default main
