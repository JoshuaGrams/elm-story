import React, { useContext } from 'react'
import { useHistory } from 'react-router'

import { COMPONENT_TYPE, Game, GameId, StudioId } from '../../data/types'
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
  game: Game
  onAdd: OnAddComponent
}> = ({ studioId, game, onAdd }) => {
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
          onClick={() => {
            // TODO: reuse this in GameOutline
            editor.selectedComponentEditorSceneViewPassage &&
              editorDispatch({
                type:
                  EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_PASSAGE,
                selectedComponentEditorSceneViewPassage: null
              })

            editor.selectedComponentEditorSceneViewJump &&
              editorDispatch({
                type:
                  EDITOR_ACTION_TYPE.COMPONENT_EDITOR_SCENE_VIEW_SELECT_JUMP,
                selectedComponentEditorSceneViewJump: null
              })

            editor.selectedGameOutlineComponent.id !== game.id &&
              editorDispatch({
                type: EDITOR_ACTION_TYPE.GAME_OUTLINE_SELECT,
                selectedGameOutlineComponent: {
                  id: game.id,
                  expanded: true,
                  title: game.title,
                  type: COMPONENT_TYPE.GAME
                }
              })
          }}
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
            gameId={game.id as GameId}
            onAdd={(gameId: GameId, type: COMPONENT_TYPE) =>
              onAdd(gameId, type)
            }
          >
            <Tooltip
              title="Add Component..."
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
