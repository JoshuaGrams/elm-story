import React, { useState } from 'react'

import { WorldId, StudioId } from '../../data/types'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import ElementProperties from '../ElementProperties'

import styles from './styles.module.less'

const ElementInspector: React.FC<{
  studioId: StudioId
  gameId: WorldId | undefined
}> = ({ studioId, gameId = undefined }) => {
  const [defaultLayout] = useState<LayoutData>({
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          mode: 'vertical',
          children: [
            {
              tabs: [
                {
                  id: 'propertiesTab',
                  title: 'Properties',
                  minHeight: 32,
                  content: (
                    <>
                      {gameId && (
                        <ElementProperties
                          studioId={studioId}
                          gameId={gameId}
                        />
                      )}
                    </>
                  ),
                  group: 'default'
                }
              ]
            }
          ]
        }
      ]
    }
  })

  return (
    <DividerBox className={styles.ComponentInspector} mode="vertical">
      <DockLayout
        defaultLayout={defaultLayout}
        groups={{
          default: {
            floatable: false,
            animated: false,
            maximizable: false,
            tabLocked: true
          }
        }}
        dropMode="edge"
      />
    </DividerBox>
  )
}

ElementInspector.displayName = 'ElementInspector'

export default ElementInspector
