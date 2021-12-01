import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { ELEMENT_TYPE, World, WorldId, StudioId } from '../../data/types'

import { useWorld } from '../../hooks'

import { EditorContext } from '../../contexts/EditorContext'

import ComponentDetailView from './ElementPropertiesView'

import styles from './styles.module.less'

const ElementProperties: React.FC<{
  studioId: StudioId
  worldId: WorldId | undefined
}> = ({ studioId, worldId = undefined }) => {
  const { editor } = useContext(EditorContext)

  const selectedGame: World | undefined = worldId
    ? useWorld(studioId, worldId)
    : undefined

  useEffect(() => {
    logger.info(
      `ComponentProperties->editor.selectedGameOutlineComponent->
       useEffect:${editor.selectedWorldOutlineElement.type}`
    )
  }, [editor.selectedWorldOutlineElement])

  return (
    <div className={styles.componentProperties}>
      {selectedGame?.id &&
        (!editor.selectedWorldOutlineElement.id ||
          !editor.selectedWorldOutlineElement.type) && (
          <ComponentDetailView
            studioId={studioId}
            component={{
              id: selectedGame.id,
              type: ELEMENT_TYPE.WORLD
            }}
          />
        )}

      {editor.selectedWorldOutlineElement.id &&
        editor.selectedWorldOutlineElement.type && (
          <ComponentDetailView
            studioId={studioId}
            component={{
              id: editor.selectedWorldOutlineElement.id,
              type: editor.selectedWorldOutlineElement.type
            }}
          />
        )}
    </div>
  )
}

ElementProperties.displayName = 'ElementProperties'

export default ElementProperties
