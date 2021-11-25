import {
  adjectives,
  animals,
  colors,
  names,
  uniqueNamesGenerator
} from 'unique-names-generator'

import React, { useState, useContext } from 'react'

import {
  CHARACTER_MASK_TYPE,
  COMPONENT_TYPE,
  Game,
  StudioId,
  VARIABLE_TYPE
} from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { PlusOutlined } from '@ant-design/icons'
import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import StoryworldOutline from '../StoryworldOutline'
import StoryworldCharacters from '../StoryworldCharacters'
import StoryworldVariables from '../StoryworldVariables'
import ElementHelpButton from '../ElementHelpButton'

import api from '../../api'

import styles from './styles.module.less'

const TAB_TYPE = {
  CHARACTERS: 'CHARACTERS',
  VARIABLES: 'VARIABLES'
}

const StoryworldInspector: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  const { editorDispatch } = useContext(EditorContext)

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
                  id: TAB_TYPE.CHARACTERS,
                  title: (
                    <div>
                      Characters
                      {game.id && (
                        <PlusOutlined
                          className={styles.tabAddComponentButton}
                          onClick={async () => {
                            if (game.id) {
                              const character = await api().characters.saveCharacter(
                                studioId,
                                {
                                  description: undefined,
                                  gameId: game.id,
                                  masks: [
                                    {
                                      type: CHARACTER_MASK_TYPE.NEUTRAL,
                                      active: true
                                    }
                                  ],
                                  refs: [],
                                  tags: [],
                                  title: uniqueNamesGenerator({
                                    dictionaries: [names, names],
                                    length: 2,
                                    separator: ' '
                                  })
                                }
                              )

                              character.id &&
                                editorDispatch({
                                  type: EDITOR_ACTION_TYPE.OPEN_CHARACTER_MODAL,
                                  characterId: character.id
                                })
                            }
                          }}
                        />
                      )}
                    </div>
                  ),
                  minHeight: 32,
                  content: (
                    <>
                      {game.id && (
                        <StoryworldCharacters
                          studioId={studioId}
                          gameId={game.id}
                        />
                      )}
                    </>
                  ),
                  group: 'bottom'
                },
                {
                  id: TAB_TYPE.VARIABLES,
                  title: (
                    <div>
                      Variables
                      {game.id && (
                        <PlusOutlined
                          className={styles.tabAddComponentButton}
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
                        <StoryworldVariables
                          studioId={studioId}
                          gameId={game.id}
                        />
                      )}
                    </>
                  ),
                  group: 'bottom'
                }
              ],
              panelLock: {
                // @ts-ignore: poor ts defs
                panelExtra: (panelData, context) => {
                  let componentType: COMPONENT_TYPE | undefined

                  switch (panelData.activeId) {
                    case TAB_TYPE.CHARACTERS:
                      componentType = COMPONENT_TYPE.CHARACTER
                      break
                    case TAB_TYPE.VARIABLES:
                      componentType = COMPONENT_TYPE.VARIABLE
                      break
                    default:
                      break
                  }

                  return componentType ? (
                    <ElementHelpButton type={componentType} />
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
    <DividerBox className={styles.StoryworldInspector} mode="vertical">
      <DividerBox className={styles.outline}>
        <StoryworldOutline studioId={studioId} game={game} />
      </DividerBox>

      <DockLayout
        defaultLayout={defaultLayout}
        groups={{
          bottom: {
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

StoryworldInspector.displayName = 'StoryworldInspector'

export default StoryworldInspector
