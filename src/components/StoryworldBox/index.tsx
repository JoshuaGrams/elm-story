import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { StudioId, Game } from '../../data/types'

import {
  AppContext,
  APP_ACTION_TYPE,
  APP_LOCATION
} from '../../contexts/AppContext'

import { Card, Button, Tooltip } from 'antd'
import { FormOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

import { SaveGameModal, RemoveGameModal } from '../Modal'

import styles from './styles.module.less'

import api from '../../api'

interface StoryworldBoxProps {
  studioId: StudioId
  game?: Game
}

const StoryworldBox: React.FC<StoryworldBoxProps> = ({ studioId, game }) => {
  const { appDispatch } = useContext(AppContext)

  const [saveGameModalVisible, setSaveGameModalVisible] = useState(false),
    [removeGameModalVisible, setRemoveGameModalVisible] = useState(false)

  const { Meta } = Card

  const history = useHistory()

  return (
    <>
      {/* MODALS */}
      {!game && studioId && (
        <SaveGameModal
          visible={saveGameModalVisible}
          onCancel={() => setSaveGameModalVisible(false)}
          afterClose={() => setSaveGameModalVisible(false)}
          studioId={studioId}
        />
      )}

      {game && (
        <RemoveGameModal
          visible={removeGameModalVisible}
          onCancel={() => setRemoveGameModalVisible(false)}
          afterClose={() => setRemoveGameModalVisible(false)}
          studioId={studioId}
          game={game}
        />
      )}

      {/* CONTENT */}
      <Card
        className={styles.StoryworldBox}
        title={game?.title || undefined}
        hoverable
        actions={
          !game
            ? []
            : [
                <Tooltip title="Remove" mouseEnterDelay={1}>
                  <DeleteOutlined
                    key="delete"
                    onClick={(event) => {
                      event.stopPropagation()

                      setRemoveGameModalVisible(true)
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Compose" mouseEnterDelay={1}>
                  <FormOutlined key="edit" />
                </Tooltip>
              ]
        }
        onClick={async () => {
          if (game?.id) {
            const selectedGame = await api().games.getGame(studioId, game.id)

            await api().games.saveGame(studioId, {
              ...selectedGame
            })

            appDispatch({
              type: APP_ACTION_TYPE.GAME_SELECT,
              selectedGameId: game.id
            })

            history.push(APP_LOCATION.COMPOSER)
          } else {
            setSaveGameModalVisible(true)
          }
        }}
      >
        {!game && (
          <Tooltip title="Create" mouseEnterDelay={1}>
            <Button className={styles.addGameButton}>
              <PlusOutlined />
            </Button>
          </Tooltip>
        )}

        {game && (
          <>
            <Meta
              title="designed by"
              description={game.designer}
              style={{ marginBottom: 20 }}
            />
            <Meta title="version" description={game.version} />
          </>
        )}
      </Card>
    </>
  )
}

StoryworldBox.displayName = 'StoryworldBox'

export default StoryworldBox
