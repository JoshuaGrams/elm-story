import React, { useState } from 'react'

import { GameId, StudioId } from '../../data/types'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import ComponentProperties from '../ComponentProperties'
import GameProblems from '../GameProblems'

import styles from './styles.module.less'

const GameInspector: React.FC<{
  studioId: StudioId
  gameId: GameId | undefined
}> = ({ studioId, gameId = undefined }) => {
  const [defaultLayout] = useState<LayoutData>({
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          tabs: [
            {
              id: 'propertiesTab',
              title: 'Properties',
              content: (
                <>
                  {studioId && (
                    <ComponentProperties studioId={studioId} gameId={gameId} />
                  )}
                </>
              ),
              group: 'default'
            },
            {
              id: 'problemsTab',
              title: 'Problems',
              content: <GameProblems />,
              group: 'default'
            }
          ]
        }
      ]
    }
  })

  return (
    <DividerBox className={styles.gameInspector} mode="vertical">
      <DockLayout
        defaultLayout={defaultLayout}
        groups={{
          default: {
            floatable: false,
            animated: false,
            maximizable: false
          }
        }}
        dropMode="edge"
      />
    </DividerBox>
  )
}

export default GameInspector
