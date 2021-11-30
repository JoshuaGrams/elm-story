import React, { useContext } from 'react'
import { useHistory } from 'react-router'

import { ELEMENT_TYPE, World, WorldId, StudioId } from '../../data/types'
import { OnAddComponent } from '.'

import { APP_LOCATION } from '../../contexts/AppContext'
import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Button, Tooltip } from 'antd'
import { ExportOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons'

import ExportGameMenu from './ExportGameMenu'
import AddComponentMenu from './AddComponentMenu'

import styles from './styles.module.less'

const TitleBar: React.FC<{
  studioId: StudioId
  game: World
  onAdd: OnAddComponent
  onStoryworldSelect: () => void
}> = ({ studioId, game, onAdd, onStoryworldSelect }) => {
  const history = useHistory()

  const { editor, editorDispatch } = useContext(EditorContext)

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
          className={`${styles.gameTitle} ${
            editor.selectedGameOutlineComponent.id === game.id
              ? styles.selected
              : ''
          }`}
          onClick={onStoryworldSelect}
        >
          {game.title}
        </span>

        <div className={styles.gameButtons}>
          <ExportGameMenu studioId={studioId} game={game}>
            <Tooltip
              title="Export Game..."
              placement="right"
              align={{ offset: [-6, 0] }}
              mouseEnterDelay={1}
            >
              <Button type="link">
                <ExportOutlined />
              </Button>
            </Tooltip>
          </ExportGameMenu>

          <AddComponentMenu
            gameId={game.id as WorldId}
            onAdd={(gameId: WorldId, type: ELEMENT_TYPE) => onAdd(gameId, type)}
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
          </AddComponentMenu>
        </div>
      </div>
    </>
  )
}

export default TitleBar
