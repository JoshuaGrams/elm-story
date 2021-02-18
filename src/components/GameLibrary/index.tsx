import React, { useContext } from 'react'
import { useGames } from '../../hooks'

import { DocumentId } from '../../data/types'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'
import Button from '../Button'
import GameBox from '../GameBox'

import styles from './styles.module.scss'

interface GameLibraryProps {
  profileId: DocumentId
}

const LibraryGrid: React.FC<GameLibraryProps> = ({ profileId }) => {
  const games = useGames(profileId)
  const { modalDispatch } = useContext(ModalContext)

  return (
    <div className={styles.gameLibrary}>
      <h3>Game Library</h3>
      <Button
        onClick={() => {
          modalDispatch({
            type: MODAL_ACTION_TYPE.LAYOUT,
            layout: (
              <GameModalLayout
                profileId={profileId}
                type={GAME_MODAL_LAYOUT_TYPE.CREATE}
              />
            )
          })

          modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
        }}
        primary
      >
        Create Game
      </Button>

      {games.length > 0 && (
        <>
          <hr />
          <div className={styles.gameGrid}>
            {games.map((game) =>
              game.id !== undefined ? (
                <GameBox key={game.id} profileId={profileId} game={game} />
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default LibraryGrid
