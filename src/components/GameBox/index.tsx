import React from 'react'
import { useContext } from 'react'

import { DocumentId, GameDocument } from '../../data/types'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'

import Button from '../Button'

import styles from './styles.module.scss'

interface GameBoxProps {
  profileId: DocumentId
  game: GameDocument
}

const GameBox: React.FC<GameBoxProps> = ({ profileId, game }) => {
  const { modalDispatch } = useContext(ModalContext)
  return (
    <div className={styles.gameBox}>
      <div className={styles.contentWrapper}>
        <h4>
          <a href="#">{game.title}</a>
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
                      profileId={profileId}
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
                      profileId={profileId}
                      game={game}
                      type={GAME_MODAL_LAYOUT_TYPE.REMOVE}
                    />
                  )
                })

                modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
              }}
              destroy
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameBox
