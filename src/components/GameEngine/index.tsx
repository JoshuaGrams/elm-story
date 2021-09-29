import React, { useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

import { GameId, StudioId } from '../../data/types'

import Runtime from '../../engine/Runtime'

const GameEngine: React.FC<{ studioId: StudioId; gameId: GameId }> = React.memo(
  ({ studioId, gameId }) => {
    const runtimeWrapperRef = useRef<HTMLDivElement>(null)

    const [runtimeStyles, setRuntimeStyles] = useState({})

    useResizeObserver(runtimeWrapperRef, () => {
      if (runtimeWrapperRef.current) {
        setRuntimeStyles(
          runtimeWrapperRef.current.offsetWidth > 680
            ? {
                width: '680px',
                left: '50%',
                transform: 'translate(-50%, 0%)',
                borderLeft: '1px solid var(--renderer-border-color)',
                borderRight: '1px solid var(--renderer-border-color)'
              }
            : {
                width: '100%',
                left: '0%',
                transform: 'translate(0%, 0%)',
                border: 'none'
              }
        )
      }
    })

    return (
      <div ref={runtimeWrapperRef} style={{ width: '100%', height: '100%' }}>
        <div id="runtime" style={runtimeStyles}>
          <Runtime studioId={studioId} game={{ id: gameId }} />
        </div>
      </div>
    )
  }
)

export default GameEngine
