import logger from '../../lib/logger'

import React, { useContext, useEffect } from 'react'

import { ELEMENT_TYPE, World, WorldId, StudioId } from '../../data/types'

import { useWorld } from '../../hooks'

import { ComposerContext } from '../../contexts/ComposerContext'

import ComponentDetailView from './ElementPropertiesView'

import styles from './styles.module.less'

const ElementProperties: React.FC<{
  studioId: StudioId
  worldId: WorldId | undefined
}> = ({ studioId, worldId = undefined }) => {
  const { composer: editor } = useContext(ComposerContext)

  const selectedWorld: World | undefined = worldId
    ? useWorld(studioId, worldId)
    : undefined

  useEffect(() => {
    logger.info(
      `ElementProperties->editor.selectedWorldOutlineElement->
       useEffect:${editor.selectedWorldOutlineElement.type}`
    )
  }, [editor.selectedWorldOutlineElement])

  return (
    <div className={styles.componentProperties}>
      {selectedWorld?.id &&
        (!editor.selectedWorldOutlineElement.id ||
          !editor.selectedWorldOutlineElement.type) && (
          <ComponentDetailView
            studioId={studioId}
            element={{
              id: selectedWorld.id,
              type: ELEMENT_TYPE.WORLD
            }}
          />
        )}

      {editor.selectedWorldOutlineElement.id &&
        editor.selectedWorldOutlineElement.type && (
          <ComponentDetailView
            studioId={studioId}
            element={{
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
