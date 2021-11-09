import React, { useState } from 'react'

import { GameId, StudioId } from '../../data/types'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import ComponentProperties from '../ComponentProperties'

import styles from './styles.module.less'

const ComponentInspector: React.FC<{
  studioId: StudioId
  gameId: GameId | undefined
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
                  title: 'Component Properties',
                  minHeight: 32,
                  content: (
                    <>
                      {gameId && (
                        <ComponentProperties
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

ComponentInspector.displayName = 'ComponentInspector'

export default ComponentInspector
