import { ipcRenderer } from 'electron'
import React, { useContext } from 'react'

import { WINDOW_EVENT_TYPE } from '../../lib/events'

import { AppContext, APP_ACTION_TYPE } from '../../contexts/AppContext'
import { ModalContext, MODAL_ACTION_TYPE } from '../../contexts/AppModalContext'

import Transition, { TRANSITION_TYPE } from '../Transition'
import Button, { ButtonProps } from '../Button'

import styles from './styles.module.scss'

import StudioModalLayout, {
  STUDIO_MODAL_LAYOUT_TYPE
} from '../../layouts/StudioModal'
import GameModalLayout, {
  GAME_MODAL_LAYOUT_TYPE
} from '../../layouts/GameModal'

interface AppMenuRowProps extends ButtonProps {
  title: string
}

const MenuButton: React.FC<AppMenuRowProps> = ({
  title,
  onClick,
  destroy = false,
  disabled = false
}) => {
  return (
    <Button
      className={styles.row}
      onClick={onClick}
      destroy={destroy}
      disabled={disabled}
    >
      {title}
    </Button>
  )
}

const MenuVerticalSpacer: React.FC = () => {
  return <div className={styles.spacer} />
}

const AppMenu: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { app, appDispatch } = useContext(AppContext)
  const { modalDispatch } = useContext(ModalContext)

  return (
    <>
      {/* Blocks interaction to elements below; closes menu. */}
      <Transition in={app.menuOpen} type={TRANSITION_TYPE.SNAP}>
        <div
          className={`${styles.blocker} ${app.menuOpen && styles.blocking}`}
          onMouseDown={() => appDispatch({ type: APP_ACTION_TYPE.MENU_CLOSE })}
        />
      </Transition>

      <Transition in={app.menuOpen} type={TRANSITION_TYPE.FADE}>
        <div
          className={`${styles.appMenu} ${
            app.fullscreen ? styles.fullscreen : styles.floating
          } ${className}`}
        >
          <MenuButton
            title="Create Studio..."
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
          />

          <MenuVerticalSpacer />

          {app.selectedStudioId && (
            <>
              <MenuButton
                title="Create Game..."
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
                primary
              />

              <MenuVerticalSpacer />
            </>
          )}

          <MenuButton
            title="Quit"
            destroy
            onClick={() => ipcRenderer.send(WINDOW_EVENT_TYPE.QUIT)}
          />
        </div>
      </Transition>
    </>
  )
}

export default AppMenu
