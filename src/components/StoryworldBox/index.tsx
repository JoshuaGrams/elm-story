import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { StudioId, World } from '../../data/types'

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
  world?: World
}

const StoryworldBox: React.FC<StoryworldBoxProps> = ({ studioId, world }) => {
  const { appDispatch } = useContext(AppContext)

  const [saveGameModalVisible, setSaveGameModalVisible] = useState(false),
    [removeGameModalVisible, setRemoveGameModalVisible] = useState(false)

  const { Meta } = Card

  const history = useHistory()

  return (
    <>
      {/* MODALS */}
      {!world && studioId && (
        <SaveGameModal
          visible={saveGameModalVisible}
          onCancel={() => setSaveGameModalVisible(false)}
          afterClose={() => setSaveGameModalVisible(false)}
          studioId={studioId}
        />
      )}

      {world && (
        <RemoveGameModal
          visible={removeGameModalVisible}
          onCancel={() => setRemoveGameModalVisible(false)}
          afterClose={() => setRemoveGameModalVisible(false)}
          studioId={studioId}
          game={world}
        />
      )}

      {/* CONTENT */}
      <Card
        className={styles.StoryworldBox}
        title={world?.title || undefined}
        hoverable
        actions={
          !world
            ? []
            : [
                <Tooltip title="Remove Storyworld" mouseEnterDelay={1}>
                  <DeleteOutlined
                    key="delete"
                    onClick={(event) => {
                      event.stopPropagation()

                      setRemoveGameModalVisible(true)
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Compose Storyworld" mouseEnterDelay={1}>
                  <FormOutlined key="edit" />
                </Tooltip>
              ]
        }
        onClick={async () => {
          if (world?.id) {
            const selectedGame = await api().worlds.getWorld(studioId, world.id)

            await api().worlds.saveWorld(studioId, {
              ...selectedGame
            })

            appDispatch({
              type: APP_ACTION_TYPE.GAME_SELECT,
              selectedGameId: world.id
            })

            history.push(APP_LOCATION.COMPOSER)
          } else {
            setSaveGameModalVisible(true)
          }
        }}
      >
        {!world && (
          <Tooltip title="Create Storyworld" mouseEnterDelay={1}>
            <Button className={styles.addGameButton}>
              <PlusOutlined />
            </Button>
          </Tooltip>
        )}

        {world && (
          <>
            <Meta
              title="designed by"
              description={world.designer}
              style={{ marginBottom: 20 }}
            />
            <Meta title="version" description={world.version} />
          </>
        )}
      </Card>
    </>
  )
}

StoryworldBox.displayName = 'StoryworldBox'

export default StoryworldBox
