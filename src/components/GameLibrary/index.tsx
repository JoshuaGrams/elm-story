import React, { useContext } from 'react'
import { useGames } from '../../hooks'

import { DocumentId } from '../../data/types'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'
import GameBox from '../GameBox'

import styles from './styles.module.scss'

interface GameLibraryProps {
  studioId: DocumentId
}

const LibraryGrid: React.FC<GameLibraryProps> = ({ studioId }) => {
  const games = useGames(studioId)
  const { app, appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)

  return (
    <div className={styles.gameLibrary}>
      <h3>Game Library</h3>

      <hr />

      {games && games.length > 0 && (
        <>
          <div className={styles.gameGrid}>
            {games.map((game) =>
              game.id !== undefined ? (
                <GameBox key={game.id} studioId={studioId} game={game} />
              ) : null
            )}
          </div>
        </>
      )}

      {games && games.length === 0 && (
        <div>
          Studio has 0 games...{' '}
          <a
            onClick={() => {
              if (app.selectedStudioId) {
                appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                modalDispatch({
                  type: MODAL_ACTION_TYPE.LAYOUT,
                  layout: (
                    <GameModalLayout
                      studioId={app.selectedStudioId}
                      type={GAME_MODAL_LAYOUT_TYPE.CREATE}
                    />
                  )
                })

                modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
              }
            }}
          >
            Create game...
          </a>
        </div>
      )}
    </div>
  )
}

export default LibraryGrid
