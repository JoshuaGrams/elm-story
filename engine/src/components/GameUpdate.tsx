import React, { useContext, useEffect } from 'react'

import { EngineContext } from '../contexts/EngineContext'

const GameUpdate: React.FC = () => {
  const { engine } = useContext(EngineContext)

  useEffect(() => {
    if (engine.updating) {
    }
  }, [engine.updating])

  return <div>Updating game...</div>
}

GameUpdate.displayName = 'GameUpdate'

export default GameUpdate
