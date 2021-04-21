import React, { useState, useEffect } from 'react'

import { StudioId, Studio } from '../../data/types'

import { useGames, useStudios } from '../../hooks'
import { GAME_SORT } from '../../hooks/useGames'

import { Divider, Row, Col } from 'antd'

import { SaveGameModal } from '../Modal'
import GameBox from '../GameBox'

import styles from './styles.module.less'

interface GameLibraryProps {
  studioId: StudioId
}

const GameLibrary: React.FC<GameLibraryProps> = ({ studioId }) => {
  const [selectedStudio, setSelectedStudio] = useState<Studio | undefined>(
      undefined
    ),
    [saveGameModalVisible, setSaveGameModalVisible] = useState(false),
    [sortBy] = useState<GAME_SORT>(GAME_SORT.DATE)

  const studios = useStudios([studioId])
  const games = useGames(studioId, sortBy, [studioId, sortBy])

  useEffect(() => {
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
      <SaveGameModal
        visible={saveGameModalVisible}
        onCancel={() => setSaveGameModalVisible(false)}
        afterClose={() => setSaveGameModalVisible(false)}
        studioId={studioId}
      />

      <div className={styles.gameLibrary}>
        <Divider>Game Library</Divider>
        <div className={styles.contentWrapper}>
          {selectedStudio && games && games.length === 0 && (
            <div className={styles.noContent}>
              {selectedStudio.title} has 0 games...{' '}
              <a onClick={() => setSaveGameModalVisible(true)}>
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
              <Col xs={12} sm={12} md={8} lg={6} key="add-game">
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
