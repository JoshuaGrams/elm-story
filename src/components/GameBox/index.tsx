import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { DocumentId, GameDocument } from '../../data/types'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'

import { Card, Button } from 'antd'

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
      title={!game ? undefined : game.title}
      hoverable
      actions={
        !game
          ? []
          : [
              <EditOutlined
                key="edit"
                onClick={(event) => {
                  event.stopPropagation()

                  modalDispatch({
                    type: MODAL_ACTION_TYPE.LAYOUT,
                    layout: (
                      <GameModalLayout
                        studioId={studioId}
                        game={game}
                        type={GAME_MODAL_LAYOUT_TYPE.EDIT}
                      />
                    )
                  })

                  modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
                }}
              />,
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
        <Button className={styles.addGameButton}>
          <PlusOutlined />
        </Button>
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
