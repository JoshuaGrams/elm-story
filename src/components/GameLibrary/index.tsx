import React, { useState, useEffect, useRef, useContext } from 'react'

import { StudioId, Studio } from '../../data/types'

import { useGames, useStudios } from '../../hooks'
import { GAME_SORT } from '../../hooks/useGames'

import { AppContext } from '../../contexts/AppContext'

import { Divider, Row, Col } from 'antd'

import { ImportJSONModal, SaveGameModal } from '../Modal'
import GameBox from '../GameBox'

import styles from './styles.module.less'

interface GameLibraryProps {
  studioId: StudioId
}

const GameLibrary: React.FC<GameLibraryProps> = ({ studioId }) => {
  const importGameDataJSONInput = useRef<HTMLInputElement>(null)

  const { app } = useContext(AppContext)

  const [selectedStudio, setSelectedStudio] = useState<Studio | undefined>(
      undefined
    ),
    [saveGameModalVisible, setSaveGameModalVisible] = useState(false),
    [sortBy] = useState<GAME_SORT>(GAME_SORT.DATE),
    [importJSONModal, setImportJSONModal] = useState<{
      visible: boolean
      file: File | null
    }>({ visible: false, file: null })

  const studios = useStudios([studioId])
  const games = useGames(studioId, sortBy, [studioId, sortBy])

  // TODO: dupe from dashboard
  function onImportGameDataJSON() {
    if (importGameDataJSONInput.current?.files) {
      setImportJSONModal({
        visible: true,
        file: importGameDataJSONInput.current?.files[0]
      })
    }
  }

  // TODO: dupe from dashboard
  function onImportGameDataJSONFinished() {
    setImportJSONModal({ visible: false, file: null })

    if (importGameDataJSONInput.current) {
      importGameDataJSONInput.current.value = ''
    }
  }

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

      <ImportJSONModal
        visible={importJSONModal.visible}
        afterClose={onImportGameDataJSONFinished}
        studioId={app.selectedStudioId}
        file={importJSONModal.file}
      />

      <input
        ref={importGameDataJSONInput}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={onImportGameDataJSON}
      />

      <div className={styles.gameLibrary}>
        <Divider>Game Library</Divider>
        <div className={styles.contentWrapper}>
          {selectedStudio && games && games.length === 0 && (
            <div className={styles.noContent}>
              There are 0 games in this library...
              <br />
              Select another studio or{' '}
              <a onClick={() => setSaveGameModalVisible(true)}>
                create
              </a> or{' '}
              <a onClick={() => importGameDataJSONInput.current?.click()}>
                import
              </a>{' '}
              a game.
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
