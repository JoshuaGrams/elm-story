import React, { useContext, useState, useRef } from 'react'

import { AppContext } from '../../contexts/AppContext'

import { Button } from 'antd'
import { ImportOutlined } from '@ant-design/icons'

import { ImportJSONModal } from '../../components/Modal'
import StudioSelect from '../../components/StudioSelect'
import WorldLibrary from '../../components/WorldLibrary'

import styles from './styles.module.less'

const Dashboard = () => {
  const { app } = useContext(AppContext)

  const importWorldDataJSONInput = useRef<HTMLInputElement>(null)

  const [importJSONModal, setImportJSONModal] = useState<{
    visible: boolean
    file: File | null
  }>({ visible: false, file: null })

  function onImportGameDataJSON() {
    if (importWorldDataJSONInput.current?.files) {
      setImportJSONModal({
        visible: true,
        file: importWorldDataJSONInput.current?.files[0]
      })
    }
  }

  function onImportWorldDataJSONFinished() {
    setImportJSONModal({ visible: false, file: null })

    if (importWorldDataJSONInput.current) {
      importWorldDataJSONInput.current.value = ''
    }
  }

  return (
    <>
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
        onChange={onImportGameDataJSON}
      />

      <div className={styles.Dashboard}>
        <div className={styles.studioSelectWrapper}>
          <StudioSelect />
          <Button onClick={() => importWorldDataJSONInput.current?.click()}>
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
