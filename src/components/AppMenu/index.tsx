import { ipcRenderer } from 'electron'
import React, { useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useStudios } from '../../hooks'

import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { Studio } from '../../data/types'

import {
  AppContext,
  APP_ACTION_TYPE,
  APP_LOCATION
} from '../../contexts/AppContext'

import { Menu } from 'antd'
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons'

import { SaveStudioModal, RemoveStudioModal, SaveWorldModal } from '../Modal'

import styles from './styles.module.less'

const AppMenu: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { app, appDispatch } = useContext(AppContext)

  const studios = useStudios([app.selectedStudioId])

  const [selectedStudio, setSelectedStudio] = useState<Studio | undefined>(
      undefined
    ),
    [saveStudioModal, setSaveStudioModal] = useState({
      visible: false,
      edit: false
    }),
    [removeStudioModalVisible, setRemoveStudioModalVisible] = useState(false),
    [saveWorldModal, setSaveWorldModal] = useState({
      visible: false,
      edit: false
    })

  const { pathname } = useLocation()

  useEffect(() => {
    if (studios) {
      setSelectedStudio(
        app.selectedStudioId
          ? studios.filter((studio) => studio.id === app.selectedStudioId)[0]
          : undefined
      )
    }
  }, [studios, app.selectedStudioId])

  return (
    <>
      {/* MODALS */}
      <>
        <SaveStudioModal
          visible={saveStudioModal.visible}
          onCancel={() => setSaveStudioModal({ visible: false, edit: false })}
          afterClose={() => setSaveStudioModal({ visible: false, edit: false })}
          studio={selectedStudio}
          edit={saveStudioModal.edit}
          onSave={(studioId) =>
            appDispatch({
              type: APP_ACTION_TYPE.STUDIO_SELECT,
              selectedStudioId: studioId
            })
          }
        />

        {selectedStudio && (
          <RemoveStudioModal
            visible={removeStudioModalVisible}
            onCancel={() => setRemoveStudioModalVisible(false)}
            afterClose={() => setRemoveStudioModalVisible(false)}
            studio={selectedStudio}
            onRemove={() =>
              appDispatch({
                type: APP_ACTION_TYPE.STUDIO_SELECT,
                selectedStudioId: undefined
              })
            }
          />
        )}

        {app.selectedStudioId && (
          <SaveWorldModal
            visible={saveWorldModal.visible}
            onCancel={() => setSaveWorldModal({ visible: false, edit: false })}
            afterClose={() =>
              setSaveWorldModal({ visible: false, edit: false })
            }
            studioId={app.selectedStudioId}
            edit={saveWorldModal.edit}
          />
        )}
      </>

      {/* MENU */}
      {app.menuOpen && (
        <>
          {/* Blocks interaction to elements below; closes menu. */}
          <div
            className={`${styles.blocker} ${app.menuOpen && styles.blocking}`}
            onMouseDown={() =>
              appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })
            }
          />

          <Menu
            mode="vertical"
            className={`${styles.appMenu} ${
              app.fullscreen ? styles.fullscreen : styles.floating
            } ${className}`}
          >
            {pathname === APP_LOCATION.DASHBOARD && (
              <Menu.SubMenu title="Studios">
                <Menu.Item
                  icon={<UserAddOutlined />}
                  onClick={() => {
                    appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                    setSaveStudioModal({ visible: true, edit: false })
                  }}
                >
                  Create
                </Menu.Item>
                {app.selectedStudioId && (
                  <>
                    <Menu.Item
                      icon={<EditOutlined />}
                      onClick={() => {
                        appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                        setSaveStudioModal({ visible: true, edit: true })
                      }}
                    >
                      Edit
                    </Menu.Item>

                    <Menu.Item
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                        setRemoveStudioModalVisible(true)
                      }}
                    >
                      Remove
                    </Menu.Item>
                  </>
                )}
              </Menu.SubMenu>
            )}
            {app.selectedStudioId && (
              <Menu.SubMenu title="Worlds">
                <Menu.Item
                  icon={<PlusOutlined />}
                  onClick={() => {
                    if (app.selectedStudioId) {
                      appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                      setSaveWorldModal({ visible: true, edit: false })
                    }
                  }}
                >
                  Create
                </Menu.Item>
              </Menu.SubMenu>
            )}
            <Menu.Divider />
            <Menu.Item
              onClick={() => ipcRenderer.send(WINDOW_EVENT_TYPE.QUIT)}
              danger
            >
              Quit
            </Menu.Item>
          </Menu>
        </>
      )}
    </>
  )
}

export default AppMenu
