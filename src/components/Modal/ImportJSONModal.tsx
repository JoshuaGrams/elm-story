import { ipcRenderer } from 'electron'
import importWorldData from '../../lib/importWorldData'

import React, { useContext, useEffect, useState } from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { ElementId, StudioId } from '../../data/types'
import { WorldDataJSON } from '../../lib/transport/types/0.6.0'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import { Button, Modal, ModalProps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'

interface ImportJSONModalProps extends ModalProps {
  studioId?: StudioId
  incomingWorldData: WorldDataJSON | undefined
  incomingJSONPath: string | undefined
  incomingError?: boolean
}

const ImportJSONModal: React.FC<ImportJSONModalProps> = ({
  visible = false,
  afterClose,
  incomingWorldData,
  incomingJSONPath,
  incomingError
}) => {
  const { appDispatch } = useContext(AppContext)

  const [importingGameData, setImportingGameData] = useState(false),
    [worldData, setWorldData] = useState<WorldDataJSON | undefined>(undefined),
    [importingGameDataErrors, setImportingGameDataErrors] = useState<string[]>(
      []
    ),
    [studioNotFound, setStudioNotFound] = useState<
      { id: ElementId; title: string } | boolean
    >(false),
    [gameExists, setGameExists] = useState<
      { id: ElementId; title: string; newer: boolean } | boolean
    >(false)

  function onCancelImport() {
    afterClose && afterClose()
  }

  async function onCreateStudioAndFinish() {
    if (studioNotFound && studioNotFound !== true && worldData) {
      setImportingGameData(true)

      try {
        await api().studios.saveStudio({
          id: studioNotFound.id,
          title: studioNotFound.title,
          worlds: [],
          tags: []
        })

        // TODO: handle finish errors
        // TODO: ts errors
        await importWorldData(worldData, incomingJSONPath, true).finish()

        appDispatch({
          type: APP_ACTION_TYPE.STUDIO_SELECT,
          selectedStudioId: worldData._.studioId
        })
      } catch (error) {
        throw error
      }

      afterClose && afterClose()
    }
  }

  async function onReplaceGameAndFinish() {
    if (gameExists && gameExists !== true && worldData) {
      setImportingGameData(true)

      try {
        // Remove world first to prevent merging of existing data
        await api().worlds.removeWorld(worldData._.studioId, worldData._.id)

        // TODO: handle finish errors
        // TODO: ts errors
        await importWorldData(worldData, incomingJSONPath, true).finish()

        appDispatch({
          type: APP_ACTION_TYPE.STUDIO_SELECT,
          selectedStudioId: worldData._.studioId
        })
      } catch (error) {
        throw error
      }

      afterClose && afterClose()
    }
  }

  useEffect(() => {
    setImportingGameData(incomingWorldData ? true : false)
    setImportingGameDataErrors([])
    setStudioNotFound(false)
    setGameExists(false)

    setWorldData(incomingWorldData)
  }, [incomingWorldData])

  useEffect(() => {
    incomingError &&
      setImportingGameDataErrors([
        'Unable to import storyworld. JSON is corrupt or empty.'
      ])
  }, [incomingError])

  useEffect(() => {
    async function importGameData() {
      if (worldData) {
        // TODO: ts errors
        const { errors, finish } = importWorldData(worldData, incomingJSONPath)

        if (errors.length > 0) {
          setImportingGameData(false)
          setImportingGameDataErrors(errors)
        }

        if (errors.length === 0) {
          // check if studio exists
          const foundStudio = await api().studios.getStudio(
            worldData._.studioId
          )

          // studio doesn't exists; confirm with user to create
          if (!foundStudio) {
            setStudioNotFound({
              id: worldData._.studioId,
              title: worldData._.studioTitle
            })

            setImportingGameData(false)

            return
          }

          // Studio found...
          if (foundStudio) {
            // ...but world exists; confirm with user to overwrite
            if (
              foundStudio.worlds.findIndex((id) => id === worldData._.id) !== -1
            ) {
              const foundGame = await api().worlds.getWorld(
                worldData._.studioId,
                worldData._.id
              )

              setGameExists({
                id: worldData._.id,
                title: worldData._.title,
                newer:
                  foundGame.updated && foundGame.updated > worldData._.updated
                    ? true
                    : false
              })

              setImportingGameData(false)

              return
            }

            // ...world does not exist, finish processing
            if (
              foundStudio.worlds.findIndex((id) => id === worldData._.id) === -1
            ) {
              // TODO: handle finish errors
              await finish()

              appDispatch({
                type: APP_ACTION_TYPE.STUDIO_SELECT,
                selectedStudioId: worldData._.studioId
              })

              afterClose && afterClose()
            }
          }
        }
      }
    }

    importGameData()
  }, [worldData])

  return (
    <Modal
      visible={visible}
      destroyOnClose
      closable={false}
      centered
      footer={
        !importingGameData
          ? studioNotFound
            ? [
                <Button onClick={onCancelImport} key="cancel-create-studio-btn">
                  Cancel Import
                </Button>,
                <Button
                  type="primary"
                  onClick={onCreateStudioAndFinish}
                  key="create-studio-btn"
                >
                  Create Studio
                </Button>
              ]
            : gameExists
            ? [
                <Button onClick={onCancelImport} key="cancel-replace-game-btn">
                  Cancel
                </Button>,
                <Button
                  type="primary"
                  onClick={onReplaceGameAndFinish}
                  key="replace-game-btn"
                >
                  Replace
                </Button>
              ]
            : null
          : null
      }
    >
      <div style={{ textAlign: 'center' }}>
        {importingGameData && (
          <>
            <div style={{ marginBottom: 20 }}>Importing Storyworld Data</div>
            <LoadingOutlined style={{ fontSize: 24 }} spin />
          </>
        )}

        {importingGameDataErrors.length > 0 && (
          <div className={styles.importingGameDataError}>
            <div style={{ marginBottom: 20 }}>Import Error</div>
            <div
              style={{
                marginBottom: 10,
                textAlign: 'left',
                height: 100,
                width: '100%',
                overflow: 'auto',
                fontSize: 10,
                background: 'black',
                padding: 4
              }}
            >
              {importingGameDataErrors.map((error, index) => (
                <div
                  key={`json-error-${index}`}
                  style={{
                    margin: 4,
                    padding: 4,
                    background: 'hsl(0, 0%, 8%)',
                    userSelect: 'all'
                  }}
                >
                  {error}
                </div>
              ))}
            </div>
            <div
              className={styles.additionalHelp}
              onClick={() =>
                ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [
                  'https://docs.elmstory.com/guides/production/dashboard/importing-worlds'
                ])
              }
            >
              Additional Help
            </div>
            <Button type="primary" onClick={onCancelImport}>
              Cancel
            </Button>
          </div>
        )}

        {!importingGameData && studioNotFound && studioNotFound !== true && (
          <>
            <div style={{ marginBottom: 10 }}>
              Studio '{studioNotFound.title}' with ID '{studioNotFound.id}' not
              found in local database.
            </div>
            <div>Create studio and finish world import?</div>
          </>
        )}

        {!importingGameData && gameExists && gameExists !== true && (
          <>
            <div style={{ marginBottom: 10 }}>
              Storyworld '{gameExists.title}' with ID '{gameExists.id}' exists.
            </div>
            {gameExists.newer && (
              <div style={{ marginBottom: 10 }}>
                Local world data is also newer.
              </div>
            )}
            <div>Replace existing data and finish world import?</div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ImportJSONModal
