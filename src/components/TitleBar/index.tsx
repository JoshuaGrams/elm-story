import { ipcRenderer } from 'electron'
import { cloneDeep } from 'lodash'

import React, { useEffect, useRef, useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { WINDOW_EVENT_TYPE } from '../../lib/events'
import { PLATFORM_TYPE } from '../../data/types'

import {
  AppContext,
  APP_ACTION_TYPE,
  APP_LOCATION
} from '../../contexts/AppContext'

import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MinusOutlined,
  QuestionCircleFilled
} from '@ant-design/icons'

import { ESGModal } from '../Modal'
import ESGIcon from './ESGIcon'

import styles from './styles.module.less'

enum TITLE_BAR_BUTTON_TYPE {
  FLOATING = 'FLOATING',
  FULLSCREEN = 'FULLSCREEN',
  HELP = 'HELP',
  MENU = 'MENU',
  MINIMIZE = 'MINIMIZE',
  QUIT = 'QUIT'
}

interface TitleBarButtonProps extends React.HTMLProps<HTMLDivElement> {
  type: TITLE_BAR_BUTTON_TYPE
}

const TitleBarButton: React.FC<TitleBarButtonProps> = ({ onClick, type }) => {
  let buttonTitle,
    buttonIcon: JSX.Element = <></>

  switch (type) {
    case TITLE_BAR_BUTTON_TYPE.QUIT:
      buttonIcon = <CloseOutlined />
      buttonTitle = 'Quit'
      break
    case TITLE_BAR_BUTTON_TYPE.MINIMIZE:
      buttonIcon = <MinusOutlined />
      buttonTitle = 'Minimize'
      break
    case TITLE_BAR_BUTTON_TYPE.FULLSCREEN:
      buttonIcon = <FullscreenOutlined />
      buttonTitle = 'Enter Fullscreen'
      break
    case TITLE_BAR_BUTTON_TYPE.FLOATING:
      buttonIcon = <FullscreenExitOutlined />
      buttonTitle = 'Exit Fullscreen'
      break
    case TITLE_BAR_BUTTON_TYPE.HELP:
      buttonIcon = <QuestionCircleFilled />
      buttonTitle = 'Help'
      break
    case TITLE_BAR_BUTTON_TYPE.MENU:
      buttonTitle = 'Menu'
      break
    default:
      throw new Error('Unable to generate TitleBarButton. Missing type.')
  }

  return (
    <div
      className={`${styles.titleBarButton} ${
        type === TITLE_BAR_BUTTON_TYPE.HELP ? styles.helpButton : ''
      }`}
      title={buttonTitle}
      onClick={onClick}
    >
      {buttonIcon}
    </div>
  )
}

