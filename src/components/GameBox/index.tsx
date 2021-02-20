import React from 'react'
import { useContext } from 'react'

import { DocumentId, GameDocument } from '../../data/types'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'

import Button from '../Button'

import styles from './styles.module.scss'
import {
  AppContext,
  APP_ACTION_TYPE,
  LOCATION
} from '../../contexts/AppContext'

interface GameBoxProps {
  studioId: DocumentId
  game?: GameDocument
}

const GameBox: React.FC<GameBoxProps> = ({ studioId, game }) => {
  const { appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)

  return (
    <div className={styles.gameBox}>
      {!game && (
        <Button
          className={styles.addGameButton}
          onClick={() => {
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
          }}
        >
          +
        </Button>
      )}

      {game && (
        <>
          <div className={styles.contentWrapper}>
            <h4>
              <a
                onClick={() => {
                  appDispatch({
                    type: APP_ACTION_TYPE.GAME_SELECT,
                    selectedGameId: game.id
                  })

                  appDispatch({
                    type: APP_ACTION_TYPE.LOCATION,
                    location: LOCATION.EDITOR
                  })
                }}
              >
                {game.title}
              </a>
            </h4>

            <div className={styles.contentBottom}>
              <h5>
                <em>directed by</em>
                <br /> {game.director}
              </h5>
              <div className={styles.buttonBar}>
                <Button
                  onClick={() => {
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
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
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
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default GameBox
