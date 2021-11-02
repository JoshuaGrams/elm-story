import { render } from 'react-dom'

import ServiceWorker from './components/ServiceWorker'
import Runtime from './Runtime'

function main() {
  let ___gameId: string = '___gameId___',
    ___packedESGEngineData: string = '___engineData___'

  console.info(
    `made with Elm Story ${String.fromCodePoint(
      0x1f4da
    )} 0.5.1 | https://elmstory.com`
  )

  const rendererContainer = document.getElementById('runtime') || document.body

  if (!import.meta.env.DEV) {
    render(
      <>
        <ServiceWorker />
        <Runtime
          game={{ id: ___gameId, data: ___packedESGEngineData, packed: true }}
        />
      </>,
      rendererContainer
    )
  }

  if (import.meta.env.DEV) {
    import('../data/terminal-access.json').then((data) =>
      render(
        <>
          <ServiceWorker />
          <Runtime
            game={{ id: data._.id, data: JSON.stringify(data), packed: false }}
          />
        </>,
        rendererContainer
      )
    )
  }
}

export default main
