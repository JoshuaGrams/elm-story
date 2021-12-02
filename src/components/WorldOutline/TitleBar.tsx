import React, { useContext } from 'react'
import { useHistory } from 'react-router'

import { ELEMENT_TYPE, World, WorldId, StudioId } from '../../data/types'
import { OnAddElement } from '.'

import { APP_LOCATION } from '../../contexts/AppContext'
import { ComposerContext } from '../../contexts/ComposerContext'

import { Button, Tooltip } from 'antd'
import { ExportOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons'

import ExportWorldMenu from './ExportGameMenu'
import AddElementMenu from './AddElementMenu'

import styles from './styles.module.less'

const TitleBar: React.FC<{
  studioId: StudioId
  world: World
  onAdd: OnAddElement
  onWorldSelect: () => void
}> = ({ studioId, world, onAdd, onWorldSelect }) => {
  const history = useHistory()

  const { composer } = useContext(ComposerContext)

  return (
    <>
      <div className={styles.TitleBar}>
        <Tooltip
          title="Back to Dashboard"
          placement="right"
          align={{ offset: [-10, 0] }}
          mouseEnterDelay={1}
        >
          <Button
            onClick={() => history.push(APP_LOCATION.DASHBOARD)}
            type="link"
            className={styles.dashboardButton}
          >
            <LeftOutlined />
          </Button>
        </Tooltip>

        <span
          className={`${styles.worldTitle} ${
            composer.selectedWorldOutlineElement.id === world.id
              ? styles.selected
              : ''
          }`}
          onClick={onWorldSelect}
        >
          {world.title}
        </span>

        <div className={styles.worldButtons}>
          <ExportWorldMenu studioId={studioId} world={world}>
            <Tooltip
              title="Export World..."
              placement="right"
              align={{ offset: [-6, 0] }}
              mouseEnterDelay={1}
            >
              <Button type="link">
                <ExportOutlined />
              </Button>
            </Tooltip>
          </ExportWorldMenu>

          <AddElementMenu
            worldId={world.id as WorldId}
            onAdd={(worldId: WorldId, type: ELEMENT_TYPE) =>
              onAdd(worldId, type)
            }
          >
            <Tooltip
              title="Add Element..."
              placement="right"
              align={{ offset: [-6, 0] }}
              mouseEnterDelay={1}
            >
              <Button type="link">
                <PlusOutlined />
              </Button>
            </Tooltip>
          </AddElementMenu>
        </div>
      </div>
    </>
  )
}

export default TitleBar
