import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { DocumentId, GameDocument } from '../../data/types'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'

import { Card, Button, Tooltip } from 'antd'

import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

import {
  AppContext,
  APP_ACTION_TYPE,
  APP_LOCATION
} from '../../contexts/AppContext'

import styles from './styles.module.less'

interface GameBoxProps {
  studioId: DocumentId
  game?: GameDocument
}

const GameBox: React.FC<GameBoxProps> = ({ studioId, game }) => {
  const { appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)

  const { Meta } = Card

  const history = useHistory()

  return (
    <Card
      className={styles.gameBox}
      title={game?.title || undefined}
      hoverable
      actions={
        !game
          ? []
          : [
              <Tooltip title="Remove game from library." mouseEnterDelay={1}>
                <DeleteOutlined
                  key="delete"
                  onClick={(event) => {
                    event.stopPropagation()

                    modalDispatch({
                      type: MODAL_ACTION_TYPE.LAYOUT,
                      layout: (
                        <GameModalLayout
                          studioId={studioId}
                          game={game}
                          type={GAME_MODAL_LAYOUT_TYPE.REMOVE}
                        />
                      )
                    })

                    modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
                  }}
                />
              </Tooltip>,
              <Tooltip title="Open game in editor." mouseEnterDelay={1}>
                <EditOutlined key="edit" />
              </Tooltip>
            ]
      }
      onClick={() => {
        if (game) {
          appDispatch({
            type: APP_ACTION_TYPE.GAME_SELECT,
            selectedGameId: game.id
          })

          history.push(APP_LOCATION.EDITOR)
        } else {
          modalDispatch({
            type: MODAL_ACTION_TYPE.LAYOUT,
            layout: (
              <GameModalLayout
                studioId={studioId}
                type={GAME_MODAL_LAYOUT_TYPE.CREATE}
              />
            )
          })

          modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
        }
      }}
    >
      {!game && (
        <Tooltip title="Add game to library." mouseEnterDelay={1}>
          <Button className={styles.addGameButton}>
            <PlusOutlined />
          </Button>
        </Tooltip>
      )}

      {game && (
        <>
          <Meta title="directed by" description={game.director} />
        </>
      )}
    </Card>
  )
}

export default GameBox
