import React, { useContext, useState, useEffect } from 'react'
import { useGames, useStudios } from '../../hooks'

import { DocumentId, StudioDocument } from '../../data/types'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'
import GameBox from '../GameBox'

import styles from './styles.module.less'
interface GameLibraryProps {
  studioId: DocumentId
}

const LibraryGrid: React.FC<GameLibraryProps> = ({ studioId }) => {
  const { modalDispatch } = useContext(ModalContext)

  const games = useGames(studioId, [studioId])
  const studios = useStudios([studioId])
  const [selectedStudio, setSelectedStudio] = useState<
    StudioDocument | undefined
  >(undefined)

  useEffect(() => {
    // @TODO: Move this to hook; see AppMenu duplicate
    if (studios) {
      setSelectedStudio(
        studioId
          ? studios.filter((studio) => studio.id === studioId)[0]
          : undefined
      )
    }
  }, [studios, studioId])

  return (
    <>
      <div className={styles.gameLibrary}>
        <h3>Game Library</h3>
        <div className={styles.contentWrapper}>
          {selectedStudio && games && games.length === 0 && (
            <div className={styles.noContent}>
              {selectedStudio.title} has 0 games...{' '}
              <a
                onClick={() => {
                  if (studioId) {
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
                Create game...
              </a>
            </div>
          )}

          {games && games.length > 0 && (
            <>
              <div className={styles.gameGrid}>
                {games.map((game) =>
                  game.id !== undefined ? (
                    <GameBox key={game.id} studioId={studioId} game={game} />
                  ) : null
                )}
                <GameBox studioId={studioId} />
              </div>
            </>
          )}
        </div>
      </div>
      <hr />
    </>
  )
}

export default LibraryGrid
