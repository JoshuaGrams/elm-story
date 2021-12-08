import React, { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { EventCharacterPersona } from '../types'

import { EngineContext } from '../contexts/EngineContext'

import { getCharacterMask } from '../lib/api'

const placeholder = `<svg width="200" height="250" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2_3)">
<rect width="200" height="250" fill="#080808"/>
<path d="M173.935 188.818C173.935 188.818 143.205 176.526 133.048 172.139C126.792 169.435 121.596 164.502 120.312 157.355C120.655 156.999 120.995 156.634 121.324 156.255L125.89 151.019C126.982 149.766 128.016 148.474 129.023 147.159C133.425 162.52 154.404 167.184 168.858 165.945C148.634 157.339 153.591 114.151 156.129 92.0496C156.333 90.2675 156.522 88.6225 156.681 87.1438C158.262 87.7378 160.714 88.2978 164.966 87.2541C157.586 83.6416 157.23 72.9081 157.055 67.6273C157.026 66.7561 157.003 66.0333 156.953 65.5153C153.466 29.4113 128.705 13.417 99.82 20.0976C97.3996 18.7212 94.0366 18.6166 90.5903 18.5095C84.8302 18.3304 78.8373 18.1441 76.6239 12C73.1373 15.4789 73.1656 18.607 74.41 21.6022C57.9179 23.1126 41.6583 36.041 41.1055 70.284C41.0937 71.0254 41.1345 72.1158 41.1846 73.4528C41.4823 81.4089 42.107 98.0994 33.914 101.979C40.0766 104.083 42.4152 101.724 42.4152 101.724C50.9985 149.56 39.6145 160.441 35.3738 162.019C58.2041 162.019 62.2868 149.049 64.8431 140.928C65.0643 140.225 65.2742 139.558 65.4837 138.94C67.9555 143.205 70.827 147.258 74.1096 151.019L77.8995 155.367C77.3439 163.642 71.6803 169.141 64.9508 172.28C54.1422 177.326 25.7785 188.668 25.7785 188.668C10.3296 195.131 0 212.443 0 231.868V250H200V232.137C200 212.582 189.532 195.181 173.935 188.818Z" fill="#262626"/>
</g>
<defs>
<clipPath id="clip0_2_3">
<rect width="200" height="250" fill="white"/>
</clipPath>
</defs>
</svg>
`

const EventCharacterMask: React.FC<{
  persona: EventCharacterPersona
}> = React.memo(({ persona }) => {
  const { engine } = useContext(EngineContext)

  if (!engine.worldInfo) return null

  const { studioId } = engine.worldInfo

  const mask = useLiveQuery(
    async () =>
      persona && (await getCharacterMask(studioId, persona?.[0], persona?.[1])),
    [persona]
  )

  return (
    <div className="event-character-mask">
      <div
        className="event-character-mask-portrait"
        style={{
          backgroundImage: mask?.assetId
            ? `url(../../data/amber-shores_0.0.45/assets/${mask.assetId}.jpeg)`
            : `url(data:image/svg+xml;base64,${btoa(placeholder)})`
        }}
      />
    </div>
  )
})

EventCharacterMask.displayName = 'EventCharacterMask'

export default EventCharacterMask
