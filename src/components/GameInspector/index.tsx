import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator'

import React, { useState } from 'react'

import {
  CharacterMood,
  CHARACTER_MOOD_TYPE,
  ComponentId,
  COMPONENT_TYPE,
  Game,
  StudioId,
  VARIABLE_TYPE
} from '../../data/types'

import { PlusOutlined } from '@ant-design/icons'
import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import GameOutline from '../GameOutline'
import GameStyles from '../GameStyles'
import GameProblems from '../GameProblems'
import GameCharacters from '../GameCharacters'
import { CharacterModal } from '../Modal'
import GameVariables from '../GameVariables'
import ComponentHelpButton from '../ComponentHelpButton'

import api from '../../api'

import styles from './styles.module.less'

const TAB_TYPE = {
  CHARACTERS: 'CHARACTERS',
  VARIABLES: 'VARIABLES'
}

const GameInspector: React.FC<{ studioId: StudioId; game: Game }> = ({
  studioId,
  game
}) => {
  const [characterModal, setCharacterModal] = useState<{
    characterId?: ComponentId
    visible: boolean
  }>({
    characterId: undefined,
    visible: false
  })

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
                  group: 'top'
                },
                {
                  id: 'stylesTab',
                  title: 'Styles',
                  minHeight: 32,
                  content: <GameStyles />,
                  group: 'top'
                },
                {
                  id: 'problemsTab',
                  title: 'Problems',
                  minHeight: 32,
                  content: <GameProblems />,
                  group: 'top'
                }
              ]
            },
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
                              const baseMood: CharacterMood = {
                                  imageId: undefined,
                                  type: CHARACTER_MOOD_TYPE.NEUTRAL
                                },
                                character = await api().characters.saveCharacter(
                                  studioId,
                                  {
                                    baseMood,
                                    description: undefined,
                                    gameId: game.id,
                                    moods: [baseMood],
                                    refs: [],
                                    tags: [],
                                    title: 'Untitled Character'
                                  }
                                )

                              character.id &&
                                setCharacterModal({
                                  ...characterModal,
                                  characterId: character.id,
                                  visible: true
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
                        <GameCharacters studioId={studioId} gameId={game.id} />
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
                        <GameVariables studioId={studioId} gameId={game.id} />
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
                    <ComponentHelpButton type={componentType} />
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
    <>
      {game.id && (
        <CharacterModal
          studioId={studioId}
          gameId={game.id}
          characterId={characterModal.characterId}
          visible={characterModal.visible}
          onCancel={() =>
            setCharacterModal({
              ...characterModal,
              characterId: undefined,
              visible: false
            })
          }
        />
      )}

      <DividerBox className={styles.GameInspector} mode="vertical">
        <DockLayout
          defaultLayout={defaultLayout}
          groups={{
            top: {
              floatable: false,
              animated: false,
              maximizable: false,
              tabLocked: true
            },
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
    </>
  )
}

GameInspector.displayName = 'GameInspector'

export default GameInspector
