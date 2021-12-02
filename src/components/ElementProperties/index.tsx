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
  const { composer } = useContext(ComposerContext)

  const selectedWorld: World | undefined = worldId
    ? useWorld(studioId, worldId)
    : undefined

  useEffect(() => {
    logger.info(
      `ElementProperties->composer.selectedWorldOutlineElement->
       useEffect:${composer.selectedWorldOutlineElement.type}`
    )
  }, [composer.selectedWorldOutlineElement])

  return (
    <div className={styles.ElementProperties}>
      {selectedWorld?.id &&
        (!composer.selectedWorldOutlineElement.id ||
          !composer.selectedWorldOutlineElement.type) && (
          <ComponentDetailView
            studioId={studioId}
            element={{
              id: selectedWorld.id,
              type: ELEMENT_TYPE.WORLD
            }}
          />
        )}

      {composer.selectedWorldOutlineElement.id &&
        composer.selectedWorldOutlineElement.type && (
          <ComponentDetailView
            studioId={studioId}
            element={{
              id: composer.selectedWorldOutlineElement.id,
              type: composer.selectedWorldOutlineElement.type
            }}
          />
        )}
    </div>
  )
}

ElementProperties.displayName = 'ElementProperties'

export default ElementProperties
