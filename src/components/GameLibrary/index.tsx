import React, { useContext, useState, useEffect } from 'react'
import { useGames, useStudios } from '../../hooks'

import { DocumentId, StudioDocument } from '../../data/types'

import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'
import GameBox from '../GameBox'

import { Divider, Row, Col } from 'antd'

import styles from './styles.module.less'

interface GameLibraryProps {
  studioId: DocumentId
}

const GameLibrary: React.FC<GameLibraryProps> = ({ studioId }) => {
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
        <Divider>Game Library</Divider>
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
            <Row justify="start" gutter={[20, 20]}>
              {games.map((game) =>
                game.id !== undefined ? (
                  <Col xs={12} sm={12} md={8} lg={6} key={game.id}>
                    <GameBox studioId={studioId} game={game} />
                  </Col>
                ) : null
              )}
              <Col xs={12} sm={10} md={8} lg={6} key="add-game">
                <GameBox studioId={studioId} />
              </Col>
            </Row>
          )}
        </div>
      </div>
    </>
  )
}

export default GameLibrary
