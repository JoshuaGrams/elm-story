import React, { useEffect, useContext, useState, useRef } from 'react'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import { Button } from 'antd'
import { ImportOutlined } from '@ant-design/icons'

import { ImportJSONModal } from '../../components/Modal'
import StudioSelect from '../../components/StudioSelect'
import GameLibrary from '../../components/GameLibrary'

import styles from './styles.module.less'

const Dashboard = () => {
  const { app, appDispatch } = useContext(AppContext)

  const importGameDataJSONInput = useRef<HTMLInputElement>(null)

  const [importJSONModal, setImportJSONModal] = useState<{
    visible: boolean
    file: File | null
  }>({ visible: false, file: null })

  function onImportGameDataJSON() {
    if (importGameDataJSONInput.current?.files) {
      setImportJSONModal({
        visible: true,
        file: importGameDataJSONInput.current?.files[0]
      })
    }
  }

  function onImportGameDataJSONFinished() {
    setImportJSONModal({ visible: false, file: null })

    if (importGameDataJSONInput.current) {
      importGameDataJSONInput.current.value = ''
    }
  }

  useEffect(() => {
    appDispatch({ type: APP_ACTION_TYPE.HEADER, header: 'Dashboard' })
  }, [])

  return (
    <>
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

      <div className={styles.Dashboard}>
        <div className={styles.studioSelectWrapper}>
          <StudioSelect />
          <Button onClick={() => importGameDataJSONInput.current?.click()}>
            <ImportOutlined />
          </Button>
        </div>

        {app.selectedStudioId && (
          <GameLibrary studioId={app.selectedStudioId} />
        )}
      </div>
    </>
  )
}

export default Dashboard
