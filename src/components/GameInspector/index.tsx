import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator'

import React, { useState } from 'react'

import { COMPONENT_TYPE, Game, StudioId, VARIABLE_TYPE } from '../../data/types'

import { PlusOutlined } from '@ant-design/icons'
import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import GameOutline from '../GameOutline'
import GameVariables from '../GameVariables'
import ComponentHelpButton from '../ComponentHelpButton'

import api from '../../api'

import styles from './styles.module.less'

const GameInspector: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
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
                  id: 'outlineTab',
                  title: 'Outline',
                  minHeight: 32,
                  content: <GameOutline studioId={studioId} game={game} />,
                  group: 'default'
                },
                {
                  id: 'stylesTab',
                  title: 'Styles',
                  minHeight: 32,
                  content: <div>Styles</div>,
                  group: 'default'
                },
                {
                  id: 'problemsTab',
                  title: 'Problems',
                  minHeight: 32,
                  content: <div>Problems</div>,
                  group: 'default'
                }
              ]
            },
            {
              tabs: [
                {
                  id: 'charactersTab',
                  title: 'Characters',
                  minHeight: 32,
                  content: <div>Characters</div>,
                  group: 'default'
                },
                {
                  id: 'variablesTab',
                  title: (
                    <div>
                      Variables
                      {game.id && (
                        <PlusOutlined
                          className={styles.tabAddVariableButton}
                          onClick={async () => {
                            // TODO: Fire only when tab is active #92
                            const uniqueNames = uniqueNamesGenerator({
                              dictionaries: [adjectives, colors, animals],
                              length: 3
                            })

                            game.id &&
                              (await api().variables.saveVariable(studioId, {
                                gameId: game.id,
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
                              }))
                          }}
                        />
                      )}
                    </div>
                  ),
                  minHeight: 32,
                  content: (
                    <>
                      {game.id && (
                        <GameVariables studioId={studioId} gameId={game.id} />
                      )}
                    </>
                  ),
                  group: 'default'
                }
              ],
              panelLock: {
                // @ts-ignore: poor ts defs
                panelExtra: (panelData, context) => {
                  return panelData.activeId === 'variablesTab' ? (
                    <ComponentHelpButton type={COMPONENT_TYPE.VARIABLE} />
                  ) : null
                }
              }
            }
          ]
        }
      ]
    }
  })

  return (
    <DividerBox className={styles.GameInspector} mode="vertical">
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

GameInspector.displayName = 'GameInspector'

export default GameInspector
