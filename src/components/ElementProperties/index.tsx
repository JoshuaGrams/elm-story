import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { COMPONENT_TYPE, Game, GameId, StudioId } from '../../data/types'

import { useGame } from '../../hooks'

import { EditorContext } from '../../contexts/EditorContext'

import ComponentDetailView from './ComponentDetailView'

import styles from './styles.module.less'

const ElementProperties: React.FC<{
  studioId: StudioId
  gameId: GameId | undefined
}> = ({ studioId, gameId = undefined }) => {
  const { editor } = useContext(EditorContext)

  const selectedGame: Game | undefined = gameId
    ? useGame(studioId, gameId)
    : undefined

  useEffect(() => {
    logger.info(
      `ComponentProperties->editor.selectedGameOutlineComponent->
       useEffect:${editor.selectedGameOutlineComponent.type}`
    )
  }, [editor.selectedGameOutlineComponent])

  return (
    <div className={styles.componentProperties}>
      {selectedGame?.id &&
        (!editor.selectedGameOutlineComponent.id ||
          !editor.selectedGameOutlineComponent.type) && (
          <ComponentDetailView
            studioId={studioId}
            component={{
              id: selectedGame.id,
              type: COMPONENT_TYPE.GAME
            }}
          />
        )}

      {editor.selectedGameOutlineComponent.id &&
        editor.selectedGameOutlineComponent.type && (
          <ComponentDetailView
            studioId={studioId}
            component={{
              id: editor.selectedGameOutlineComponent.id,
              type: editor.selectedGameOutlineComponent.type
            }}
          />
        )}
    </div>
  )
}

ElementProperties.displayName = 'ElementProperties'

export default ElementProperties
