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
  ELEMENT_TYPE,
  World,
  StudioId,
  VARIABLE_TYPE
} from '../../data/types'

import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { PlusOutlined } from '@ant-design/icons'
import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import StoryworldOutline from '../StoryworldOutline'
import WorldCharacters from '../WorldCharacters'
import WorldVariables from '../WorldVariables'
import ElementHelpButton from '../ElementHelpButton'

import api from '../../api'

import styles from './styles.module.less'

const TAB_TYPE = {
  CHARACTERS: 'CHARACTERS',
  VARIABLES: 'VARIABLES'
}

const WorldInspector: React.FC<{ studioId: StudioId; world: World }> = ({
  studioId,
  world
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
                      {world.id && (
                        <PlusOutlined
                          className={styles.tabAddComponentButton}
                          onClick={async () => {
                            if (world.id) {
                              const character = await api().characters.saveCharacter(
                                studioId,
                                {
                                  description: undefined,
                                  worldId: world.id,
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
                      {world.id && (
                        <WorldCharacters
                          studioId={studioId}
                          worldId={world.id}
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
                      {world.id && (
                        <PlusOutlined
                          className={styles.tabAddComponentButton}
                          onClick={async () => {
                            // TODO: Fire only when tab is active #92
                            const uniqueNames = uniqueNamesGenerator({
                              dictionaries: [adjectives, colors, animals],
                              length: 3
                            })

                            world.id &&
                              (await api().variables.saveVariable(studioId, {
                                worldId: world.id,
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
                      {world.id && (
                        <WorldVariables
                          studioId={studioId}
                          worldId={world.id}
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
                  let componentType: ELEMENT_TYPE | undefined

                  switch (panelData.activeId) {
                    case TAB_TYPE.CHARACTERS:
                      componentType = ELEMENT_TYPE.CHARACTER
                      break
                    case TAB_TYPE.VARIABLES:
                      componentType = ELEMENT_TYPE.VARIABLE
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
    <DividerBox className={styles.WorldInspector} mode="vertical">
      <DividerBox className={styles.outline}>
        <StoryworldOutline studioId={studioId} world={world} />
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

WorldInspector.displayName = 'WorldInspector'

export default WorldInspector
