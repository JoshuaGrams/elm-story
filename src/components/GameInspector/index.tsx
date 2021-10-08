import React, { useState } from 'react'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator'

import api from '../../api'

import { GameId, StudioId, VARIABLE_TYPE } from '../../data/types'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import { PlusOutlined } from '@ant-design/icons'

import ComponentProperties from '../ComponentProperties'
import GameStyles from '../GameStyles'

import GameVariables from '../GameVariables'
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
                  id: 'stylesTab',
                  title: 'Styles',
                  minHeight: 32,
                  content: <GameStyles />,
                  group: 'default'
                }
              ]
            },
            {
              tabs: [
                {
                  id: 'variablesTab',
                  title: (
                    <div>
                      Variables
                      {gameId && (
                        <PlusOutlined
                          className={styles.tabAddVariableButton}
                          onClick={async () => {
                            // TODO: Fire only when tab is active #92
                            const uniqueNames = uniqueNamesGenerator({
                              dictionaries: [adjectives, colors, animals],
                              length: 3
                            })

                            await api().variables.saveVariable(studioId, {
                              gameId,
                              title: uniqueNames
                                .split('_')
                                .map((uniqueName, index) => {
                                  return index === 0
                                    ? uniqueName
                                    : `${uniqueName
                                        .charAt(0)
                                        .toUpperCase()}${uniqueName.substr(
                                        1,
                                        uniqueName.length - 1
                                      )}`
                                })
                                .join(''),
                              type: VARIABLE_TYPE.BOOLEAN,
                              initialValue: 'false',
                              tags: []
                            })
                          }}
                        />
                      )}
                    </div>
                  ),
                  minHeight: 32,
                  content: (
                    <>
                      {gameId && (
                        <GameVariables studioId={studioId} gameId={gameId} />
                      )}
                    </>
                  ),
                  group: 'default'
                },
                {
                  id: 'problemsTab',
                  title: 'Problems',
                  minHeight: 32,
                  content: <GameProblems />,
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
