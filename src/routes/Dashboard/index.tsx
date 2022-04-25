import { ipcRenderer } from 'electron'

import React, { useContext, useState } from 'react'

import { WorldDataJSON } from '../../lib/transport/types/0.7.1'
import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { AppContext } from '../../contexts/AppContext'

import { Button } from 'antd'
import { ImportOutlined } from '@ant-design/icons'

import { ImportJSONModal } from '../../components/Modal'
import StudioSelect from '../../components/StudioSelect'
import WorldLibrary from '../../components/WorldLibrary'

import styles from './styles.module.less'

const Dashboard = () => {
  const { app } = useContext(AppContext)

  const [importJSONModal, setImportJSONModal] = useState<{
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

  return (
    <>
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

      <div className={styles.Dashboard}>
        <div className={styles.studioSelectWrapper}>
          <StudioSelect />
          <Button style={{ borderRadius: 2 }} onClick={importWorld}>
            <ImportOutlined />
          </Button>
        </div>

        {app.selectedStudioId && (
          <WorldLibrary studioId={app.selectedStudioId} />
        )}
      </div>
    </>
  )
}

export default Dashboard
