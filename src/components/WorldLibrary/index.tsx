import React, { useState, useEffect, useRef, useContext } from 'react'

import { StudioId, Studio } from '../../data/types'

import { useWorlds, useStudios } from '../../hooks'
import { WORLD_SORT } from '../../hooks/useWorlds'

import { AppContext } from '../../contexts/AppContext'

import { Divider, Row, Col } from 'antd'

import { ImportJSONModal, SaveWorldModal } from '../Modal'
import WorldBox from '../WorldBox'

import styles from './styles.module.less'

interface WorldLibraryProps {
  studioId: StudioId
}

const WorldLibrary: React.FC<WorldLibraryProps> = ({ studioId }) => {
  const importWorldDataJSONInput = useRef<HTMLInputElement>(null)

  const { app } = useContext(AppContext)

  const [selectedStudio, setSelectedStudio] = useState<Studio | undefined>(
      undefined
    ),
    [saveWorldModalVisible, setSaveWorldModalVisible] = useState(false),
    [sortBy] = useState<WORLD_SORT>(WORLD_SORT.DATE),
    [importJSONModal, setImportJSONModal] = useState<{
      visible: boolean
      file: File | null
    }>({ visible: false, file: null })

  const studios = useStudios([studioId])
  const worlds = useWorlds(studioId, sortBy, [studioId, sortBy])

  // TODO: dupe from dashboard
  function onImportWorldDataJSON() {
    if (importWorldDataJSONInput.current?.files) {
      setImportJSONModal({
        visible: true,
        file: importWorldDataJSONInput.current?.files[0]
      })
    }
  }

  // TODO: dupe from dashboard
  function onImportWorldDataJSONFinished() {
    setImportJSONModal({ visible: false, file: null })

    if (importWorldDataJSONInput.current) {
      importWorldDataJSONInput.current.value = ''
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
      <SaveWorldModal
        visible={saveWorldModalVisible}
        onCancel={() => setSaveWorldModalVisible(false)}
        afterClose={() => setSaveWorldModalVisible(false)}
        studioId={studioId}
      />

      <ImportJSONModal
        visible={importJSONModal.visible}
        afterClose={onImportWorldDataJSONFinished}
        studioId={app.selectedStudioId}
        file={importJSONModal.file}
      />

      <input
        ref={importWorldDataJSONInput}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={onImportWorldDataJSON}
      />

      <div className={styles.WorldLibrary}>
        <Divider>Storyworld Library</Divider>
        <div className={styles.contentWrapper}>
          {selectedStudio && worlds && worlds.length === 0 && (
            <div className={styles.noContent}>
              There are 0 worlds in this library...
              <br />
              Select another studio or{' '}
              <a onClick={() => setSaveWorldModalVisible(true)}>
                create
              </a> /{' '}
              <a onClick={() => importWorldDataJSONInput.current?.click()}>
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
                    <WorldBox studioId={studioId} world={world} />
                  </Col>
                ) : null
              )}
              <Col xs={12} sm={12} md={8} lg={6} key="add-world">
                <WorldBox studioId={studioId} />
              </Col>
            </Row>
          )}
        </div>
      </div>
    </>
  )
}

WorldLibrary.displayName = 'WorldLibrary'

export default WorldLibrary
