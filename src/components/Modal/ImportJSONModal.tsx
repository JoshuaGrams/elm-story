import { ipcRenderer } from 'electron'
import importGameDataJSON from '../../lib/importGameDataJSON'

import React, { useContext, useEffect, useState } from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { ComponentId, StudioId } from '../../data/types'
import { GameDataJSON as GameDataJSON_013 } from '../../lib/transport/types/0.1.3'
import { GameDataJSON as GameDataJSON_020 } from '../../lib/transport/types/0.2.0'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import { Button, Modal, ModalProps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'

interface ImportJSONModalProps extends ModalProps {
  studioId?: StudioId
  file: File | null
}

const ImportJSONModal: React.FC<ImportJSONModalProps> = ({
  visible = false,
  afterClose,
  file
}) => {
  const { appDispatch } = useContext(AppContext)

  const [importingGameData, setImportingGameData] = useState(false),
    [gameData, setGameData] = useState<
      GameDataJSON_013 | GameDataJSON_020 | undefined
    >(undefined),
    [importingGameDataErrors, setImportingGameDataErrors] = useState<string[]>(
      []
    ),
    [studioNotFound, setStudioNotFound] = useState<
      { id: ComponentId; title: string } | boolean
    >(false),
    [gameExists, setGameExists] = useState<
      { id: ComponentId; title: string; newer: boolean } | boolean
    >(false)

  function onCancelImport() {
    afterClose && afterClose()
  }

  async function onCreateStudioAndFinish() {
    if (studioNotFound && studioNotFound !== true && gameData) {
      setImportingGameData(true)

      try {
        await api().studios.saveStudio({
          id: studioNotFound.id,
          title: studioNotFound.title,
          games: [],
          tags: []
        })

        // TODO: handle finish errors
        await importGameDataJSON(gameData, true).finish()

        appDispatch({
          type: APP_ACTION_TYPE.STUDIO_SELECT,
          selectedStudioId: gameData._.studioId
        })
      } catch (error) {
        throw error
      }

      afterClose && afterClose()
    }
  }

  async function onReplaceGameAndFinish() {
    if (gameExists && gameExists !== true && gameData) {
      setImportingGameData(true)

      try {
        // Remove game first to prevent merging of existing data
        await api().games.removeGame(gameData._.studioId, gameData._.id)

        // TODO: handle finish errors
        await importGameDataJSON(gameData, true).finish()

        appDispatch({
          type: APP_ACTION_TYPE.STUDIO_SELECT,
          selectedStudioId: gameData._.studioId
        })
      } catch (error) {
        throw error
      }

      afterClose && afterClose()
    }
  }

  useEffect(() => {
    async function processFile() {
      if (file) {
        setImportingGameData(true)
        setGameData(undefined)
        setImportingGameDataErrors([])
        setStudioNotFound(false)
        setGameExists(false)

        const reader = new FileReader()

        reader.addEventListener('load', async () => {
          try {
            setGameData(JSON.parse(reader.result as string))
          } catch (error) {
            setImportingGameData(false)

            setImportingGameDataErrors([
              'Unable to parse JSON. Data is invalid or corrupt.'
            ])
          }
        })

        reader.readAsText(file)
      }
    }

    processFile()
  }, [file])

  useEffect(() => {
    async function importGameData() {
      if (gameData) {
        const { errors, finish } = importGameDataJSON(gameData)

        if (errors.length > 0) {
          setImportingGameData(false)
          setImportingGameDataErrors(errors)
        }

        if (errors.length === 0) {
          // check if studio exists
          const foundStudio = await api().studios.getStudio(gameData._.studioId)

          // studio doesn't exists; confirm with user to create
          if (!foundStudio) {
            setStudioNotFound({
              id: gameData._.studioId,
              title: gameData._.studioTitle
            })

            setImportingGameData(false)

            return
          }

          // Studio found...
          if (foundStudio) {
            // ...but game exists; confirm with user to overwrite
            if (
              foundStudio.games.findIndex((id) => id === gameData._.id) !== -1
            ) {
              const foundGame = await api().games.getGame(
                gameData._.studioId,
                gameData._.id
              )

              setGameExists({
                id: gameData._.id,
                title: gameData._.title,
                newer:
                  foundGame.updated && foundGame.updated > gameData._.updated
                    ? true
                    : false
              })

              setImportingGameData(false)

              return
            }

            // ...game does not exist, finish processing
            if (
              foundStudio.games.findIndex((id) => id === gameData._.id) === -1
            ) {
              // TODO: handle finish errors
              await finish()

              appDispatch({
                type: APP_ACTION_TYPE.STUDIO_SELECT,
                selectedStudioId: gameData._.studioId
              })

              afterClose && afterClose()
            }
          }
        }
      }
    }

    importGameData()
  }, [gameData])

  return (
    <Modal
      visible={visible && file ? true : false}
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
            <div style={{ marginBottom: 20 }}>Importing Game Data</div>
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
                  'https://elmstory.com/support'
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
            <div>Create studio and finish game import?</div>
          </>
        )}

        {!importingGameData && gameExists && gameExists !== true && (
          <>
            <div style={{ marginBottom: 10 }}>
              Game '{gameExists.title}' with ID '{gameExists.id}' exists.
            </div>
            {gameExists.newer && (
              <div style={{ marginBottom: 10 }}>
                Local game data is also newer.
              </div>
            )}
            <div>Replace existing data and finish game import?</div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ImportJSONModal
