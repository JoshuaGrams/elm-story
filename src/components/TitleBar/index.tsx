import { ipcRenderer } from 'electron'
import React, { useEffect, useRef, useContext } from 'react'

import { WINDOW_EVENTS } from '../../lib/events'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'

import styles from './styles.module.scss'

enum TITLE_BAR_BUTTON_TYPE {
  QUIT = 0,
  MINIMIZE = 1,
  FULLSCREEN = 2,
  FLOATING = 3
}

interface TitleBarButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  type: TITLE_BAR_BUTTON_TYPE
}

const TitleBarButton = ({ onClick, type }: TitleBarButtonProps) => {
  let buttonStyle, buttonTitle

  switch (type) {
    case TITLE_BAR_BUTTON_TYPE.QUIT:
      buttonStyle = styles.quitButton
      buttonTitle = 'Quit'
      break
    case TITLE_BAR_BUTTON_TYPE.MINIMIZE:
      buttonStyle = styles.minimizeButton
      buttonTitle = 'Minimize'
      break
    case TITLE_BAR_BUTTON_TYPE.FULLSCREEN:
      buttonStyle = styles.fullscreenButton
      buttonTitle = 'Enter Fullscreen'
      break
    case TITLE_BAR_BUTTON_TYPE.FLOATING:
      buttonStyle = styles.floatingButton
      buttonTitle = 'Exit Fullscreen'
      break
    default:
      throw new Error('Unable to generate TitleBarButton. Missing type.')
  }

  return (
    <div
      className={`${styles.titleBarButton} ${buttonStyle}`}
      title={buttonTitle}
      onClick={onClick}
    />
  )
}

export default () => {
  const { app, appDispatch } = useContext(AppContext)
  /**
   * TODO: this is used to prevent toggling out of full screen
   * on development reload
   */
  const isFirstRun = useRef(true)

  useEffect(() => {
    ipcRenderer.on(WINDOW_EVENTS.FULLSCREEN, () =>
      appDispatch({ type: APP_ACTION_TYPE.FULLSCREEN })
    )
    ipcRenderer.on(WINDOW_EVENTS.FLOAT, () =>
      appDispatch({ type: APP_ACTION_TYPE.FLOATING })
    )
  }, [])

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
    } else {
      ipcRenderer.send(WINDOW_EVENTS.TOGGLE_FULLSCREEN, app.fullscreen)
    }
  }, [app.fullscreen])

  return (
    <div className={styles.titleBar}>
      <div className={styles.titleBarButtonsContainer}>
        <TitleBarButton
          type={TITLE_BAR_BUTTON_TYPE.QUIT}
          onClick={() => ipcRenderer.send(WINDOW_EVENTS.QUIT)}
        />
        {!app.fullscreen ? (
          <TitleBarButton
            type={TITLE_BAR_BUTTON_TYPE.MINIMIZE}
            onClick={() => ipcRenderer.send(WINDOW_EVENTS.MINIMIZE)}
          />
        ) : null}
        <TitleBarButton
          type={
            app.fullscreen
              ? TITLE_BAR_BUTTON_TYPE.FLOATING
              : TITLE_BAR_BUTTON_TYPE.FULLSCREEN
          }
          onClick={() =>
            appDispatch({
              type: app.fullscreen
                ? APP_ACTION_TYPE.FLOATING
                : APP_ACTION_TYPE.FULLSCREEN
            })
          }
        />
      </div>
      <header>{app.header}</header>
    </div>
  )
}
