import { render } from 'react-dom'

import ServiceWorker from './components/ServiceWorker'
import Runtime from './Runtime'

function main() {
  let ___gameId: string = '___gameId___',
    ___packedESGEngineData: string = '___engineData___'

  console.info(
    `[STORYTELLER] made with Elm Story ${String.fromCodePoint(
      0x1f4da
    )} 0.6.0 | https://elmstory.com`
  )

  const rendererContainer = document.getElementById('runtime') || document.body

  if (!import.meta.env.DEV) {
    render(
      <>
        <ServiceWorker />
        <Runtime
          world={{ id: ___gameId, data: ___packedESGEngineData, packed: true }}
        />
      </>,
      rendererContainer
    )
  }

  if (import.meta.env.DEV) {
    import('../data/amber-shores_0.0.45/amber-shores_0.0.45.json').then(
      (data) =>
        render(
          <>
            <ServiceWorker />
            <Runtime
              world={{
                id: data._.id,
                data: JSON.stringify(data),
                packed: false
              }}
            />
          </>,
          rendererContainer
        )
    )
  }
}

export default main
