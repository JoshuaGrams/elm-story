import { render } from 'react-dom'

import Runtime from './Runtime'

function main() {
  let ___gameId: string = '___generated___',
    ___packedESGEngineData: string = '___generated___'

  console.info(
    `powered by Elm Story ${String.fromCodePoint(
      0x1f4da
    )} 0.5.0 | https://elmstory.com`
  )

  const rendererContainer = document.getElementById('runtime') || document.body

  if (import.meta.env.PROD) {
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
