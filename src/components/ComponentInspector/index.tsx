import React, { useState } from 'react'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from 'unique-names-generator'

import api from '../../api'

import {
  COMPONENT_TYPE,
  GameId,
  StudioId,
  VARIABLE_TYPE
} from '../../data/types'

import DockLayout, { DividerBox, LayoutData } from 'rc-dock'

import { PlusOutlined } from '@ant-design/icons'

import ComponentProperties from '../ComponentProperties'
import GameStyles from '../GameStyles'

import GameVariables from '../GameVariables'
import GameProblems from '../GameProblems'
import ComponentHelpButton from '../ComponentHelpButton'

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
            maximizable: false
          }
        }}
        dropMode="edge"
      />
    </DividerBox>
  )
}

ComponentInspector.displayName = 'ComponentInspector'

export default ComponentInspector
