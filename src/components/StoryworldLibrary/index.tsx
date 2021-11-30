import React, { useState, useEffect, useRef, useContext } from 'react'

import { StudioId, Studio } from '../../data/types'

import { useWorlds, useStudios } from '../../hooks'
import { WORLD_SORT } from '../../hooks/useWorlds'

import { AppContext } from '../../contexts/AppContext'

import { Divider, Row, Col } from 'antd'

import { ImportJSONModal, SaveGameModal } from '../Modal'
import StoryworldBox from '../StoryworldBox'

import styles from './styles.module.less'

interface StoryworldLibraryProps {
  studioId: StudioId
}

const StoryworldLibrary: React.FC<StoryworldLibraryProps> = ({ studioId }) => {
  const importGameDataJSONInput = useRef<HTMLInputElement>(null)

  const { app } = useContext(AppContext)

  const [selectedStudio, setSelectedStudio] = useState<Studio | undefined>(
      undefined
    ),
    [saveGameModalVisible, setSaveGameModalVisible] = useState(false),
    [sortBy] = useState<WORLD_SORT>(WORLD_SORT.DATE),
    [importJSONModal, setImportJSONModal] = useState<{
      visible: boolean
      file: File | null
    }>({ visible: false, file: null })

  const studios = useStudios([studioId])
  const worlds = useWorlds(studioId, sortBy, [studioId, sortBy])

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

      <div className={styles.StoryworldLibrary}>
        <Divider>Storyworld Library</Divider>
        <div className={styles.contentWrapper}>
          {selectedStudio && worlds && worlds.length === 0 && (
            <div className={styles.noContent}>
              There are 0 worlds in this library...
              <br />
              Select another studio or{' '}
              <a onClick={() => setSaveGameModalVisible(true)}>create</a> /{' '}
              <a onClick={() => importGameDataJSONInput.current?.click()}>
                import
              </a>
              .
            </div>
          )}

          {worlds && worlds.length > 0 && (
            <Row justify="start" gutter={[20, 20]}>
              {worlds.map((world) =>
                world.id !== undefined ? (
                  <Col xs={12} sm={12} md={8} lg={6} key={world.id}>
                    <StoryworldBox studioId={studioId} world={world} />
                  </Col>
                ) : null
              )}
              <Col xs={12} sm={12} md={8} lg={6} key="add-world">
                <StoryworldBox studioId={studioId} />
              </Col>
            </Row>
          )}
        </div>
      </div>
    </>
  )
}

StoryworldLibrary.displayName = 'StoryworldLibrary'

export default StoryworldLibrary
