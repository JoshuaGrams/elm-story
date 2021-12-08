import { render } from 'react-dom'

import ServiceWorker from './components/ServiceWorker'
import Runtime from './Runtime'

function main() {
  let ___worldId: string = '___worldId___',
    ___packedStoryworldData: string = '___storytellerData___'

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
          world={{
            id: ___worldId,
            data: ___packedStoryworldData,
            packed: true
          }}
        />
      </>,
      rendererContainer
    )
  }

  if (import.meta.env.DEV) {
    import('../data/terminal-access_0.0.2/terminal-access_0.0.2.json').then(
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
