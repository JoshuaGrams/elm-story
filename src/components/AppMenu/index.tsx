import { ipcRenderer } from 'electron'
import React, { useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useStudios } from '../../hooks'

import { StudioDocument } from '../../data/types'

import { WINDOW_EVENT_TYPE } from '../../lib/events'

import {
  AppContext,
  APP_ACTION_TYPE,
  APP_LOCATION
} from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import { Menu } from 'antd'

import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SolutionOutlined
} from '@ant-design/icons'

import StudioModalLayout, {
  STUDIO_MODAL_LAYOUT_TYPE
} from '../../layouts/StudioModal'
import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'

import styles from './styles.module.less'

const AppMenu: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { app, appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)

  const studios = useStudios([app.selectedStudioId])
  const [selectedStudio, setSelectedStudio] = useState<
    StudioDocument | undefined
  >(undefined)

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

                    modalDispatch({
                      type: MODAL_ACTION_TYPE.LAYOUT,
                      layout: (
                        <StudioModalLayout
                          type={STUDIO_MODAL_LAYOUT_TYPE.CREATE}
                          onCreate={(studioId) =>
                            appDispatch({
                              type: APP_ACTION_TYPE.STUDIO_SELECT,
                              selectedStudioId: studioId
                            })
                          }
                        />
                      )
                    })

                    modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
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

                        modalDispatch({
                          type: MODAL_ACTION_TYPE.LAYOUT,
                          layout: (
                            <StudioModalLayout
                              type={STUDIO_MODAL_LAYOUT_TYPE.EDIT}
                              studio={selectedStudio}
                            />
                          )
                        })

                        modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
                      }}
                    >
                      Edit
                    </Menu.Item>

                    <Menu.Item
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                        modalDispatch({
                          type: MODAL_ACTION_TYPE.LAYOUT,
                          layout: (
                            <StudioModalLayout
                              type={STUDIO_MODAL_LAYOUT_TYPE.REMOVE}
                              studio={selectedStudio}
                              onRemove={() =>
                                appDispatch({
                                  type: APP_ACTION_TYPE.STUDIO_SELECT,
                                  selectedStudioId: undefined
                                })
                              }
                            />
                          )
                        })

                        modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
                      }}
                    >
                      Remove
                    </Menu.Item>
                  </>
                )}
              </Menu.SubMenu>
            )}
            {app.selectedStudioId && (
              <Menu.SubMenu title="Games">
                <Menu.Item
                  icon={<SolutionOutlined />}
                  onClick={() => {
                    if (app.selectedStudioId) {
                      appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })

                      modalDispatch({
                        type: MODAL_ACTION_TYPE.LAYOUT,
                        layout: (
                          <GameModalLayout
                            studioId={app.selectedStudioId}
                            type={GAME_MODAL_LAYOUT_TYPE.CREATE}
                          />
                        )
                      })

                      modalDispatch({ type: MODAL_ACTION_TYPE.OPEN })
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
