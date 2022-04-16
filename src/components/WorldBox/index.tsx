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

import { SaveWorldModal, RemoveWorldModal } from '../Modal'

import styles from './styles.module.less'

import api from '../../api'

interface WorldBoxProps {
  studioId: StudioId
  world?: World
}

const WorldBox: React.FC<WorldBoxProps> = ({ studioId, world }) => {
  const { appDispatch } = useContext(AppContext)

  const [saveWorldModalVisible, setSaveWorldModalVisible] = useState(false),
    [removeWorldModalVisible, setRemoveWorldModalVisible] = useState(false)

  const { Meta } = Card

  const history = useHistory()

  return (
    <>
      {/* MODALS */}
      {!world && studioId && (
        <SaveWorldModal
          visible={saveWorldModalVisible}
          onCancel={() => setSaveWorldModalVisible(false)}
          afterClose={() => setSaveWorldModalVisible(false)}
          studioId={studioId}
        />
      )}

      {world && (
        <RemoveWorldModal
          visible={removeWorldModalVisible}
          onCancel={() => setRemoveWorldModalVisible(false)}
          afterClose={() => setRemoveWorldModalVisible(false)}
          studioId={studioId}
          world={world}
        />
      )}

      {/* CONTENT */}
      <Card
        className={styles.WorldBox}
        title={
          world?.title ? (
            <span title={world.title}>{world.title}</span>
          ) : undefined
        }
        hoverable
        actions={
          !world
            ? []
            : [
                <Tooltip title="Remove World" mouseEnterDelay={1}>
                  <DeleteOutlined
                    key="delete"
                    onClick={(event) => {
                      event.stopPropagation()

                      setRemoveWorldModalVisible(true)
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Edit World" mouseEnterDelay={1}>
                  <FormOutlined key="edit" />
                </Tooltip>
              ]
        }
        onClick={async () => {
          if (world?.id) {
            const selectedWorld = await api().worlds.getWorld(
              studioId,
              world.id
            )

            await api().worlds.saveWorld(studioId, {
              ...selectedWorld
            })

            appDispatch({
              type: APP_ACTION_TYPE.GAME_SELECT,
              selectedGameId: world.id
            })

            history.push(APP_LOCATION.COMPOSER)
          } else {
            setSaveWorldModalVisible(true)
          }
        }}
      >
        {!world && (
          <Tooltip title="Create World" mouseEnterDelay={1}>
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

WorldBox.displayName = 'WorldBox'

export default WorldBox
