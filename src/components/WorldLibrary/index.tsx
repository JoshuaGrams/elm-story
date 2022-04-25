import { ipcRenderer } from 'electron'

import React, { useState, useEffect, useContext } from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { StudioId, Studio } from '../../data/types'
import { WorldDataJSON } from '../../lib/transport/types/0.7.1'

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
  const { app } = useContext(AppContext)

  const [selectedStudio, setSelectedStudio] = useState<Studio | undefined>(
      undefined
    ),
    [saveWorldModalVisible, setSaveWorldModalVisible] = useState(false),
    [sortBy] = useState<WORLD_SORT>(WORLD_SORT.DATE),
    [importJSONModal, setImportJSONModal] = useState<{
      visible: boolean
      worldData?: WorldDataJSON
      jsonPath?: string
      error?: boolean
    }>({
      visible: false,
      worldData: undefined,
      jsonPath: undefined,
      error: false
    })

  const studios = useStudios([studioId])
  const worlds = useWorlds(studioId, sortBy, [studioId, sortBy])

  // TODO: dupe from dashboard
  async function importWorld() {
    try {
      const { worldData, jsonPath } = await ipcRenderer.invoke(
        WINDOW_EVENT_TYPE.IMPORT_WORLD_GET_JSON
      )

      worldData &&
        setImportJSONModal({
          visible: true,
          worldData,
          jsonPath
        })
    } catch (error) {
      setImportJSONModal({
        visible: true,
        worldData: undefined,
        jsonPath: undefined,
        error: true
      })
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
        afterClose={() =>
          setImportJSONModal({
            visible: false,
            worldData: undefined,
            jsonPath: undefined,
            error: false
          })
        }
        studioId={app.selectedStudioId}
        incomingWorldData={importJSONModal.worldData}
        incomingJSONPath={importJSONModal.jsonPath}
        incomingError={importJSONModal.error}
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
              </a> / <a onClick={importWorld}>import</a>.
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