const TitleBar: React.FC = () => {
  const { pathname } = useLocation()
  const { app, appDispatch } = useContext(AppContext)
  /**
   * TODO: this is used to prevent toggling out of full screen
   * on development reload
   */
  const isFirstRun = useRef(true)

  const [esgModalVisible, setESGModalVisible] = useState(false),
    [appLocationTitle, setAppLocationTitle] = useState<'DASHBOARD' | 'EDITOR'>(
      'DASHBOARD'
    )

  const titleBarButtonData = [
    {
      type: TITLE_BAR_BUTTON_TYPE.QUIT,
      onClick: () => ipcRenderer.send(WINDOW_EVENT_TYPE.QUIT)
    },
    {
      type: TITLE_BAR_BUTTON_TYPE.MINIMIZE,
      onClick: () => ipcRenderer.send(WINDOW_EVENT_TYPE.MINIMIZE)
    },
    {
      type: app.fullscreen
        ? TITLE_BAR_BUTTON_TYPE.FLOATING
        : TITLE_BAR_BUTTON_TYPE.FULLSCREEN,
      onClick: () =>
        appDispatch({
          type: app.fullscreen
            ? APP_ACTION_TYPE.FLOATING
            : APP_ACTION_TYPE.FULLSCREEN
        })
    },
    {
      type: TITLE_BAR_BUTTON_TYPE.HELP,
      onClick: () => {
        let helpUrl

        switch (app.location) {
          case APP_LOCATION.DASHBOARD:
            helpUrl =
              'https://docs.elmstory.com/guides/production/dashboard/dashboard-overview'
            break
          case APP_LOCATION.EDITOR:
            helpUrl =
              'https://docs.elmstory.com/guides/production/editor/editor-overview'
            break
          default:
            helpUrl = 'https://docs.elmstory.com'
            break
        }

        ipcRenderer.send(WINDOW_EVENT_TYPE.OPEN_EXTERNAL_LINK, [helpUrl])
      }
    }
  ]

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
    } else {
      ipcRenderer.send(WINDOW_EVENT_TYPE.TOGGLE_FULLSCREEN, app.fullscreen)
    }
  }, [app.fullscreen])

  useEffect(() => {
    ipcRenderer.on(WINDOW_EVENT_TYPE.FULLSCREEN, () =>
      appDispatch({ type: APP_ACTION_TYPE.FULLSCREEN })
    )
    ipcRenderer.on(WINDOW_EVENT_TYPE.FLOAT, () =>
      appDispatch({ type: APP_ACTION_TYPE.FLOATING })
    )
  }, [])

  useEffect(() => {
    switch (pathname) {
      case APP_LOCATION.DASHBOARD:
        appDispatch({
          type: APP_ACTION_TYPE.SET_LOCATION,
          location: APP_LOCATION.DASHBOARD
        })

        setAppLocationTitle('DASHBOARD')
        break
      case APP_LOCATION.EDITOR:
        appDispatch({
          type: APP_ACTION_TYPE.SET_LOCATION,
          location: APP_LOCATION.EDITOR
        })

        setAppLocationTitle('EDITOR')
        break
      default:
        break
    }
  }, [pathname])

  return (
    <>
      <ESGModal
        visible={esgModalVisible}
        onCancel={() => setESGModalVisible(false)}
      />

      <div className={styles.titleBar}>
        {!app.fullscreen && (
          <div
            className={styles.dragBar}
            style={{
              left: app.platform === PLATFORM_TYPE.MACOS ? '103px' : '34px',
              right: app.platform !== PLATFORM_TYPE.MACOS ? '103px' : '34px'
            }}
          />
        )}

        <div
          className={styles.titleBarButtonsContainer}
          style={{
            left: app.platform === PLATFORM_TYPE.MACOS ? '10px' : 'initial',
            right: app.platform !== PLATFORM_TYPE.MACOS ? '10px' : 'initial'
          }}
        >
          {app.platform === PLATFORM_TYPE.MACOS &&
            titleBarButtonData.map(
              (data, index) =>
                (index !== 1 || (index === 1 && !app.fullscreen)) && (
                  <TitleBarButton
                    key={data.type}
                    type={data.type}
                    onClick={data.onClick}
                  />
                )
            )}

          {app.platform !== PLATFORM_TYPE.MACOS &&
            cloneDeep(titleBarButtonData)
              .reverse()
              .map(
                (data, index) =>
                  (index !== 2 || (index === 2 && !app.fullscreen)) && (
                    <TitleBarButton
                      key={data.type}
                      type={data.type}
                      onClick={data.onClick}
                    />
                  )
              )}

          {/* #137 */}
          {/* <TitleBarButton
          type={TITLE_BAR_BUTTON_TYPE.MENU}
          onClick={() =>
            appDispatch({
              type: app.menuOpen
                ? APP_ACTION_TYPE.MENU_CLOSE
                : APP_ACTION_TYPE.MENU_OPEN
            })
          }
        /> */}
        </div>

        <header>ELM STORY : {appLocationTitle}</header>

        <div
          className={styles.titleBarIcon}
          style={{
            right: app.platform === PLATFORM_TYPE.MACOS ? '15px' : 'initial',
            left: app.platform !== PLATFORM_TYPE.MACOS ? '15px' : 'initial'
          }}
          onClick={() => setESGModalVisible(true)}
        >
          <ESGIcon />
        </div>
      </div>
    </>
  )
}

export default TitleBar
