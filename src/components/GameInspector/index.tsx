import React, { useState } from 'react'

import { GameId, StudioId } from '../../data/types'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import ComponentProperties from '../ComponentProperties'
import GameProblems from '../GameProblems'

import GameVariables from '../GameVariables'

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
          mode: 'vertical',
          children: [
            {
              tabs: [
                {
                  id: 'propertiesTab',
                  title: 'Properties',
                  minHeight: 30,
                  content: (
                    <>
                      {studioId && (
                        <ComponentProperties
                          studioId={studioId}
                          gameId={gameId}
                        />
                      )}
                    </>
                  ),
                  group: 'default'
                },
                {
                  id: 'problemsTab',
                  title: 'Problems',
                  minHeight: 30,
                  content: <GameProblems />,
                  group: 'default'
                }
              ]
            },
            {
              tabs: [
                {
                  id: 'variablesTab',
                  title: 'Variables',
                  minHeight: 30,
                  content: (
                    <GameVariables studioId={studioId} gameId={gameId} />
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
