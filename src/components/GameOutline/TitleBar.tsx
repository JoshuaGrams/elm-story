import logger from '../../lib/logger'
import getGameDataJSON from '../../lib/getGameDataJSON'

import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router'

import { COMPONENT_TYPE, Game, GameId, StudioId } from '../../data/types'
import { OnAddComponent } from '.'

import { AppContext, APP_LOCATION } from '../../contexts/AppContext'
import { EditorContext, EDITOR_ACTION_TYPE } from '../../contexts/EditorContext'

import { Button, Tooltip } from 'antd'
import {
  EditOutlined,
  ExportOutlined,
  LeftOutlined,
  PlusOutlined
} from '@ant-design/icons'

import { ExportJSONModal, SaveGameModal } from '../Modal'

import styles from './styles.module.less'
import AddComponentMenu from './AddComponentMenu'

const TitleBar: React.FC<{
  studioId: StudioId
  game: Game
  onAdd: OnAddComponent
}> = ({ studioId, game, onAdd }) => {
  const history = useHistory()

  const { app } = useContext(AppContext),
    { editor, editorDispatch } = useContext(EditorContext)

  const [editGameModalVisible, setEditGameModalVisible] = useState(false),
    [exportJSONModalVisible, setExportJSONModalVisible] = useState(false)

  async function onExportGameDataAsJSON() {
    if (game.id) {
      setExportJSONModalVisible(true)

      const json = await getGameDataJSON(studioId, game.id, app.version),
        element = document.createElement('a'),
        file = new Blob([json], { type: 'text/json' })

      element.href = URL.createObjectURL(file)
      element.download = `${game.title.trim()}.json`

      setTimeout(() => {
        element.click()

        setExportJSONModalVisible(false)
      }, 1000)
    }
  }

  return (
    <>
      <SaveGameModal
        visible={editGameModalVisible}
        onSave={({ id, title }) => {
          if (id && title) {
            logger.info('EDITOR_ACTION_TYPE.COMPONENT_RENAME dispatch')

            editorDispatch({
              type: EDITOR_ACTION_TYPE.COMPONENT_RENAME,
              renamedComponent: {
                id,
                newTitle: title,
                type: COMPONENT_TYPE.GAME
              }
            })
          }
        }}
        onCancel={() => setEditGameModalVisible(false)}
        afterClose={() => setEditGameModalVisible(false)}
        studioId={studioId}
        game={game}
        edit
      />

      <ExportJSONModal visible={exportJSONModalVisible} />

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
          <Tooltip
            title="Export game as JSON..."
            placement="right"
            align={{ offset: [-6, 0] }}
            mouseEnterDelay={1}
          >
            <Button onClick={onExportGameDataAsJSON} type="link">
              <ExportOutlined />
            </Button>
          </Tooltip>

          <Tooltip
            title="Edit Game Details..."
            placement="right"
            align={{ offset: [-6, 0] }}
            mouseEnterDelay={1}
          >
            <Button onClick={() => setEditGameModalVisible(true)} type="link">
              <EditOutlined />
            </Button>
          </Tooltip>

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
