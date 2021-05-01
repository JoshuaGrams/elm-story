import { ipcRenderer } from 'electron'
import importGameDataJSON from '../../lib/importGameDataJSON'

import React, { useContext, useEffect, useRef, useState } from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { StudioId, Game, GAME_TEMPLATE } from '../../data/types'
import { GameDataJSON } from '../../lib/getGameDataJSON'

import { AppContext } from '../../contexts/AppContext'

import { Modal, ModalProps, Form, Input, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import styles from './styles.module.less'

import api from '../../api'

interface SaveGameModalProps extends ModalProps {
  studioId: StudioId
  game?: Game
  edit?: boolean
  onSave?: (savedGame: Game) => void
}

const SaveGameModal: React.FC<SaveGameModalProps> = ({
  visible = false,
  onCancel,
  afterClose,
  studioId,
  game,
  edit = false,
  onSave
}) => {
  const { app } = useContext(AppContext)

  const importGameDataJSONInput = useRef<HTMLInputElement>(null)
  const [saveGameForm] = Form.useForm()

  const [importingGameDataJSON, setImportingGameDataJSON] = useState(false),
    [importingGameDataJSONErrors, setImportingGameDataJSONErrors] = useState<
      string[]
    >([])

  function onImportGameDataJSON() {
    if (importGameDataJSONInput.current?.files) {
      setImportingGameDataJSON(true)

      const reader = new FileReader()

      reader.addEventListener('load', async () => {
        try {
          const errors = await importGameDataJSON(
            JSON.parse(reader.result as string) as GameDataJSON,
            studioId
          )

          if (errors.length === 0) {
            afterClose && afterClose()
            setImportingGameDataJSON(false)
          }

          if (errors.length > 0) {
            setImportingGameDataJSONErrors(errors)
          }
        } catch (error) {
          setImportingGameDataJSONErrors([
            'Unable to parse JSON. It is likely invalid or corrupt.'
          ])
        }
      })

      reader.readAsText(importGameDataJSONInput.current?.files[0])
    }
  }

  useEffect(() => {
    if (edit && game) {
      saveGameForm.setFieldsValue({
        title: game.title,
        designer: game.designer,
        version: game.version
      })
    }
  }, [visible])

  return (
    <Modal
      title={
        !importingGameDataJSON
          ? `${game && edit ? 'Edit' : 'New'} Game`
          : undefined
      }
      visible={visible}
      destroyOnClose
      onCancel={
        !importingGameDataJSON
          ? (event) => {
              setImportingGameDataJSON(false)
              setImportingGameDataJSONErrors([])

              onCancel && onCancel(event)
            }
          : undefined
      }
      centered
      closable={!importingGameDataJSON}
      footer={
        !edit
          ? !importingGameDataJSON && importingGameDataJSONErrors.length === 0
            ? [
                <Button
                  key="import"
                  style={{ position: 'absolute', left: '16px' }}
                  onClick={() => importGameDataJSONInput.current?.click()}
                >
                  Import JSON
                </Button>,
                <Button
                  key="cancel"
                  onClick={(event) => {
                    setImportingGameDataJSON(false)
                    setImportingGameDataJSONErrors([])

                    onCancel && onCancel(event)
                  }}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  form="save-game-form"
                  htmlType="submit"
                  onClick={(event) => {
                    event.preventDefault()
                    saveGameForm.submit()
                  }}
                >
                  Save
                </Button>
              ]
            : null
          : [
              <Button
                key="cancel"
                onClick={(event) => {
                  setImportingGameDataJSON(false)
                  setImportingGameDataJSONErrors([])

                  onCancel && onCancel(event)
                }}
              >
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                form="save-game-form"
                htmlType="submit"
                onClick={(event) => {
                  event.preventDefault()
                  saveGameForm.submit()
                }}
              >
                Save
              </Button>
            ]
      }
    >
      <>
        {importingGameDataJSONErrors.length === 0 && (
          <input
            ref={importGameDataJSONInput}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={onImportGameDataJSON}
          />
        )}

        {!importingGameDataJSON && importingGameDataJSONErrors.length === 0 && (
          <Form
            id="save-game-form"
            form={saveGameForm}
            preserve={false}
            onFinish={async ({
              title,
              designer,
              version
            }: {
              title: string
              designer: string
              version: string
            }) => {
              try {
                const savedGame = await api().games.saveGame(
                  studioId,
                  game && edit
                    ? { ...game, title, designer, version }
                    : {
                        title,
                        designer,
                        // TODO: Enable user-defined once more templates are supported.
                        template: GAME_TEMPLATE.ADVENTURE,
                        tags: [],
                        // TODO: Move to defines/types.
                        engine: app.version,
                        version: '0.0.1',
                        chapters: [],
                        jump: null
                      }
                )

                if (onSave) onSave(savedGame)
                if (afterClose) afterClose()
              } catch (error) {
                throw new Error(error)
              }
            }}
          >
            <Form.Item
              label="Game Title"
              name="title"
              rules={[{ required: true, message: 'Game title is required.' }]}
            >
              <Input autoFocus />
            </Form.Item>
            <Form.Item
              label="Designer"
              name="designer"
              rules={[{ required: true, message: 'Designer is required.' }]}
            >
              <Input />
            </Form.Item>

            {edit && (
              <Form.Item
                label="Version"
                name="version"
                rules={[{ required: true, message: 'Version is required.' }]}
              >
                <Input />
              </Form.Item>
            )}
          </Form>
        )}

        {importingGameDataJSON && (
          <div className={styles.importingGameDataJSONError}>
            {importingGameDataJSONErrors.length === 0 && (
              <>
                <div style={{ marginBottom: 20 }}>Importing Game Data</div>
                <LoadingOutlined style={{ fontSize: 24 }} spin />
              </>
            )}

            {importingGameDataJSONErrors.length > 0 && (
              <div>
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
                  {importingGameDataJSONErrors.map((error, index) => (
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
                <Button
                  type="primary"
                  onClick={() => {
                    setImportingGameDataJSON(false)
                    setImportingGameDataJSONErrors([])
                  }}
                >
                  Go Back
                </Button>
              </div>
            )}
          </div>
        )}
      </>
    </Modal>
  )
}

export default SaveGameModal
